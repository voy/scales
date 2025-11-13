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
    
    // Enharmonic mapping
    const enharmonics = {
      'C#': 'Db', 'Db': 'C#',
      'D#': 'Eb', 'Eb': 'D#',
      'F#': 'Gb', 'Gb': 'F#',
      'G#': 'Ab', 'Ab': 'G#',
      'A#': 'Bb', 'Bb': 'A#'
    };
    
    const correctNotes = new Set(scale.notes);
    const selectedArray = Array.from(selectedNotes);
    const correctArray = Array.from(correctNotes);
    
    // Check if sets match (considering enharmonics)
    const isMatch = 
      selectedArray.length === correctArray.length &&
      selectedArray.every(note => {
        // Direct match
        if (correctNotes.has(note)) return true;
        // Enharmonic match
        const enharmonic = enharmonics[note];
        return enharmonic && correctNotes.has(enharmonic);
      });
    
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

