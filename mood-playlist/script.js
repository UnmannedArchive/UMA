// ============================================
// MOODWAVE — Playlist Generator Engine
// ============================================

// --- Mood color themes (hue for ambient blobs) ---
const moodThemes = {
  happy:     { hue: 45,  name: 'Sunshine State',    playlistName: 'Golden Hour Mix' },
  sad:       { hue: 220, name: 'In My Feelings',     playlistName: 'Rainy Window Playlist' },
  chill:     { hue: 175, name: 'Low-Key Vibes',      playlistName: 'Sunday Drift' },
  energetic: { hue: 350, name: 'Full Send',           playlistName: 'Adrenaline Rush' },
  romantic:  { hue: 330, name: 'Heart Eyes',           playlistName: 'Late Night Love' },
  angry:     { hue: 0,   name: 'Rage Mode',           playlistName: 'Burn It Down' },
  focused:   { hue: 260, name: 'Locked In',           playlistName: 'Deep Focus Zone' },
  nostalgic: { hue: 30,  name: 'Time Machine',        playlistName: 'Throwback Tape' },
};

// --- Song database organized by mood ---
const songDatabase = {
  happy: [
    { title: "Good as Hell", artist: "Lizzo", duration: "2:39" },
    { title: "Levitating", artist: "Dua Lipa", duration: "3:23" },
    { title: "Walking on Sunshine", artist: "Katrina & The Waves", duration: "3:58" },
    { title: "Happy", artist: "Pharrell Williams", duration: "3:53" },
    { title: "Uptown Funk", artist: "Bruno Mars ft. Mark Ronson", duration: "4:30" },
    { title: "Can't Stop the Feeling", artist: "Justin Timberlake", duration: "3:56" },
    { title: "Juice", artist: "Lizzo", duration: "3:15" },
    { title: "Shake It Off", artist: "Taylor Swift", duration: "3:39" },
    { title: "Don't Stop Me Now", artist: "Queen", duration: "3:29" },
    { title: "Feeling Good", artist: "Michael Bublé", duration: "3:30" },
    { title: "Three Little Birds", artist: "Bob Marley", duration: "3:00" },
    { title: "Here Comes the Sun", artist: "The Beatles", duration: "3:05" },
    { title: "Best Day of My Life", artist: "American Authors", duration: "3:14" },
    { title: "On Top of the World", artist: "Imagine Dragons", duration: "3:12" },
    { title: "Sunflower", artist: "Post Malone, Swae Lee", duration: "2:38" },
  ],
  sad: [
    { title: "Someone Like You", artist: "Adele", duration: "4:45" },
    { title: "Heather", artist: "Conan Gray", duration: "3:18" },
    { title: "Skinny Love", artist: "Bon Iver", duration: "3:58" },
    { title: "drivers license", artist: "Olivia Rodrigo", duration: "4:02" },
    { title: "The Night We Met", artist: "Lord Huron", duration: "3:28" },
    { title: "Say Something", artist: "A Great Big World", duration: "3:50" },
    { title: "Liability", artist: "Lorde", duration: "2:52" },
    { title: "Tears Dry on Their Own", artist: "Amy Winehouse", duration: "3:06" },
    { title: "All I Want", artist: "Kodaline", duration: "5:07" },
    { title: "Let Her Go", artist: "Passenger", duration: "4:12" },
    { title: "Hurt", artist: "Johnny Cash", duration: "3:38" },
    { title: "Wish You Were Here", artist: "Pink Floyd", duration: "5:34" },
    { title: "Creep", artist: "Radiohead", duration: "3:56" },
    { title: "Mad World", artist: "Gary Jules", duration: "3:06" },
    { title: "Everybody Hurts", artist: "R.E.M.", duration: "5:17" },
  ],
  chill: [
    { title: "Electric Feel", artist: "MGMT", duration: "3:49" },
    { title: "Tongue Tied", artist: "Grouplove", duration: "3:38" },
    { title: "Sweater Weather", artist: "The Neighbourhood", duration: "4:00" },
    { title: "Redbone", artist: "Childish Gambino", duration: "5:26" },
    { title: "Put Your Records On", artist: "Corinne Bailey Rae", duration: "3:35" },
    { title: "Banana Pancakes", artist: "Jack Johnson", duration: "3:12" },
    { title: "Feels Like Summer", artist: "Childish Gambino", duration: "3:29" },
    { title: "Ivy", artist: "Frank Ocean", duration: "4:09" },
    { title: "Pink + White", artist: "Frank Ocean", duration: "3:04" },
    { title: "Lost in Japan", artist: "Shawn Mendes", duration: "3:22" },
    { title: "Bloom", artist: "The Paper Kites", duration: "3:30" },
    { title: "Flume", artist: "Bon Iver", duration: "3:39" },
    { title: "Tokyo Drifting", artist: "Glass Animals", duration: "3:05" },
    { title: "Sunset Lover", artist: "Petit Biscuit", duration: "3:28" },
    { title: "Dreams", artist: "Fleetwood Mac", duration: "4:14" },
  ],
  energetic: [
    { title: "Blinding Lights", artist: "The Weeknd", duration: "3:20" },
    { title: "Physical", artist: "Dua Lipa", duration: "3:13" },
    { title: "Lose Yourself", artist: "Eminem", duration: "5:26" },
    { title: "Eye of the Tiger", artist: "Survivor", duration: "4:04" },
    { title: "Stronger", artist: "Kanye West", duration: "5:12" },
    { title: "HUMBLE.", artist: "Kendrick Lamar", duration: "2:57" },
    { title: "Run This Town", artist: "JAY-Z, Rihanna, Kanye West", duration: "4:27" },
    { title: "Sicko Mode", artist: "Travis Scott", duration: "5:12" },
    { title: "Can't Hold Us", artist: "Macklemore & Ryan Lewis", duration: "4:18" },
    { title: "Enter Sandman", artist: "Metallica", duration: "5:31" },
    { title: "Thunder", artist: "Imagine Dragons", duration: "3:07" },
    { title: "Power", artist: "Kanye West", duration: "4:52" },
    { title: "DNA.", artist: "Kendrick Lamar", duration: "3:05" },
    { title: "Congratulations", artist: "Post Malone", duration: "3:40" },
    { title: "Till I Collapse", artist: "Eminem ft. Nate Dogg", duration: "4:57" },
  ],
  romantic: [
    { title: "Thinking Out Loud", artist: "Ed Sheeran", duration: "4:41" },
    { title: "At Last", artist: "Etta James", duration: "3:01" },
    { title: "All of Me", artist: "John Legend", duration: "4:29" },
    { title: "Adorn", artist: "Miguel", duration: "3:13" },
    { title: "Kiss Me", artist: "Sixpence None the Richer", duration: "3:28" },
    { title: "L-O-V-E", artist: "Nat King Cole", duration: "2:32" },
    { title: "Let's Stay Together", artist: "Al Green", duration: "3:18" },
    { title: "Best Part", artist: "Daniel Caesar ft. H.E.R.", duration: "3:29" },
    { title: "Lover", artist: "Taylor Swift", duration: "3:41" },
    { title: "Dangerously in Love", artist: "Beyoncé", duration: "4:03" },
    { title: "Die With A Smile", artist: "Lady Gaga, Bruno Mars", duration: "4:12" },
    { title: "Perfect", artist: "Ed Sheeran", duration: "4:23" },
    { title: "Eternal Flame", artist: "The Bangles", duration: "3:51" },
    { title: "Your Song", artist: "Elton John", duration: "4:01" },
    { title: "Can't Help Falling in Love", artist: "Elvis Presley", duration: "3:00" },
  ],
  angry: [
    { title: "Break Stuff", artist: "Limp Bizkit", duration: "2:46" },
    { title: "Killing in the Name", artist: "Rage Against the Machine", duration: "5:13" },
    { title: "Bulls on Parade", artist: "Rage Against the Machine", duration: "3:52" },
    { title: "Given Up", artist: "Linkin Park", duration: "3:09" },
    { title: "Down with the Sickness", artist: "Disturbed", duration: "4:38" },
    { title: "Chop Suey!", artist: "System of a Down", duration: "3:30" },
    { title: "Last Resort", artist: "Papa Roach", duration: "3:19" },
    { title: "Smells Like Teen Spirit", artist: "Nirvana", duration: "5:01" },
    { title: "Platypus (I Hate You)", artist: "Green Day", duration: "2:22" },
    { title: "The Way I Am", artist: "Eminem", duration: "4:50" },
    { title: "Walk", artist: "Pantera", duration: "5:16" },
    { title: "Master of Puppets", artist: "Metallica", duration: "8:35" },
    { title: "Bodies", artist: "Drowning Pool", duration: "3:22" },
    { title: "Duality", artist: "Slipknot", duration: "4:12" },
    { title: "Du Hast", artist: "Rammstein", duration: "3:54" },
  ],
  focused: [
    { title: "Intro", artist: "The xx", duration: "2:07" },
    { title: "Experience", artist: "Ludovico Einaudi", duration: "5:15" },
    { title: "Weightless", artist: "Marconi Union", duration: "8:09" },
    { title: "Nuvole Bianche", artist: "Ludovico Einaudi", duration: "5:57" },
    { title: "Crystals", artist: "M.O.O.N.", duration: "2:50" },
    { title: "Midnight City", artist: "M83", duration: "4:03" },
    { title: "Tadow", artist: "Masego, FKJ", duration: "5:45" },
    { title: "Resonance", artist: "HOME", duration: "3:32" },
    { title: "Breathe", artist: "Télépopmusik", duration: "4:38" },
    { title: "Saturn", artist: "Sleeping at Last", duration: "4:47" },
    { title: "Claire de Lune", artist: "Debussy", duration: "5:00" },
    { title: "Time", artist: "Hans Zimmer", duration: "4:35" },
    { title: "Clair De Lune", artist: "Flight Facilities", duration: "4:10" },
    { title: "On the Nature of Daylight", artist: "Max Richter", duration: "5:59" },
    { title: "An Ending (Ascent)", artist: "Brian Eno", duration: "4:24" },
  ],
  nostalgic: [
    { title: "Mr. Brightside", artist: "The Killers", duration: "3:42" },
    { title: "Wonderwall", artist: "Oasis", duration: "4:18" },
    { title: "Semi-Charmed Life", artist: "Third Eye Blind", duration: "4:28" },
    { title: "1979", artist: "The Smashing Pumpkins", duration: "4:26" },
    { title: "Dreams", artist: "The Cranberries", duration: "4:32" },
    { title: "Bitter Sweet Symphony", artist: "The Verve", duration: "5:58" },
    { title: "Teenage Dirtbag", artist: "Wheatus", duration: "4:03" },
    { title: "Hey Ya!", artist: "OutKast", duration: "3:55" },
    { title: "Iris", artist: "Goo Goo Dolls", duration: "4:49" },
    { title: "Under the Bridge", artist: "Red Hot Chili Peppers", duration: "4:24" },
    { title: "Fast Car", artist: "Tracy Chapman", duration: "4:57" },
    { title: "Summertime Sadness", artist: "Lana Del Rey", duration: "4:25" },
    { title: "Video Games", artist: "Lana Del Rey", duration: "4:42" },
    { title: "Space Song", artist: "Beach House", duration: "5:22" },
    { title: "Ribs", artist: "Lorde", duration: "4:23" },
  ],
};

