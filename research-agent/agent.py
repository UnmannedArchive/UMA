import argparse
import asyncio
import base64
import json
import os
import random
import sys
import time
from pathlib import Path

import anthropic
import pandas as pd
from playwright.async_api import async_playwright

SCREENSHOT_DIR = Path("screenshots")

ANALYSIS_PROMPT = """Based on the profile image and the person's name provided, estimate:

1. Gender: Male or Female
2. Ethnicity: Use EXACTLY one of these categories — White, Black, Hispanic, Asian, Middle Eastern, Pacific Islander, or Unknown

Person's name: {name}

Respond in EXACTLY this JSON format, no other text:
{{"gender": "Male or Female", "ethnicity": "one of the categories above", "confidence": "Low or Medium or High"}}
"""

ANALYSIS_PROMPT_NAME_ONLY = """Based ONLY on the person's name, estimate:

1. Gender: Male or Female
2. Ethnicity: Use EXACTLY one of these categories — White, Black, Hispanic, Asian, Middle Eastern, Pacific Islander, or Unknown

Person's name: {name}

Respond in EXACTLY this JSON format, no other text:
{{"gender": "Male or Female", "ethnicity": "one of the categories above", "confidence": "Low or Medium or High"}}
"""


def read_excel(filepath: str) -> pd.DataFrame:
    return pd.read_excel(filepath)


def needs_processing(row) -> bool:
    return pd.isna(row.get("race")) or pd.isna(row.get("sex"))


def encode_image_to_base64(image_bytes: bytes) -> str:
    return base64.b64encode(image_bytes).decode("utf-8")


async def visit_crunchbase(page, url: str, row_idx: int) -> dict:
    result = {"name": None, "profile_image": None}

    if not url or pd.isna(url) or str(url).strip() == "":
        return result

    url = str(url).strip()
    if not url.startswith("http"):
        url = "https://" + url

    try:
        await page.goto(url, wait_until="domcontentloaded", timeout=30000)
        await asyncio.sleep(random.uniform(2, 4))

        screenshot_path = SCREENSHOT_DIR / f"row{row_idx}.png"
        await page.screenshot(path=str(screenshot_path), full_page=False)

        result["name"] = await extract_name(page)
        result["profile_image"] = await extract_profile_image(page)

    except Exception as e:
        print(f"    Error: {e}")

    return result


async def extract_name(page) -> str | None:
    selectors = [
        "h1.profile-name",
        'h1[class*="name"]',
        '[data-test="entity-name"]',
        "h1",
    ]
    for sel in selectors:
        try:
            el = await page.query_selector(sel)
            if el:
                text = await el.inner_text()
                if text and text.strip():
                    return text.strip()
        except Exception:
            continue
    return None


async def extract_profile_image(page) -> bytes | None:
    selectors = [
        'img[class*="profile"]',
        'img[class*="avatar"]',
        'img[class*="person"]',
        'img[class*="photo"]',
        'img[alt*="profile"]',
    ]

    for sel in selectors:
        try:
            el = await page.query_selector(sel)
            if el:
                src = await el.get_attribute("src")
                if src and src.startswith("http"):
                    resp = await page.context.request.get(src)
                    if resp.ok:
                        return await resp.body()
        except Exception:
            continue

    try:
        return await page.screenshot(clip={"x": 0, "y": 0, "width": 600, "height": 600})
    except Exception:
        return None


def analyze_with_claude(client: anthropic.Anthropic, name: str, image_bytes: bytes | None) -> dict:
    result = {"gender": None, "ethnicity": None, "confidence": "Low"}

    content = []

    if image_bytes:
        b64 = encode_image_to_base64(image_bytes)
        content.append({
            "type": "image",
            "source": {
                "type": "base64",
                "media_type": "image/png",
                "data": b64,
            },
        })
        content.append({
            "type": "text",
            "text": ANALYSIS_PROMPT.format(name=name or "Unknown"),
        })
    elif name:
        content.append({
            "type": "text",
            "text": ANALYSIS_PROMPT_NAME_ONLY.format(name=name),
        })
    else:
        return result

    try:
        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=100,
            messages=[{"role": "user", "content": content}],
        )
        text = response.content[0].text.strip()
        parsed = json.loads(text)
        result["gender"] = parsed.get("gender")
        result["ethnicity"] = parsed.get("ethnicity")
        result["confidence"] = parsed.get("confidence", "Low")
    except json.JSONDecodeError:
        result = parse_fallback(text)
    except Exception as e:
        print(f"    Claude API error: {e}")

    return result


def parse_fallback(text: str) -> dict:
    result = {"gender": None, "ethnicity": None, "confidence": "Low"}
    for line in text.split("\n"):
        line = line.strip()
        if "gender" in line.lower():
            for g in ["Male", "Female"]:
                if g.lower() in line.lower():
                    result["gender"] = g
        if "ethnicity" in line.lower():
            for e in ["White", "Black", "Hispanic", "Asian", "Middle Eastern", "Pacific Islander"]:
                if e.lower() in line.lower():
                    result["ethnicity"] = e
    return result


