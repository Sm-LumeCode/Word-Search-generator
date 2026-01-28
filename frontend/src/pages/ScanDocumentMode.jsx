import React, { useState } from 'react';
import Grid from '../components/Grid';
import WordList from '../components/WordList';
import { generateHardPuzzle } from '../algorithms/Generator';
import { solveGrid } from '../algorithms/SolverDFS';
import { extractKeywords, getKeywordList } from '../algorithms/KeywordExtractor';

export default function ScanDocumentMode({ onBack }) {
  const [uploadMethod, setUploadMethod] = useState(null);
  const [textInput, setTextInput] = useState('');
  const [extractionResult, setExtractionResult] = useState(null);
  const [selectedKeywords, setSelectedKeywords] = useState([]);
  const [gridSize, setGridSize] = useState(10);
  const [showPuzzle, setShowPuzzle] = useState(false);
  const [grid, setGrid] = useState(null);
  const [found, setFound] = useState([]);
  const [highlightedCells, setHighlightedCells] = useState([]);
  const [solving, setSolving] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [showSteps, setShowSteps] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setProcessing(true);
      
      if (file.type === 'application/pdf') {
        // Handle PDF
        try {
          const arrayBuffer = await file.arrayBuffer();
          const uint8Array = new Uint8Array(arrayBuffer);
          
          // Use PDF.js from CDN
          const pdfjsLib = window['pdfjs-dist/build/pdf'];
          pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
          
          const pdf = await pdfjsLib.getDocument(uint8Array).promise;
          let fullText = '';
          
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');
            fullText += pageText + '\n';
          }
          
          processText(fullText);
        } catch (error) {
          alert('Error reading PDF file. Please try a different file or paste text directly.');
          console.error(error);
        }
      } else {
        // Handle TXT
        const reader = new FileReader();
        reader.onload = (event) => {
          const text = event.target.result;
          processText(text);
        };
        reader.readAsText(file);
      }
      
      setProcessing(false);
    }
  };

  const handleTextSubmit = () => {
    if (textInput.trim()) {
      setProcessing(true);
      processText(textInput);
      setProcessing(false);
    }
  };

  const processText = (text) => {
    const result = extractKeywords(text, 20);
    
    if (result.success) {
      setExtractionResult(result);
      const keywords = getKeywordList(result);
      setSelectedKeywords(keywords.slice(0, Math.min(keywords.length, 10)));
    } else {
      alert(result.error || 'Error extracting keywords');
    }
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
        <p className="mode-description">Puzzle generated from your document keywords using DSA</p>

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
  if (extractionResult && extractionResult.success) {
    const allKeywords = getKeywordList(extractionResult);
    
    return (
      <div className="game-mode">
        <button 
          className="back-btn"
          onClick={() => {
            setExtractionResult(null);
            setSelectedKeywords([]);
            setUploadMethod(null);
            setTextInput('');
          }}
        >
          ← Start Over
        </button>

        <h1>🤖 AI Extracted Keywords (DSA)</h1>
        <p className="mode-description">
          Keywords extracted using HashMap, Frequency Analysis, and Sorting algorithms
        </p>

        <div className="setup-container">
          <div className="setup-step">
            {/* Stats Display */}
            <div className="stats-display">
              <div className="stat-item">
                <span className="stat-label">Total Words:</span>
                <span className="stat-value">{extractionResult.stats.totalWords}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Valid Words:</span>
                <span className="stat-value">{extractionResult.stats.validWords}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Bigrams Detected:</span>
                <span className="stat-value">{extractionResult.stats.bigramsDetected}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Unique Keywords:</span>
                <span className="stat-value">{extractionResult.stats.uniqueWords}</span>
              </div>
            </div>

            {/* Show DSA Steps Button */}
            <button
              onClick={() => setShowSteps(!showSteps)}
              className="btn-secondary"
              style={{ width: '100%', marginBottom: '20px' }}
            >
              {showSteps ? '📚 Hide' : '📚 Show'} DSA Processing Steps
            </button>

            {/* Processing Steps */}
            {showSteps && (
              <div className="processing-steps">
                {extractionResult.processingSteps.map((step, index) => (
                  <div key={index} className="step-item">
                    <h4>Step {step.step}: {step.name}</h4>
                    <p>{step.description}</p>
                    <div className="step-result">{step.result}</div>
                    {step.data && step.data.length > 0 && (
                      <div className="step-data">
                        {step.data.slice(0, 5).map((item, i) => (
                          <div key={i} className="data-item">{item}</div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <h3>Select Keywords for Puzzle</h3>
            <p>Click keywords to include/exclude them from the puzzle</p>

            <div className="keyword-grid">
              {allKeywords.map(keyword => (
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

        <h1>📄 Scan Document with AI</h1>
        <p className="mode-description">Upload a document or paste text to extract keywords using DSA algorithms</p>

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
                Upload Document (TXT or PDF)
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
            <h3>Select Document File</h3>
            <p>Upload a .txt or .pdf file containing your document</p>
            
            {processing ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--accent-blue)' }}>
                <div className="loading-spinner"></div>
                <p style={{ marginTop: '20px' }}>Processing document...</p>
              </div>
            ) : (
              <input
                type="file"
                accept=".txt,.pdf"
                onChange={handleFileUpload}
                className="file-input"
              />
            )}
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
            <p>AI will analyze the text using DSA algorithms and extract relevant keywords</p>
            
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Paste your document or paragraph here...

Example: Machine learning is a subset of artificial intelligence that focuses on developing algorithms and statistical models that enable computer systems to improve their performance on tasks through experience..."
              className="textarea-field"
              rows="10"
            />
            
            <button
              onClick={handleTextSubmit}
              disabled={!textInput.trim() || processing}
              className="btn-primary"
              style={{ 
                width: '100%',
                opacity: (textInput.trim() && !processing) ? 1 : 0.5,
                cursor: (textInput.trim() && !processing) ? 'pointer' : 'not-allowed'
              }}
            >
              {processing ? '⏳ Processing...' : '🤖 Extract Keywords with DSA'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}