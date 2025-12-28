import React, { useState } from 'react';
import Grid from '../components/Grid';
import WordList from '../components/WordList';
import { generateHardPuzzle } from '../algorithms/Generator';
import { solveGrid } from '../algorithms/SolverDFS';
import { getRandomWords } from '../utils/WordLists';

export default function ContentMode({ onBack }) {
  const [showSetup, setShowSetup] = useState(true);
  const [gridSize, setGridSize] = useState('');
  const [useCustomWords, setUseCustomWords] = useState(null);
  const [customWordsInput, setCustomWordsInput] = useState('');
  const [words, setWords] = useState([]);
  const [grid, setGrid] = useState(null);
  const [found, setFound] = useState([]);
  const [highlightedCells, setHighlightedCells] = useState([]);
  const [solving, setSolving] = useState(false);
  const [step, setStep] = useState(1);

  const handleSizeSubmit = () => {
    const size = parseInt(gridSize);
    if (size >= 3 && size <= 20) {
      setStep(2);
    } else {
      alert('Please enter a size between 3 and 20');
    }
  };

  const handleWordChoice = (choice) => {
    setUseCustomWords(choice);
    if (choice === false) {
      const size = parseInt(gridSize);
      const wordCount = Math.min(Math.floor(size * 1.5), 15);
      const generatedWords = getRandomWords(size, wordCount);
      setWords(generatedWords);
      setGrid(generateHardPuzzle(size, generatedWords));
      setShowSetup(false);
      setFound([]);
      setHighlightedCells([]);
    } else {
      setStep(3);
    }
  };

  const handleCustomWordsSubmit = () => {
    const size = parseInt(gridSize);
    const wordArray = customWordsInput
      .toUpperCase()
      .split(',')
      .map(w => w.trim())
      .filter(w => w.length > 0 && w.length <= size);
    
    if (wordArray.length === 0) {
      alert('Please enter at least one valid word');
      return;
    }

    setWords(wordArray);
    setGrid(generateHardPuzzle(size, wordArray));
    setShowSetup(false);
    setFound([]);
    setHighlightedCells([]);
  };

  const handleGenerate = () => {
    const size = parseInt(gridSize);
    let newWords;
    
    if (useCustomWords) {
      newWords = words;
    } else {
      const wordCount = Math.min(Math.floor(size * 1.5), 15);
      newWords = getRandomWords(size, wordCount);
      setWords(newWords);
    }
    
    setGrid(generateHardPuzzle(size, newWords));
    setFound([]);
    setHighlightedCells([]);
  };

  const handleSolve = () => {
    setSolving(true);
    setTimeout(() => {
      const result = solveGrid(grid, words);
      setFound(result);
      
      const highlighted = [];
      result.forEach(word => {
        const positions = findWordPositions(grid, word);
        highlighted.push(...positions);
      });
      setHighlightedCells(highlighted);
      setSolving(false);
    }, 500);
  };

  const findWordPositions = (grid, word) => {
    const rows = grid.length;
    const cols = grid[0].length;
    const directions = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],           [0, 1],
      [1, -1],  [1, 0],  [1, 1]
    ];
    
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        for (let [dr, dc] of directions) {
          const foundPositions = checkDirection(grid, word, i, j, dr, dc);
          if (foundPositions.length > 0) {
            return foundPositions;
          }
        }
      }
    }
    return [];
  };

  const checkDirection = (grid, word, startRow, startCol, dr, dc) => {
    const positions = [];
    let r = startRow;
    let c = startCol;
    
    for (let i = 0; i < word.length; i++) {
      if (r < 0 || r >= grid.length || c < 0 || c >= grid[0].length) return [];
      if (grid[r][c] !== word[i]) return [];
      positions.push(`${r}-${c}`);
      r += dr;
      c += dc;
    }
    return positions;
  };

  const handleReset = () => {
    setShowSetup(true);
    setGridSize('');
    setUseCustomWords(null);
    setCustomWordsInput('');
    setWords([]);
    setGrid(null);
    setFound([]);
    setHighlightedCells([]);
    setStep(1);
  };

  if (showSetup) {
    return (
      <div className="game-mode">
        <button className="back-btn" onClick={onBack}>← Back</button>
        <h1>📝 Content Mode Setup</h1>
        
        <div className="setup-container">
          {step === 1 && (
            <div className="setup-step">
              <h3>Step 1: Choose Grid Size</h3>
              <p>Enter matrix size (e.g., 5 for 5x5, 10 for 10x10)</p>
              <input
                type="number"
                value={gridSize}
                onChange={(e) => setGridSize(e.target.value)}
                placeholder="Enter size (3-20)"
                className="input-field"
                min="3"
                max="20"
              />
              <button className="btn-primary" onClick={handleSizeSubmit}>
                Next →
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="setup-step">
              <h3>Step 2: Choose Word Source</h3>
              <p>Do you want to provide your own keywords?</p>
              <div className="button-group">
                <button className="btn-choice yes" onClick={() => handleWordChoice(true)}>
                  ✓ Yes, I'll provide words
                </button>
                <button className="btn-choice no" onClick={() => handleWordChoice(false)}>
                  ✗ No, auto-generate words
                </button>
              </div>
              <button className="btn-secondary" onClick={() => setStep(1)}>
                ← Back
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="setup-step">
              <h3>Step 3: Enter Your Keywords</h3>
              <p>Enter words separated by commas (e.g., CAT,DOG,BIRD)</p>
              <textarea
                value={customWordsInput}
                onChange={(e) => setCustomWordsInput(e.target.value)}
                placeholder="CAT, DOG, BIRD, FISH..."
                className="textarea-field"
                rows="4"
              />
              <div className="button-group">
                <button className="btn-primary" onClick={handleCustomWordsSubmit}>
                  Generate Puzzle →
                </button>
                <button className="btn-secondary" onClick={() => setStep(2)}>
                  ← Back
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="game-mode">
      <button className="back-btn" onClick={onBack}>← Back to Categories</button>
      <h1>📝 Content Mode</h1>
      <p className="mode-description">Fast generator and solver demonstration</p>
      
      <div className="controls">
        <button className="btn-generate" onClick={handleGenerate}>
          🔄 Generate New Puzzle
        </button>
        <button className="btn-solve" onClick={handleSolve} disabled={solving}>
          {solving ? '⏳ Solving...' : '🎯 Solve Puzzle'}
        </button>
        <button className="btn-reset" onClick={handleReset}>
          ⚙️ New Setup
        </button>
      </div>

      <Grid grid={grid} highlightedCells={highlightedCells} />
      <WordList words={words} found={found} />
    </div>
  );
}