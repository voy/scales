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
    const rootIndex = ['C', 'D', 'E', 'F', 'G', 'A', 'H'].indexOf(scale.root);
    
    // Build expected scale starting from root in first octave
    const expectedKeys = new Set();
    const whiteKeys = ['C', 'D', 'E', 'F', 'G', 'A', 'H', 'C', 'D', 'E', 'F', 'G', 'A', 'H'];
    
    // Add root note (first octave)
    expectedKeys.add(`white-${rootIndex}`);
    
    // Build scale pattern from root - scale.notes are in German
    const scaleNotes = scale.notes;
    const blackKeyPositions = [
      { note: 'C#', enharmonic: 'Db', octave: 1, position: 1 },
      { note: 'D#', enharmonic: 'Eb', octave: 1, position: 2 },
      { note: 'F#', enharmonic: 'Gb', octave: 1, position: 4 },
      { note: 'G#', enharmonic: 'Ab', octave: 1, position: 5 },
      { note: 'B', octave: 1, position: 6 }, // B in German = Bb in English
      { note: 'C#', enharmonic: 'Db', octave: 2, position: 8 },
      { note: 'D#', enharmonic: 'Eb', octave: 2, position: 9 },
      { note: 'F#', enharmonic: 'Gb', octave: 2, position: 11 },
      { note: 'G#', enharmonic: 'Ab', octave: 2, position: 12 },
      { note: 'B', octave: 2, position: 13 }, // B in German = Bb in English
    ];
    
    // Process scale notes sequentially to build expected keys
    // Include all 8 notes (root + 7 scale degrees including octave)
    let lastKeyIndex = rootIndex;
    
    scaleNotes.forEach((note, scaleIndex) => {
      if (scaleIndex === 0) return; // Skip root, already added
      
      // Check if this note is a black key (B, C#, D#, F#, G#)
      const isBlackKey = blackKeyPositions.some(({ note: bkNote, enharmonic: bkEnh }) => 
        bkNote === note || (bkEnh && bkEnh === note)
      );
      
      if (isBlackKey) {
        // Find the black key that comes after the last key we added
        let bestMatch = null;
        let bestKeyIndex = Infinity;
        
        for (const { note: bkNote, enharmonic: bkEnh, octave, position } of blackKeyPositions) {
          if (bkNote === note || (bkEnh && bkEnh === note)) {
            const keyIndex = position - 1; // Convert to 0-indexed white key position
            // Find the black key that's closest to but >= lastKeyIndex
            if (keyIndex >= lastKeyIndex - 1 && keyIndex < bestKeyIndex) {
              bestMatch = { note: bkNote || 'B', octave, position };
              bestKeyIndex = keyIndex;
            }
          }
        }
        
        if (bestMatch) {
          const noteId = bestMatch.note || 'B';
          expectedKeys.add(`black-${bestMatch.octave}-${noteId}`);
          lastKeyIndex = bestMatch.position; // Update to after this black key
        }
      } else {
        // It's a white key - find it and update lastKeyIndex
        // For the octave note (last note), we need to find the next occurrence after the 7th note
        // The loop should already find it correctly, but ensure we're looking in the right range
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

  if (!scale) return <div>Laden...</div>;

  const scaleTypeLabel = scale.type === 'major' ? 'Dur' : 'Moll';

  return (
    <div className="app">
      <header>
        <h1>Tonleiter lernen</h1>
      </header>
      <main>
        <div className="scale-info">
          <h2>Konstruiere: {scale.root} {scaleTypeLabel}</h2>
          <p className="instruction">Klicke die Tasten, die zu dieser Tonleiter gehören</p>
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
            Antwort prüfen
          </button>
          {checked && (
            <>
              <div className={`feedback ${isCorrect ? 'correct' : 'incorrect'}`}>
                {isCorrect ? '✓ Richtig!' : '✗ Falsch'}
              </div>
              {!isCorrect && (
                <div className="correct-answer">
                  Richtige Antwort: {scale.notes.join(' - ')}
                </div>
              )}
            </>
          )}
          <button 
            onClick={handleNewScale} 
            className="new-scale-button"
          >
            Neue Tonleiter
          </button>
        </div>
      </main>
    </div>
  )
}

export default App

