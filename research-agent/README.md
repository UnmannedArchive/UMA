# Research Agent — Demographic Analysis from Crunchbase Profiles

Reads an Excel spreadsheet with Crunchbase profile URLs, visits each profile, and uses GPT-4o vision to estimate **gender** and **ethnicity** from the profile picture and name.

## Setup

### 1. Install Python dependencies

```bash
cd research-agent
pip install -r requirements.txt
```

### 2. Install Playwright browser

```bash
playwright install chromium
```

### 3. Set your OpenAI API key

```bash
export OPENAI_API_KEY="sk-your-key-here"
```

## Excel Format

Your input `.xlsx` file needs a column with Crunchbase URLs. A name column is optional (the agent will scrape names from profiles if missing).

| Name (optional) | Crunchbase URL                              |
|------------------|---------------------------------------------|
| Jane Doe         | https://crunchbase.com/person/jane-doe      |
| John Smith       | https://crunchbase.com/person/john-smith    |

The agent auto-detects columns by looking for "crunchbase" or "cb" in the header (case-insensitive).

## Usage

```bash
# Basic usage (headless browser)
python agent.py my_data.xlsx

# Custom output file
python agent.py my_data.xlsx -o results.xlsx

# Show the browser window (useful for debugging)
python agent.py my_data.xlsx --no-headless
```

## Output

The agent adds three new columns to your spreadsheet:

- **estimated_gender** — Male / Female / Unknown
- **estimated_ethnicity** — e.g. White/Caucasian, East Asian, South Asian, etc.
- **confidence** — Low / Medium / High

Results are saved to `<input_filename>_results.xlsx` by default.

Screenshots of each profile are saved in the `screenshots/` folder for reference.

## Notes

- Random delays (2-4s) between requests to avoid rate-limiting
- If no profile image can be extracted, falls back to name-only analysis
- These are **estimates** — treat results as approximate
