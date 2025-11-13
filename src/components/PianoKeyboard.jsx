import './PianoKeyboard.css'

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
  const whiteKeys = ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'A', 'B'];
  const rootIndex = ['C', 'D', 'E', 'F', 'G', 'A', 'B'].indexOf(scale.root);
  
  // Build expected keys starting from root
  const getExpectedKeys = () => {
    const expected = new Set();
    expected.add(`white-${rootIndex}`);
    
    let currentIndex = rootIndex;
    for (let i = 1; i < scale.notes.length; i++) {
      const targetNote = scale.notes[i];
      for (let j = currentIndex + 1; j < whiteKeys.length; j++) {
        if (whiteKeys[j] === targetNote) {
          expected.add(`white-${j}`);
          currentIndex = j;
          break;
        }
      }
    }
    
    // Add black keys that are in the scale pattern
    // We need to find which black keys appear in the scale sequence
    const blackKeyPositions = [
      { note: 'C#', enharmonic: 'Db', octave: 1, position: 1 },
      { note: 'D#', enharmonic: 'Eb', octave: 1, position: 2 },
      { note: 'F#', enharmonic: 'Gb', octave: 1, position: 4 },
      { note: 'G#', enharmonic: 'Ab', octave: 1, position: 5 },
      { note: 'A#', enharmonic: 'Bb', octave: 1, position: 6 },
      { note: 'C#', enharmonic: 'Db', octave: 2, position: 8 },
      { note: 'D#', enharmonic: 'Eb', octave: 2, position: 9 },
      { note: 'F#', enharmonic: 'Gb', octave: 2, position: 11 },
      { note: 'G#', enharmonic: 'Ab', octave: 2, position: 12 },
      { note: 'A#', enharmonic: 'Bb', octave: 2, position: 13 },
    ];
    
    // For each note in the scale, if it's a black key, find the appropriate black key position
    // We need to determine which black key to use based on where it appears in the scale sequence
    scale.notes.forEach((note, scaleIndex) => {
      blackKeyPositions.forEach(({ note: bkNote, enharmonic: bkEnh, octave, position }) => {
        // Check if this black key matches the scale note (considering enharmonics)
        if (bkNote === note || bkEnh === note) {
          const keyIndex = position - 1; // Convert to 0-indexed white key position
          // For scales starting at root, include black keys that are:
          // 1. At or after the root position
          // 2. Part of the scale (we know it is because note matches)
          // 3. Use the octave that fits in the scale pattern
          if (keyIndex >= rootIndex) {
            // Determine which octave to use - prefer the one that's in the scale range
            // If the keyIndex is in first octave range (0-6), use octave 1
            // If the keyIndex is in second octave range (7-13), use octave 2
            const useOctave = keyIndex < 7 ? 1 : 2;
            if (octave === useOctave) {
              expected.add(`black-${octave}-${bkNote}`);
            }
          }
        }
      });
    });
    
    return expected;
  };
  
  const expectedKeys = checked ? getExpectedKeys() : new Set();
  
  // Check if a specific key is selected
  const isSelected = (keyId) => {
    return selectedNotes.has(keyId);
  };
  
  // Check if a specific key is in the expected scale
  const isInScale = (keyId) => {
    return expectedKeys.has(keyId);
  };
  
  // Get the display name (prefer the one in the scale)
  const getDisplayName = (note, enharmonic) => {
    if (scaleNotes.has(enharmonic)) return enharmonic;
    return note;
  };

  const handleWhiteKeyClick = (note, index) => {
    if (checked) return;
    const keyId = `white-${index}`;
    onNoteToggle(keyId);
  };

  const handleBlackKeyClick = (note, enharmonic, octave) => {
    if (checked) return;
    const displayNote = scaleNotes.has(enharmonic) ? enharmonic : note;
    const keyId = `black-${octave}-${note}`;
    onNoteToggle(keyId);
  };

  const getWhiteKeyClassName = (note, index) => {
    const keyId = `white-${index}`;
    const selected = isSelected(keyId);
    const inScale = isInScale(keyId);
    const isRoot = index === rootIndex && !checked;
    
    let classes = 'white-key';
    
    if (checked) {
      if (selected && inScale) {
        classes += ' correct';
      } else if (selected && !inScale) {
        classes += ' incorrect';
      } else if (!selected && inScale) {
        classes += ' missed';
      }
    } else {
      if (selected) {
        classes += ' selected';
      }
    }
    
    if (isRoot) {
      classes += ' root';
    }
    
    return classes;
  };

  const getBlackKeyClassName = (note, enharmonic, octave) => {
    const keyId = `black-${octave}-${note}`;
    const selected = isSelected(keyId);
    const inScale = isInScale(keyId);
    
    let classes = 'black-key';
    
    if (checked) {
      if (selected && inScale) {
        classes += ' correct';
      } else if (selected && !inScale) {
        classes += ' incorrect';
      } else if (!selected && inScale) {
        classes += ' missed';
      }
    } else {
      if (selected) {
        classes += ' selected';
      }
    }
    
    return classes;
  };

  return (
    <div className="piano-keyboard">
      <div className="white-keys">
        {whiteKeys.map((note, index) => (
          <div
            key={`white-${index}`}
            className={getWhiteKeyClassName(note, index)}
            onClick={() => handleWhiteKeyClick(note, index)}
          >
            <span className="note-label">{note}</span>
          </div>
        ))}
      </div>
      <div className="black-keys">
        {BLACK_KEYS.map(({ note, enharmonic, octave, position }) => {
          const displayName = getDisplayName(note, enharmonic);
          // Calculate position: black keys are centered between white keys
          // Position N means the black key is between white key (N-1) and white key N
          // Use transform to center precisely
          const keyWidth = 100 / 14; // ~7.143% per white key
          
          // Center point between the two white keys
          // White key (N-1) ends at (N-1) * keyWidth
          // White key N starts at N * keyWidth  
          // Center is at: (N-1) * keyWidth + keyWidth/2 = (N - 0.5) * keyWidth
          const centerPercent = (position - 0.5) * keyWidth;
          
          return (
            <div
              key={`black-${octave}-${note}`}
              className={getBlackKeyClassName(note, enharmonic, octave)}
              style={{ 
                left: `${centerPercent}%`,
                transform: 'translateX(-50%)'
              }}
              onClick={() => handleBlackKeyClick(note, enharmonic, octave)}
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

