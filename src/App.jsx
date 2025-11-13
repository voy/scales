import { useState, useEffect } from 'react'
import { generateRandomScale } from './utils/scaleLogic'
import PianoKeyboard from './components/PianoKeyboard'
import './App.css'

function App() {
  const [scale, setScale] = useState(null);
  const [selectedNotes, setSelectedNotes] = useState(new Set());
  const [checked, setChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  useEffect(() => {
    const newScale = generateRandomScale();
    setScale(newScale);
    setSelectedNotes(new Set());
    setChecked(false);
    setIsCorrect(false);
  }, []);

  const handleNoteToggle = (note) => {
    if (checked) return; // Don't allow changes after checking
    
    setSelectedNotes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(note)) {
        newSet.delete(note);
      } else {
        newSet.add(note);
      }
      return newSet;
    });
  };

  const handleCheck = () => {
    if (!scale) return;
    
    // Find root note position in first octave (indices 0-6)
    const rootIndex = ['C', 'D', 'E', 'F', 'G', 'A', 'B'].indexOf(scale.root);
    
    // Build expected scale starting from root in first octave
    const expectedKeys = new Set();
    const whiteKeys = ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'A', 'B'];
    
    // Add root note (first octave)
    expectedKeys.add(`white-${rootIndex}`);
    
    // Build scale pattern from root
    const scaleNotes = scale.notes;
    let currentIndex = rootIndex;
    
    // For each note in the scale after the root
    for (let i = 1; i < scaleNotes.length; i++) {
      const targetNote = scaleNotes[i];
      
      // Find the next occurrence of this note starting from currentIndex
      for (let j = currentIndex + 1; j < whiteKeys.length; j++) {
        if (whiteKeys[j] === targetNote) {
          expectedKeys.add(`white-${j}`);
          currentIndex = j;
          break;
        }
      }
    }
    
    // Add black keys that are in the scale pattern
    // We need to find which black keys are part of the scale, starting from root
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
    let lastKeyIndex = rootIndex;
    
    scaleNotes.forEach((note, scaleIndex) => {
      if (scaleIndex === 0) return; // Skip root, already added
      
      // Check if this note is a black key
      const isBlackKey = blackKeyPositions.some(({ note: bkNote, enharmonic: bkEnh }) => 
        bkNote === note || bkEnh === note
      );
      
      if (isBlackKey) {
        // Find the black key that comes after the last key we added
        // Black keys are positioned between white keys, so we need to find the one
        // that comes after lastKeyIndex
        let bestMatch = null;
        let bestKeyIndex = Infinity;
        
        for (const { note: bkNote, enharmonic: bkEnh, octave, position } of blackKeyPositions) {
          if (bkNote === note || bkEnh === note) {
            const keyIndex = position - 1; // Convert to 0-indexed white key position
            // Find the black key that's closest to but >= lastKeyIndex
            if (keyIndex >= lastKeyIndex - 1 && keyIndex < bestKeyIndex) {
              bestMatch = { note: bkNote, octave, position };
              bestKeyIndex = keyIndex;
            }
          }
        }
        
        if (bestMatch) {
          expectedKeys.add(`black-${bestMatch.octave}-${bestMatch.note}`);
          lastKeyIndex = bestMatch.position; // Update to after this black key
        }
      } else {
        // It's a white key - find it and update lastKeyIndex
        for (let j = lastKeyIndex; j < whiteKeys.length; j++) {
          if (whiteKeys[j] === note) {
            expectedKeys.add(`white-${j}`);
            lastKeyIndex = j + 1;
            break;
          }
        }
      }
    });
    
    // Compare selected keys with expected keys
    const selectedArray = Array.from(selectedNotes);
    const expectedArray = Array.from(expectedKeys);
    
    const isMatch = 
      selectedArray.length === expectedArray.length &&
      selectedArray.every(key => expectedKeys.has(key));
    
    setIsCorrect(isMatch);
    setChecked(true);
  };

  const handleNewScale = () => {
    const newScale = generateRandomScale();
    setScale(newScale);
    setSelectedNotes(new Set());
    setChecked(false);
    setIsCorrect(false);
  };

  if (!scale) return <div>Loading...</div>;

  return (
    <div className="app">
      <header>
        <h1>Musical Scale Learning</h1>
      </header>
      <main>
        <div className="scale-info">
          <h2>Construct: {scale.root} {scale.type.charAt(0).toUpperCase() + scale.type.slice(1)}</h2>
          <p className="instruction">Click the keys that belong to this scale</p>
        </div>
        <PianoKeyboard 
          scale={scale} 
          selectedNotes={selectedNotes}
          onNoteToggle={handleNoteToggle}
          checked={checked}
          isCorrect={isCorrect}
        />
        <div className="controls">
          <button 
            onClick={handleCheck} 
            disabled={checked}
            className="check-button"
          >
            Check Answer
          </button>
          {checked && (
            <>
              <div className={`feedback ${isCorrect ? 'correct' : 'incorrect'}`}>
                {isCorrect ? '✓ Correct!' : '✗ Incorrect'}
              </div>
              {!isCorrect && (
                <div className="correct-answer">
                  Correct answer: {scale.notes.join(' - ')}
                </div>
              )}
            </>
          )}
          <button 
            onClick={handleNewScale} 
            className="new-scale-button"
          >
            New Scale
          </button>
        </div>
      </main>
    </div>
  )
}

export default App

