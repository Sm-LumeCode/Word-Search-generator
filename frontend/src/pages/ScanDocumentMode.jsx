import React, { useState } from 'react';
import Grid from '../components/Grid';
import WordList from '../components/WordList';
import { generateHardPuzzle } from '../algorithms/Generator';
import { solveGrid } from '../algorithms/SolverDFS';

// AI Keyword Extraction
function extractKeywords(text) {
  const commonWords = new Set([
    'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
    'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
    'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
    'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their',
    'is', 'are', 'was', 'were', 'been', 'has', 'had', 'can', 'may', 'could',
    'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me'
  ]);

  const words = text
    .toUpperCase()
    .replace(/[^A-Z\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length >= 3 && word.length <= 12)
    .filter(word => !commonWords.has(word.toLowerCase()));

  const frequency = {};
  words.forEach(word => {
    frequency[word] = (frequency[word] || 0) + 1;
  });

  const sorted = Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .map(([word]) => word);

  return [...new Set(sorted)].slice(0, 20);
}

export default function ScanDocumentMode({ onBack }) {
  const [uploadMethod, setUploadMethod] = useState(null);
  const [textInput, setTextInput] = useState('');
  const [extractedKeywords, setExtractedKeywords] = useState([]);
  const [selectedKeywords, setSelectedKeywords] = useState([]);
  const [gridSize, setGridSize] = useState(10);
  const [showPuzzle, setShowPuzzle] = useState(false);
  const [grid, setGrid] = useState(null);
  const [found, setFound] = useState([]);
  const [highlightedCells, setHighlightedCells] = useState([]);
  const [solving, setSolving] = useState(false);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target.result;
        processText(text);
      };
      reader.readAsText(file);
    }
  };

  const handleTextSubmit = () => {
    if (textInput.trim()) {
      processText(textInput);
    }
  };

  const processText = (text) => {
    const keywords = extractKeywords(text);
    setExtractedKeywords(keywords);
    setSelectedKeywords(keywords.slice(0, Math.min(keywords.length, 10)));
  };

  const toggleKeyword = (keyword) => {
    if (selectedKeywords.includes(keyword)) {
      setSelectedKeywords(selectedKeywords.filter(k => k !== keyword));
    } else {
      setSelectedKeywords([...selectedKeywords, keyword]);
    }
  };

  const generatePuzzle = () => {
    if (selectedKeywords.length === 0) return;
    
    const newGrid = generateHardPuzzle(gridSize, selectedKeywords);
    setGrid(newGrid);
    setShowPuzzle(true);
    setFound([]);
    setHighlightedCells([]);
  };

  const handleSolve = () => {
    setSolving(true);
    setTimeout(() => {
      const result = solveGrid(grid, selectedKeywords);
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

  // PUZZLE VIEW
  if (showPuzzle && grid) {
    return (
      <div className="game-mode">
        <button className="back-btn" onClick={() => setShowPuzzle(false)}>
          ← Back to Keywords
        </button>

        <h1>🤖 AI Generated Word Search</h1>
        <p className="mode-description">Puzzle generated from your document keywords</p>

        <div className="controls">
          <button className="btn-generate" onClick={generatePuzzle}>
            🔄 Regenerate Puzzle
          </button>
          <button className="btn-solve" onClick={handleSolve} disabled={solving}>
            {solving ? '⏳ Solving...' : '🎯 Solve Puzzle'}
          </button>
        </div>

        <Grid grid={grid} highlightedCells={highlightedCells} />
        <WordList words={selectedKeywords} found={found} />
      </div>
    );
  }

  // KEYWORD SELECTION VIEW
  if (extractedKeywords.length > 0) {
    return (
      <div className="game-mode">
        <button 
          className="back-btn"
          onClick={() => {
            setExtractedKeywords([]);
            setSelectedKeywords([]);
            setUploadMethod(null);
            setTextInput('');
          }}
        >
          ← Start Over
        </button>

        <h1>🤖 AI Extracted Keywords</h1>

        <div className="setup-container">
          <div className="setup-step">
            <h3>Select Keywords for Puzzle</h3>
            <p>Click keywords to include/exclude them from the puzzle</p>

            <div className="keyword-grid">
              {extractedKeywords.map(keyword => (
                <div
                  key={keyword}
                  onClick={() => toggleKeyword(keyword)}
                  className={`keyword-chip ${selectedKeywords.includes(keyword) ? 'selected' : ''}`}
                >
                  {keyword}
                  {selectedKeywords.includes(keyword) && ' ✓'}
                </div>
              ))}
            </div>

            <div style={{ marginTop: '30px' }}>
              <label className="slider-label">
                Grid Size: {gridSize}x{gridSize}
              </label>
              <input
                type="range"
                min="8"
                max="20"
                value={gridSize}
                onChange={(e) => setGridSize(parseInt(e.target.value))}
                className="grid-slider"
              />
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                fontSize: '0.9rem', 
                color: 'var(--text-secondary)',
                marginTop: '5px'
              }}>
                <span>8x8</span>
                <span>20x20</span>
              </div>
            </div>

            <button
              onClick={generatePuzzle}
              disabled={selectedKeywords.length === 0}
              className="btn-primary"
              style={{ 
                width: '100%', 
                marginTop: '30px',
                opacity: selectedKeywords.length === 0 ? 0.5 : 1,
                cursor: selectedKeywords.length === 0 ? 'not-allowed' : 'pointer'
              }}
            >
              Generate Puzzle ({selectedKeywords.length} words)
            </button>
          </div>
        </div>
      </div>
    );
  }

  // UPLOAD METHOD SELECTION
  if (!uploadMethod) {
    return (
      <div className="game-mode">
        <button className="back-btn" onClick={onBack}>← Back</button>

        <h1>📄 Scan Document</h1>
        <p className="mode-description">AI will extract keywords from your document</p>

        <div className="setup-container">
          <div className="setup-step">
            <h3>Choose Input Method</h3>
            
            <div className="button-group">
              <button
                onClick={() => setUploadMethod('file')}
                className="btn-choice"
                style={{ minWidth: '100%', padding: '30px' }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '10px' }}>📁</div>
                Upload Document (TXT file)
              </button>

              <button
                onClick={() => setUploadMethod('text')}
                className="btn-choice"
                style={{ minWidth: '100%', padding: '30px' }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '10px' }}>✍️</div>
                Paste Text/Paragraph
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // FILE UPLOAD VIEW
  if (uploadMethod === 'file') {
    return (
      <div className="game-mode">
        <button className="back-btn" onClick={() => setUploadMethod(null)}>
          ← Back
        </button>

        <h1>📁 Upload Document</h1>

        <div className="setup-container">
          <div className="setup-step">
            <h3>Select Text File</h3>
            <p>Upload a .txt file containing your document or paragraph</p>
            
            <input
              type="file"
              accept=".txt"
              onChange={handleFileUpload}
              className="file-input"
            />
          </div>
        </div>
      </div>
    );
  }

  // TEXT INPUT VIEW
  if (uploadMethod === 'text') {
    return (
      <div className="game-mode">
        <button className="back-btn" onClick={() => setUploadMethod(null)}>
          ← Back
        </button>

        <h1>✍️ Paste Your Text</h1>

        <div className="setup-container">
          <div className="setup-step">
            <h3>Enter Your Document or Paragraph</h3>
            <p>AI will analyze the text and extract relevant keywords</p>
            
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Paste your document or paragraph here...

Example: Machine learning is a subset of artificial intelligence that focuses on developing algorithms and statistical models..."
              className="textarea-field"
              rows="10"
            />
            
            <button
              onClick={handleTextSubmit}
              disabled={!textInput.trim()}
              className="btn-primary"
              style={{ 
                width: '100%',
                opacity: textInput.trim() ? 1 : 0.5,
                cursor: textInput.trim() ? 'pointer' : 'not-allowed'
              }}
            >
              🤖 Extract Keywords with AI
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}