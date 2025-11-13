// Scale construction logic

// Internal representation uses English note names (B, Bb)
// Display will be converted to German (H, B)
const CHROMATIC = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const ROOT_NOTES = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const MAJOR_PATTERN = [2, 2, 1, 2, 2, 2, 1]; // semitones
const MINOR_PATTERN = [2, 1, 2, 2, 1, 2, 2]; // semitones

// Convert sharps to flats where appropriate based on standard scale spellings
function normalizeNote(note, root, type) {
  const enharmonicMap = {
    'A#': 'Bb',
    'D#': 'Eb',
    'G#': 'Ab',
    'C#': 'Db',
    'F#': 'Gb'
  };
  
  // F Major: F, G, A, Bb, C, D, E
  if (root === 'F' && type === 'major' && note === 'A#') return 'Bb';
  
  // D Minor: D, E, F, G, A, Bb, C
  if (root === 'D' && type === 'minor' && note === 'A#') return 'Bb';
  
  // C Minor: C, D, Eb, F, G, Ab, Bb
  if (root === 'C' && type === 'minor') {
    if (note === 'D#') return 'Eb';
    if (note === 'G#') return 'Ab';
    if (note === 'A#') return 'Bb';
  }
  
  // G Minor: G, A, Bb, C, D, Eb, F
  if (root === 'G' && type === 'minor') {
    if (note === 'A#') return 'Bb';
    if (note === 'D#') return 'Eb';
  }
  
  // F Minor: F, G, Ab, Bb, C, Db, Eb
  if (root === 'F' && type === 'minor') {
    if (note === 'G#') return 'Ab';
    if (note === 'A#') return 'Bb';
    if (note === 'C#') return 'Db';
    if (note === 'D#') return 'Eb';
  }
  
  return note;
}

export function generateRandomScale() {
  const root = ROOT_NOTES[Math.floor(Math.random() * ROOT_NOTES.length)];
  const type = Math.random() < 0.5 ? 'major' : 'minor';
  return constructScale(root, type);
}

export function constructScale(root, type) {
  const pattern = type === 'major' ? MAJOR_PATTERN : MINOR_PATTERN;
  const rootIndex = CHROMATIC.indexOf(root);
  
  const scale = [root];
  let currentIndex = rootIndex;
  
  for (const interval of pattern) {
    currentIndex = (currentIndex + interval) % CHROMATIC.length;
    const note = CHROMATIC[currentIndex];
    scale.push(normalizeNote(note, root, type));
  }
  
  return {
    root,
    type,
    notes: scale.slice(0, 7) // Return 7 notes (root to 7th)
  };
}

