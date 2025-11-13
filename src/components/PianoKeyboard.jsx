import './PianoKeyboard.css'

const WHITE_KEYS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const BLACK_KEYS = [
  { note: 'C#', enharmonic: 'Db', position: 1 },
  { note: 'D#', enharmonic: 'Eb', position: 2 },
  { note: 'F#', enharmonic: 'Gb', position: 4 },
  { note: 'G#', enharmonic: 'Ab', position: 5 },
  { note: 'A#', enharmonic: 'Bb', position: 6 },
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

  const getKeyClassName = (note, enharmonic, isWhite = false) => {
    const selected = isSelected(note, enharmonic);
    const inScale = isInScale(note, enharmonic);
    const isRoot = note === scale.root || enharmonic === scale.root;
    
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
        {WHITE_KEYS.map(note => {
          const selected = selectedNotes.has(note);
          const inScale = scaleNotes.has(note);
          return (
            <div
              key={note}
              className={getKeyClassName(note, null, true)}
              onClick={() => handleKeyClick(note, null)}
            >
              <span className="note-label">{note}</span>
            </div>
          );
        })}
      </div>
      <div className="black-keys">
        {BLACK_KEYS.map(({ note, enharmonic, position }) => {
          const displayName = getDisplayName(note, enharmonic);
          return (
            <div
              key={note}
              className={getKeyClassName(note, enharmonic)}
              style={{ left: `${(position * 14.28) - 3}%` }}
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