// --- State ---
let currentMood = null;
let currentIntensity = 3;
let currentPlaylist = [];

// --- DOM Refs ---
const views = {
  mood: document.getElementById('mood-select'),
  intensity: document.getElementById('intensity-select'),
  loading: document.getElementById('loading-view'),
  playlist: document.getElementById('playlist-view'),
};

// --- View transitions ---
function showView(viewName) {
  Object.values(views).forEach(v => v.classList.remove('active'));
  views[viewName].classList.add('active');
}

function showMoodSelect() {
  // Reset selection
  document.querySelectorAll('.mood-card').forEach(c => c.classList.remove('selected'));
  currentMood = null;
  updateAmbient(260);
  showView('mood');
}

// --- Step 1: Select mood ---
function selectMood(card) {
  // Visual selection
  document.querySelectorAll('.mood-card').forEach(c => c.classList.remove('selected'));
  card.classList.add('selected');

  const mood = card.dataset.mood;
  currentMood = mood;

  // Update ambient colors
  const theme = moodThemes[mood];
  updateAmbient(theme.hue);

  // Update intensity label
  document.getElementById('mood-label').textContent = mood;

  // Transition to intensity after a short beat
  setTimeout(() => {
    showView('intensity');
  }, 400);
}

// --- Update ambient background blobs ---
function updateAmbient(hue) {
  document.documentElement.style.setProperty('--accent-h', hue);
}

