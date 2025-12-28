import React, { useState, useEffect, useRef } from 'react';
import Grid from '../components/Grid';
import WordList from '../components/WordList';
import { generateHardPuzzle } from '../algorithms/Generator';
import { solveGrid } from '../algorithms/SolverDFS';
import { getLevelConfig } from '../utils/LevelConfig';

export default function DemoMode({ onBack }) {
  const [currentLevel, setCurrentLevel] = useState(1);
  const [levelConfig, setLevelConfig] = useState(null);
  const [grid, setGrid] = useState(null);
  const [words, setWords] = useState([]);
  
  // Manual side state
  const [manualFound, setManualFound] = useState([]);
  const [manualHighlighted, setManualHighlighted] = useState([]);
  const [manualSelecting, setManualSelecting] = useState([]);
  const [manualStartCell, setManualStartCell] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [manualTimer, setManualTimer] = useState(0);
  const [manualActive, setManualActive] = useState(false);
  const [manualCompleted, setManualCompleted] = useState(false);
  
  // Automatic side state
  const [autoFound, setAutoFound] = useState([]);
  const [autoHighlighted, setAutoHighlighted] = useState([]);
  const [autoTimer, setAutoTimer] = useState(0);
  const [autoActive, setAutoActive] = useState(false);
  const [autoCompleted, setAutoCompleted] = useState(false);
  
  const manualIntervalRef = useRef(null);
  const autoIntervalRef = useRef(null);

  // Initialize level
  useEffect(() => {
    startLevel(currentLevel);
  }, [currentLevel]);

  // Manual timer
  useEffect(() => {
    if (manualActive && !manualCompleted) {
      manualIntervalRef.current = setInterval(() => {
        setManualTimer(prev => prev + 10);
      }, 10);
    } else {
      if (manualIntervalRef.current) {
        clearInterval(manualIntervalRef.current);
      }
    }
    return () => {
      if (manualIntervalRef.current) {
        clearInterval(manualIntervalRef.current);
      }
    };
  }, [manualActive, manualCompleted]);

  // Auto timer
  useEffect(() => {
    if (autoActive && !autoCompleted) {
      autoIntervalRef.current = setInterval(() => {
        setAutoTimer(prev => prev + 10);
      }, 10);
    } else {
      if (autoIntervalRef.current) {
        clearInterval(autoIntervalRef.current);
      }
    }
    return () => {
      if (autoIntervalRef.current) {
        clearInterval(autoIntervalRef.current);
      }
    };
  }, [autoActive, autoCompleted]);

  const startLevel = (level) => {
    const config = getLevelConfig(level);
    setLevelConfig(config);
    const newGrid = generateHardPuzzle(config.size, config.words);
    setGrid(newGrid);
    setWords(config.words);
    
    // Reset both sides
    setManualFound([]);
    setManualHighlighted([]);
    setManualSelecting([]);
    setManualStartCell(null);
    setIsDragging(false);
    setManualTimer(0);
    setManualActive(false);
    setManualCompleted(false);
    
    setAutoFound([]);
    setAutoHighlighted([]);
    setAutoTimer(0);
    setAutoActive(false);
    setAutoCompleted(false);
  };

  const handleManualMouseDown = (row, col) => {
    if (manualCompleted) return;
    
    if (!manualActive) {
      setManualActive(true);
    }

    const cellKey = `${row}-${col}`;
    setManualStartCell({ row, col });
    setManualSelecting([cellKey]);
    setIsDragging(true);
  };

  const handleManualMouseEnter = (row, col) => {
    if (!isDragging || !manualStartCell || manualCompleted) return;

    const selectedCells = getPathBetweenCells(manualStartCell.row, manualStartCell.col, row, col);
    if (selectedCells.length > 0) {
      setManualSelecting(selectedCells);
    }
  };

  const handleManualMouseUp = (row, col) => {
    if (!isDragging || !manualStartCell || manualCompleted) return;

    setIsDragging(false);
    
    const selectedCells = getPathBetweenCells(manualStartCell.row, manualStartCell.col, row, col);
    
    // Check if selection matches any word
    const selectedWord = getCellsWord(grid, selectedCells);
    const reversedWord = selectedWord.split('').reverse().join('');
    
    if ((words.includes(selectedWord) || words.includes(reversedWord)) && 
        !manualFound.includes(selectedWord) && !manualFound.includes(reversedWord)) {
      const foundWord = words.includes(selectedWord) ? selectedWord : reversedWord;
      setManualFound([...manualFound, foundWord]);
      setManualHighlighted([...manualHighlighted, ...selectedCells]);
      setManualSelecting([]);
      setManualStartCell(null);
      
      // Check if all words found
      if (manualFound.length + 1 === words.length) {
        setManualCompleted(true);
        setManualActive(false);
      }
    } else {
      setManualSelecting([]);
      setManualStartCell(null);
    }
  };

  // Add global mouse up listener to handle drag end
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        setManualSelecting([]);
        setManualStartCell(null);
      }
    };

    document.addEventListener('mouseup', handleGlobalMouseUp);
    return () => document.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [isDragging]);

  const handleAutoSolve = () => {
    if (autoCompleted || autoActive) return;
    
    setAutoActive(true);
    
    // Simulate solving with delay for visualization
    const result = solveGrid(grid, words);
    let index = 0;
    
    const solveInterval = setInterval(() => {
      if (index < result.length) {
        const word = result[index];
        const positions = findWordPositions(grid, word);
        
        setAutoFound(prev => [...prev, word]);
        setAutoHighlighted(prev => [...prev, ...positions]);
        
        index++;
      } else {
        clearInterval(solveInterval);
        setAutoCompleted(true);
        setAutoActive(false);
      }
    }, 200);
  };

  const getPathBetweenCells = (r1, c1, r2, c2) => {
    const path = [];
    const dr = r2 - r1;
    const dc = c2 - c1;
    
    // Check if it's a valid direction (straight line or diagonal)
    const absDr = Math.abs(dr);
    const absDc = Math.abs(dc);
    
    // Must be horizontal, vertical, or diagonal (45 degrees)
    if (absDr !== 0 && absDc !== 0 && absDr !== absDc) {
      return []; // Not a valid straight line or diagonal
    }
    
    const steps = Math.max(absDr, absDc);
    if (steps === 0) return [`${r1}-${c1}`];
    
    const stepDr = dr / steps;
    const stepDc = dc / steps;
    
    for (let i = 0; i <= steps; i++) {
      const r = r1 + Math.round(stepDr * i);
      const c = c1 + Math.round(stepDc * i);
      path.push(`${r}-${c}`);
    }
    
    return path;
  };

  const getCellsWord = (grid, cells) => {
    return cells.map(cell => {
      const [r, c] = cell.split('-').map(Number);
      return grid[r][c];
    }).join('');
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

  const handleNextLevel = () => {
    if (currentLevel < 5) {
      setCurrentLevel(currentLevel + 1);
    }
  };

  const handleRestart = () => {
    startLevel(currentLevel);
  };

  if (!levelConfig || !grid) {
    return <div>Loading...</div>;
  }

  const bothCompleted = manualCompleted && autoCompleted;

  return (
    <div className="demo-container">
      <button className="back-btn" onClick={onBack}>← Back</button>
      
      <div className="level-info">
        <h2>🚀 Demo Mode - Level {currentLevel}</h2>
        <p>{levelConfig.description}</p>
      </div>

      <div className="split-container">
        {/* Manual Side */}
        <div className="split-panel manual">
          <div className="panel-header">
            <h3>👤 Manual Search</h3>
            <div className="timer-display">{formatTime(manualTimer)}</div>
            <span className={`status-badge ${manualActive ? 'active' : manualCompleted ? 'completed' : 'waiting'}`}>
              {manualActive ? '🔍 Searching...' : manualCompleted ? '✅ Completed' : '⏸️ Drag to select'}
            </span>
            <p style={{ fontSize: '0.9rem', marginTop: '10px', color: '#161E54' }}>
              Click and drag to select words (straight lines or diagonals)
            </p>
          </div>
          
          <Grid 
            grid={grid} 
            highlightedCells={manualHighlighted}
            selectedCells={manualSelecting}
            onMouseDown={handleManualMouseDown}
            onMouseEnter={handleManualMouseEnter}
            onMouseUp={handleManualMouseUp}
          />
          
          <WordList words={words} found={manualFound} />
        </div>

        {/* Automatic Side */}
        <div className="split-panel automatic">
          <div className="panel-header">
            <h3>🤖 DSA Algorithm</h3>
            <div className="timer-display">{formatTime(autoTimer)}</div>
            <span className={`status-badge ${autoActive ? 'active' : autoCompleted ? 'completed' : 'waiting'}`}>
              {autoActive ? '⚡ Solving...' : autoCompleted ? '✅ Completed' : '⏸️ Ready'}
            </span>
            {!autoActive && !autoCompleted && (
              <button 
                className="btn-solve" 
                onClick={handleAutoSolve}
                style={{ marginTop: '15px' }}
              >
                🎯 Start Auto Solve
              </button>
            )}
          </div>
          
          <Grid 
            grid={grid} 
            highlightedCells={autoHighlighted}
          />
          
          <WordList words={words} found={autoFound} />
        </div>
      </div>

      {bothCompleted && (
        <div className="controls">
          <div style={{ 
            textAlign: 'center', 
            padding: '20px', 
            background: '#F16D34',
            borderRadius: '15px',
            color: 'white',
            marginBottom: '15px',
            width: '100%'
          }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>🎉 Level Complete!</h3>
            <p style={{ fontSize: '1.2rem' }}>
              Manual: {formatTime(manualTimer)} vs DSA: {formatTime(autoTimer)}
            </p>
            <p style={{ fontSize: '1rem', marginTop: '5px' }}>
              {autoTimer < manualTimer 
                ? `DSA was ${((manualTimer / autoTimer - 1) * 100).toFixed(0)}% faster! 🚀`
                : 'Great job! 👏'}
            </p>
          </div>
          
          <button className="btn-reset" onClick={handleRestart}>
            🔄 Retry Level
          </button>
          {currentLevel < 5 && (
            <button className="btn-next" onClick={handleNextLevel}>
              ➡️ Next Level
            </button>
          )}
          {currentLevel === 5 && (
            <p style={{ textAlign: 'center', fontSize: '1.2rem', color: '#161E54', fontWeight: 'bold', width: '100%' }}>
              🏆 Congratulations! You completed all levels!
            </p>
          )}
        </div>
      )}
    </div>
  );
}