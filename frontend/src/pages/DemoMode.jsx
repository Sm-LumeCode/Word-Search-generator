import React, { useState, useEffect, useRef } from 'react';
import Grid from '../components/Grid';
import WordList from '../components/WordList';
import { generateHardPuzzle } from '../algorithms/Generator';
import { solveGrid } from '../algorithms/SolverDFS';
import { solveBruteForce } from '../algorithms/SolverBruteForce';

export default function DemoMode({ onBack }) {
  const [grid, setGrid] = useState(null);
  const [words, setWords] = useState([]);
  
  // Without DSA (Brute Force) state
  const [bruteFound, setBruteFound] = useState([]);
  const [bruteHighlighted, setBruteHighlighted] = useState([]);
  const [bruteTimer, setBruteTimer] = useState(0);
  const [bruteActive, setBruteActive] = useState(false);
  const [bruteCompleted, setBruteCompleted] = useState(false);
  
  // With DSA state
  const [dsaFound, setDsaFound] = useState([]);
  const [dsaHighlighted, setDsaHighlighted] = useState([]);
  const [dsaTimer, setDsaTimer] = useState(0);
  const [dsaActive, setDsaActive] = useState(false);
  const [dsaCompleted, setDsaCompleted] = useState(false);
  
  const bruteIntervalRef = useRef(null);
  const dsaIntervalRef = useRef(null);

  useEffect(() => {
    generateNewPuzzle();
  }, []);

  // Brute force timer
  useEffect(() => {
    if (bruteActive && !bruteCompleted) {
      bruteIntervalRef.current = setInterval(() => {
        setBruteTimer(prev => prev + 10);
      }, 10);
    } else {
      if (bruteIntervalRef.current) {
        clearInterval(bruteIntervalRef.current);
      }
    }
    return () => {
      if (bruteIntervalRef.current) {
        clearInterval(bruteIntervalRef.current);
      }
    };
  }, [bruteActive, bruteCompleted]);

  // DSA timer
  useEffect(() => {
    if (dsaActive && !dsaCompleted) {
      dsaIntervalRef.current = setInterval(() => {
        setDsaTimer(prev => prev + 10);
      }, 10);
    } else {
      if (dsaIntervalRef.current) {
        clearInterval(dsaIntervalRef.current);
      }
    }
    return () => {
      if (dsaIntervalRef.current) {
        clearInterval(dsaIntervalRef.current);
      }
    };
  }, [dsaActive, dsaCompleted]);

  const generateNewPuzzle = () => {
    const size = 5;
    const demoWords = ['CAT', 'DOG', 'BIRD', 'FISH'];
    const newGrid = generateHardPuzzle(size, demoWords);
    setGrid(newGrid);
    setWords(demoWords);
    
    // Reset both sides
    setBruteFound([]);
    setBruteHighlighted([]);
    setBruteTimer(0);
    setBruteActive(false);
    setBruteCompleted(false);
    
    setDsaFound([]);
    setDsaHighlighted([]);
    setDsaTimer(0);
    setDsaActive(false);
    setDsaCompleted(false);
  };

  const handleBruteSolve = () => {
    if (bruteCompleted || bruteActive) return;
    
    setBruteActive(true);
    
    const result = solveBruteForce(grid, words);
    let index = 0;
    
    const solveInterval = setInterval(() => {
      if (index < result.length) {
        const word = result[index];
        const positions = findWordPositions(grid, word);
        
        setBruteFound(prev => [...prev, word]);
        setBruteHighlighted(prev => [...prev, ...positions]);
        
        index++;
      } else {
        clearInterval(solveInterval);
        setBruteCompleted(true);
        setBruteActive(false);
      }
    }, 400);
  };

  const handleDsaSolve = () => {
    if (dsaCompleted || dsaActive) return;
    
    setDsaActive(true);
    
    const result = solveGrid(grid, words);
    let index = 0;
    
    const solveInterval = setInterval(() => {
      if (index < result.length) {
        const word = result[index];
        const positions = findWordPositions(grid, word);
        
        setDsaFound(prev => [...prev, word]);
        setDsaHighlighted(prev => [...prev, ...positions]);
        
        index++;
      } else {
        clearInterval(solveInterval);
        setDsaCompleted(true);
        setDsaActive(false);
      }
    }, 100);
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
          const positions = checkDirection(grid, word, i, j, dr, dc);
          if (positions.length > 0) {
            return positions;
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

  const formatTime = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const milliseconds = Math.floor((ms % 1000) / 10);
    return `${seconds}.${milliseconds.toString().padStart(2, '0')}s`;
  };

  if (!grid) {
    return <div>Loading...</div>;
  }

  const bothCompleted = bruteCompleted && dsaCompleted;

  return (
    <div className="demo-container">
      <button className="back-btn" onClick={onBack}>← Back</button>
      
      <div className="level-info">
        <h2>🚀 Demo Mode - 5x5 Grid</h2>
        <p>Compare solving speed: Brute Force vs DSA (Trie + DFS)</p>
      </div>

      <div className="split-container">
        {/* Brute Force Side */}
        <div className="split-panel brute">
          <div className="panel-header">
            <h3>🐌 Without DSA (Brute Force)</h3>
            <div className="timer-display">{formatTime(bruteTimer)}</div>
            <span className={`status-badge ${bruteActive ? 'active' : bruteCompleted ? 'completed' : 'waiting'}`}>
              {bruteActive ? '⚙️ Solving...' : bruteCompleted ? '✅ Completed' : '⏸️ Ready'}
            </span>
            {!bruteActive && !bruteCompleted && (
              <button 
                className="btn-solve" 
                onClick={handleBruteSolve}
                style={{ marginTop: '15px' }}
              >
                🎯 Start Brute Force
              </button>
            )}
          </div>
          
          <Grid 
            grid={grid} 
            highlightedCells={bruteHighlighted}
          />
          
          <WordList words={words} found={bruteFound} />
        </div>

        {/* DSA Side */}
        <div className="split-panel dsa">
          <div className="panel-header">
            <h3>🚀 With DSA (Trie + DFS)</h3>
            <div className="timer-display">{formatTime(dsaTimer)}</div>
            <span className={`status-badge ${dsaActive ? 'active' : dsaCompleted ? 'completed' : 'waiting'}`}>
              {dsaActive ? '⚡ Solving...' : dsaCompleted ? '✅ Completed' : '⏸️ Ready'}
            </span>
            {!dsaActive && !dsaCompleted && (
              <button 
                className="btn-solve" 
                onClick={handleDsaSolve}
                style={{ marginTop: '15px' }}
              >
                🎯 Start DSA Solve
              </button>
            )}
          </div>
          
          <Grid 
            grid={grid} 
            highlightedCells={dsaHighlighted}
          />
          
          <WordList words={words} found={dsaFound} />
        </div>
      </div>

      <div className="controls">
        {bothCompleted && (
          <div style={{ 
            textAlign: 'center', 
            padding: '20px', 
            background: '#34495e',
            borderRadius: '15px',
            color: 'white',
            marginBottom: '15px',
            width: '100%'
          }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>🎉 Both Completed!</h3>
            <p style={{ fontSize: '1.2rem' }}>
              Brute Force: {formatTime(bruteTimer)} vs DSA: {formatTime(dsaTimer)}
            </p>
            <p style={{ fontSize: '1rem', marginTop: '5px' }}>
              {dsaTimer < bruteTimer 
                ? `DSA was ${((bruteTimer / dsaTimer - 1) * 100).toFixed(0)}% faster! 🚀`
                : 'Both completed! 👍'}
            </p>
          </div>
        )}
        
        <button className="btn-reset" onClick={generateNewPuzzle}>
          🔄 Regenerate Puzzle
        </button>
      </div>
    </div>
  );
}