def map_to_spreadsheet(analysis: dict) -> dict:
    gender = (analysis.get("gender") or "").strip()
    ethnicity = (analysis.get("ethnicity") or "").strip()

    sex = None
    female_genderize = 0
    if gender.lower() == "female":
        sex = "female"
        female_genderize = 1
    elif gender.lower() == "male":
        sex = "male"
        female_genderize = 0

    race = ethnicity if ethnicity and ethnicity != "Unknown" else None
    asian = 1 if ethnicity == "Asian" else 0
    black = 1 if ethnicity == "Black" else 0
    hispanic = 1 if ethnicity == "Hispanic" else 0

    return {
        "sex": sex,
        "female_genderize": female_genderize,
        "race": race,
        "asian": asian,
        "black": black,
        "hispanic": hispanic,
    }


async def process_spreadsheet(filepath: str, output_path: str, headless: bool = True, batch_size: int = 50):
    print(f"Reading {filepath}...")
    df = read_excel(filepath)
    total = len(df)

    to_process = [i for i, row in df.iterrows() if needs_processing(row)]
    print(f"Total rows: {total}")
    print(f"Already done: {total - len(to_process)}")
    print(f"Need processing: {len(to_process)}")
    print()

    if not to_process:
        print("Nothing to do — all rows already have race/sex filled in.")
        return

    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        print("ERROR: Set your ANTHROPIC_API_KEY environment variable.")
        print("  export ANTHROPIC_API_KEY='sk-ant-...'")
        sys.exit(1)

    client = anthropic.Anthropic(api_key=api_key)
    SCREENSHOT_DIR.mkdir(exist_ok=True)

    processed = 0
    start_time = time.time()

    async with async_playwright() as pw:
        browser = await pw.chromium.launch(
            headless=headless,
            args=["--disable-blink-features=AutomationControlled"],
        )
        context = await browser.new_context(
            viewport={"width": 1280, "height": 900},
            user_agent=(
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/120.0.0.0 Safari/537.36"
            ),
        )
        page = await context.new_page()

        for idx in to_process:
            row = df.loc[idx]
            cb_url = row.get("cb_url", "")
            name = row.get("name", "")
            if pd.isna(name):
                name = f"{row.get('first_name', '')} {row.get('last_name', '')}".strip()

            processed += 1
            print(f"[{processed}/{len(to_process)}] {name or 'Unknown'}")

            profile_image = None

            if cb_url and pd.notna(cb_url):
                print(f"    Visiting: {cb_url}")
                cb_result = await visit_crunchbase(page, cb_url, idx)
                profile_image = cb_result.get("profile_image")
                if cb_result.get("name") and not name:
                    name = cb_result["name"]

            print(f"    Analyzing...")
            analysis = analyze_with_claude(client, name, profile_image)
            mapped = map_to_spreadsheet(analysis)

            df.at[idx, "sex"] = mapped["sex"]
            df.at[idx, "female_genderize"] = mapped["female_genderize"]
            df.at[idx, "race"] = mapped["race"]
            df.at[idx, "asian"] = mapped["asian"]
            df.at[idx, "black"] = mapped["black"]
            df.at[idx, "hispanic"] = mapped["hispanic"]

            print(f"    -> Sex: {mapped['sex']}, Race: {mapped['race']} (confidence: {analysis.get('confidence', '?')})")

            if processed % batch_size == 0:
                df.to_excel(output_path, index=False)
                elapsed = time.time() - start_time
                rate = processed / elapsed * 60
                remaining = (len(to_process) - processed) / rate if rate > 0 else 0
                print(f"\n    --- Saved progress: {processed}/{len(to_process)} done ({rate:.0f}/min, ~{remaining:.0f} min left) ---\n")

            await asyncio.sleep(random.uniform(2, 4))

        await browser.close()

    df.to_excel(output_path, index=False)
    elapsed = time.time() - start_time
    print(f"\nDone! Processed {processed} rows in {elapsed/60:.1f} minutes.")
    print(f"Results saved to {output_path}")


def main():
    parser = argparse.ArgumentParser(
        description="Research agent: analyze demographics from Crunchbase profiles"
    )
    parser.add_argument("input", help="Path to the input Excel file (.xlsx)")
    parser.add_argument(
        "-o", "--output",
        help="Output Excel file path (default: <input>_results.xlsx)",
        default=None,
    )
    parser.add_argument(
        "--no-headless",
        action="store_true",
        help="Show the browser window",
    )
    parser.add_argument(
        "--batch-size",
        type=int,
        default=50,
        help="Save progress every N rows (default: 50)",
    )
    args = parser.parse_args()

    if not args.output:
        stem = Path(args.input).stem
        args.output = f"{stem}_results.xlsx"

    asyncio.run(process_spreadsheet(args.input, args.output, headless=not args.no_headless, batch_size=args.batch_size))


if __name__ == "__main__":
    main()
