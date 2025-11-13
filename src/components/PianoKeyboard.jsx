import './PianoKeyboard.css'

const WHITE_KEYS = ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'A', 'B'];
const BLACK_KEYS = [
  // First octave
  { note: 'C#', enharmonic: 'Db', octave: 1, position: 1 },
  { note: 'D#', enharmonic: 'Eb', octave: 1, position: 2 },
  { note: 'F#', enharmonic: 'Gb', octave: 1, position: 4 },
  { note: 'G#', enharmonic: 'Ab', octave: 1, position: 5 },
  { note: 'A#', enharmonic: 'Bb', octave: 1, position: 6 },
  // Second octave
  { note: 'C#', enharmonic: 'Db', octave: 2, position: 8 },
  { note: 'D#', enharmonic: 'Eb', octave: 2, position: 9 },
  { note: 'F#', enharmonic: 'Gb', octave: 2, position: 11 },
  { note: 'G#', enharmonic: 'Ab', octave: 2, position: 12 },
  { note: 'A#', enharmonic: 'Bb', octave: 2, position: 13 },
];

function PianoKeyboard({ scale, selectedNotes, onNoteToggle, checked, isCorrect }) {
  const scaleNotes = new Set(scale.notes);
  
  // Check if a note (or its enharmonic) is in the scale
  const isInScale = (note, enharmonic) => {
    return scaleNotes.has(note) || scaleNotes.has(enharmonic);
  };
  
  // Check if a note (or its enharmonic) is selected
  const isSelected = (note, enharmonic) => {
    return selectedNotes.has(note) || selectedNotes.has(enharmonic);
  };
  
  // Get the display name (prefer the one in the scale)
  const getDisplayName = (note, enharmonic) => {
    if (scaleNotes.has(enharmonic)) return enharmonic;
    return note;
  };

  const handleKeyClick = (note, enharmonic) => {
    if (checked) return;
    // Toggle the note that's actually in the scale (or the one selected)
    if (selectedNotes.has(enharmonic)) {
      onNoteToggle(enharmonic);
    } else if (selectedNotes.has(note)) {
      onNoteToggle(note);
    } else {
      // Prefer the enharmonic if it's in the scale, otherwise use the note
      const noteToToggle = scaleNotes.has(enharmonic) ? enharmonic : note;
      onNoteToggle(noteToToggle);
    }
  };

  const getKeyClassName = (note, enharmonic, isWhite = false, isFirstOctave = true) => {
    const selected = isSelected(note, enharmonic);
    const inScale = isInScale(note, enharmonic);
    const isRoot = (note === scale.root || enharmonic === scale.root) && isFirstOctave;
    
    let classes = isWhite ? 'white-key' : 'black-key';
    
    if (checked) {
      // After checking, show correct/incorrect feedback
      if (selected && inScale) {
        classes += ' correct';
      } else if (selected && !inScale) {
        classes += ' incorrect';
      } else if (!selected && inScale) {
        classes += ' missed';
      }
    } else {
      // Before checking, show selection state
      if (selected) {
        classes += ' selected';
      }
    }
    
    if (isRoot && !checked) {
      classes += ' root';
    }
    
    return classes;
  };

  return (
    <div className="piano-keyboard">
      <div className="white-keys">
        {WHITE_KEYS.map((note, index) => {
          const isFirstOctave = index < 7;
          return (
            <div
              key={`${note}-${index}`}
              className={getKeyClassName(note, null, true, isFirstOctave)}
              onClick={() => handleKeyClick(note, null)}
            >
              <span className="note-label">{note}</span>
            </div>
          );
        })}
      </div>
      <div className="black-keys">
        {BLACK_KEYS.map(({ note, enharmonic, octave, position }) => {
          const displayName = getDisplayName(note, enharmonic);
          const isFirstOctave = octave === 1;
          // Calculate position: each white key is ~7.143% (100/14), black keys centered between white keys
          // Position is 1-indexed (1 = after first key), so center is at (position - 0.5) * keyWidth
          // Black key is 6% wide, so left edge = center - 3%
          const keyWidth = 100 / 14;
          const center = (position - 0.5) * keyWidth;
          const leftPercent = center - 3;
          return (
            <div
              key={`${note}-${octave}`}
              className={getKeyClassName(note, enharmonic, false, isFirstOctave)}
              style={{ left: `${leftPercent}%` }}
              onClick={() => handleKeyClick(note, enharmonic)}
            >
              <span className="note-label">{displayName}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default PianoKeyboard;