// --- Intensity slider ---
const slider = document.getElementById('intensity');
const sliderTrack = document.getElementById('slider-track');

function updateSliderTrack() {
  const value = slider.value;
  const pct = ((value - 1) / 4) * 100;
  sliderTrack.style.width = pct + '%';
  currentIntensity = parseInt(value);
}

slider.addEventListener('input', updateSliderTrack);
updateSliderTrack();

// --- Step 2: Generate playlist ---
function generatePlaylist() {
  if (!currentMood) return;

  showView('loading');

  // Simulate generation delay
  setTimeout(() => {
    buildPlaylist();
    showView('playlist');
  }, 1800);
}

// --- Build playlist from mood + intensity ---
function buildPlaylist() {
  const theme = moodThemes[currentMood];
  const songs = [...songDatabase[currentMood]];

  // Number of tracks based on intensity: 6 to 14
  const trackCount = 6 + Math.round((currentIntensity / 5) * 8);

  // Shuffle songs
  shuffleArray(songs);

  // Take the right number
  currentPlaylist = songs.slice(0, Math.min(trackCount, songs.length));

  // Calculate total duration
  const totalMinutes = currentPlaylist.reduce((sum, s) => {
    const [m, sec] = s.duration.split(':').map(Number);
    return sum + m + sec / 60;
  }, 0);

  // Update header
  document.getElementById('playlist-tag').textContent = theme.name;
  document.getElementById('playlist-name').textContent = theme.playlistName;
  document.getElementById('playlist-meta').textContent =
    `${currentPlaylist.length} tracks · ~${Math.round(totalMinutes)} min`;

  // Update cover gradient
  const cover = document.getElementById('playlist-cover');
  cover.style.background = `linear-gradient(135deg, 
    hsl(${theme.hue}, 70%, 45%), 
    hsl(${theme.hue + 60}, 60%, 35%))`;

  renderTracks();
}

// --- Render track list ---
function renderTracks() {
  const list = document.getElementById('track-list');
  list.innerHTML = '';

  currentPlaylist.forEach((track, i) => {
    const el = document.createElement('div');
    el.className = 'track';
    el.style.animationDelay = `${i * 0.05}s`;
    el.innerHTML = `
      <span class="track-num">${i + 1}</span>
      <div class="track-info">
        <span class="track-title">${track.title}</span>
        <span class="track-artist">${track.artist}</span>
      </div>
      <span class="track-duration">${track.duration}</span>
    `;
    list.appendChild(el);
  });
}

// --- Shuffle button ---
function shufflePlaylist() {
  shuffleArray(currentPlaylist);
  renderTracks();
}

// --- Fisher-Yates shuffle ---
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
