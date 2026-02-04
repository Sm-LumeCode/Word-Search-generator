import React, { useState, useEffect, useRef } from 'react';
import Grid from '../components/Grid';
import WordList from '../components/WordList';
import { generateHardPuzzle } from '../algorithms/Generator';
import { getGameLevelConfig } from '../utils/GameLevelConfig';

export default function GameMode({ onBack }) {
  const [currentLevel, setCurrentLevel] = useState(1);
  const [levelConfig, setLevelConfig] = useState(null);
  const [grid, setGrid] = useState(null);
  const [words, setWords] = useState([]);
  
  const [found, setFound] = useState([]);
  const [highlighted, setHighlighted] = useState([]);
  const [selecting, setSelecting] = useState([]);
  const [startCell, setStartCell] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [active, setActive] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [failed, setFailed] = useState(false);
  
  const intervalRef = useRef(null);

  useEffect(() => {
    startLevel(currentLevel);
  }, [currentLevel]);

  useEffect(() => {
    if (active && !completed && !failed) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 100) {
            clearInterval(intervalRef.current);
            setFailed(true);
            setActive(false);
            return 0;
          }
          return prev - 100;
        });
      }, 100);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [active, completed, failed]);

  const startLevel = (level) => {
    const config = getGameLevelConfig(level);
    setLevelConfig(config);
    const newGrid = generateHardPuzzle(config.size, config.words);
    setGrid(newGrid);
    setWords(config.words);
    setTimeLeft(config.timeLimit);
    
    setFound([]);
    setHighlighted([]);
    setSelecting([]);
    setStartCell(null);
    setIsDragging(false);
    setActive(false);
    setCompleted(false);
    setFailed(false);
  };

  const handleMouseDown = (row, col) => {
    if (completed || failed) return;
    
    if (!active) {
      setActive(true);
    }

    const cellKey = `${row}-${col}`;
    setStartCell({ row, col });
    setSelecting([cellKey]);
    setIsDragging(true);
  };

  const handleMouseEnter = (row, col) => {
    if (!isDragging || !startCell || completed || failed) return;

    const selectedCells = getPathBetweenCells(startCell.row, startCell.col, row, col);
    if (selectedCells.length > 0) {
      setSelecting(selectedCells);
    }
  };

  const handleMouseUp = (row, col) => {
    if (!isDragging || !startCell || completed || failed) return;

    setIsDragging(false);
    
    const selectedCells = getPathBetweenCells(startCell.row, startCell.col, row, col);
    
    const selectedWord = getCellsWord(grid, selectedCells);
    const reversedWord = selectedWord.split('').reverse().join('');
    
    if ((words.includes(selectedWord) || words.includes(reversedWord)) && 
        !found.includes(selectedWord) && !found.includes(reversedWord)) {
      const foundWord = words.includes(selectedWord) ? selectedWord : reversedWord;
      const newFound = [...found, foundWord];
      setFound(newFound);
      setHighlighted([...highlighted, ...selectedCells]);
      setSelecting([]);
      setStartCell(null);
      
      if (newFound.length === words.length) {
        setCompleted(true);
        setActive(false);
      }
    } else {
      setSelecting([]);
      setStartCell(null);
    }
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        setSelecting([]);
        setStartCell(null);
      }
    };

    document.addEventListener('mouseup', handleGlobalMouseUp);
    return () => document.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [isDragging]);

  const getPathBetweenCells = (r1, c1, r2, c2) => {
    const path = [];
    const dr = r2 - r1;
    const dc = c2 - c1;
    
    const absDr = Math.abs(dr);
    const absDc = Math.abs(dc);
    
    if (absDr !== 0 && absDc !== 0 && absDr !== absDc) {
      return [];
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

  const formatTime = (ms) => {
    const seconds = Math.floor(ms / 1000);
    return `${seconds}s`;
  };

  const handleNextLevel = () => {
    if (currentLevel < 20) {
      setCurrentLevel(currentLevel + 1);
    }
  };

  const handleRestart = () => {
    startLevel(currentLevel);
  };

  if (!levelConfig || !grid) {
    return <div>Loading...</div>;
  }

  return (
    <div className="game-container">
      <button className="back-btn" onClick={onBack}>← Back</button>
      
      <div className="level-info">
        <h2>🎮 Game Mode - Level {currentLevel}</h2>
        <p>{levelConfig.description}</p>
        <div className={`timer-display ${timeLeft < 10000 ? 'timer-warning' : ''}`}>
          Time Left: {formatTime(timeLeft)}
        </div>
        <span className={`status-badge ${active ? 'active' : completed ? 'completed' : failed ? 'failed' : 'waiting'}`}>
          {active ? '🔍 Playing...' : completed ? '✅ Completed' : failed ? '❌ Time Up!' : '⏸️ Drag to select'}
        </span>
        <p style={{ fontSize: '0.9rem', marginTop: '10px', color: '#10aab8' }}>
          Click and drag to select words (straight lines or diagonals)
        </p>
      </div>
      
      <Grid 
        grid={grid} 
        highlightedCells={highlighted}
        selectedCells={selecting}
        onMouseDown={handleMouseDown}
        onMouseEnter={handleMouseEnter}
        onMouseUp={handleMouseUp}
      />
      
      <WordList words={words} found={found} />

      {(completed || failed) && (
        <div className="controls">
          {completed && (
            <div style={{ 
              textAlign: 'center', 
              padding: '20px', 
              background: '#2ecc71',
              borderRadius: '15px',
              color: 'white',
              marginBottom: '15px',
              width: '100%'
            }}>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>🎉 Level Complete!</h3>
              <p style={{ fontSize: '1.2rem' }}>
                Time Remaining: {formatTime(timeLeft)}
              </p>
            </div>
          )}
          
          {failed && (
            <div style={{ 
              textAlign: 'center', 
              padding: '20px', 
              background: '#e74c3c',
              borderRadius: '15px',
              color: 'white',
              marginBottom: '15px',
              width: '100%'
            }}>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>❌ Time's Up!</h3>
              <p style={{ fontSize: '1.2rem' }}>
                Found {found.length}/{words.length} words
              </p>
            </div>
          )}
          
          <button className="btn-reset" onClick={handleRestart}>
            🔄 Retry Level
          </button>
          {completed && currentLevel < 20 && (
            <button className="btn-next" onClick={handleNextLevel}>
              ➡️ Next Level
            </button>
          )}
          {currentLevel === 20 && completed && (
            <p style={{ textAlign: 'center', fontSize: '1.2rem', color: 'white', fontWeight: 'bold', width: '100%' }}>
              🏆 Congratulations! You completed all levels!
            </p>
          )}
        </div>
      )}
    </div>
  );
}