import React, { useState } from "react";
import { generateHardPuzzle, getMaxWordsForGrid } from "../algorithms/Generator";
import { extractKeywords, getKeywordList } from "../algorithms/KeywordExtractor";
import { getAIText } from "../utils/aiKeywordService";
import { solveGrid } from "../algorithms/SolverDFS";
import Grid from "../components/Grid";
import WordList from "../components/WordList";

import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

// ---------- document reader ----------
async function readDocument(file) {
  const ext = file.name.split(".").pop().toLowerCase();

  if (ext === "txt") return await file.text();

  if (ext === "docx") {
    const mammoth = await import("mammoth");
    const buffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer: buffer });
    return result.value;
  }

  if (ext === "pdf") {
    const buffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;

    if (pdf.numPages > 20) {
      throw new Error("PDF too large (max 20 pages)");
    }

    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map(item => item.str).join(" ");
    }

    return text;
  }

  throw new Error("Unsupported file type");
}

// ---------- COMPONENT ----------
export default function ScanDocumentMode({ onBack }) {
  // Page state: 'choice', 'scan', 'select', 'puzzle'
  const [page, setPage] = useState('choice');
  
  const [uploadMethod, setUploadMethod] = useState(null); // 'file' or 'text'
  const [file, setFile] = useState(null);
  const [textInput, setTextInput] = useState('');
  const [extractedWords, setExtractedWords] = useState([]);
  const [extractionResult, setExtractionResult] = useState(null);
  const [selectedWords, setSelectedWords] = useState([]);
  const [gridSize, setGridSize] = useState(10);
  const [grid, setGrid] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Puzzle page state
  const [found, setFound] = useState([]);
  const [highlightedCells, setHighlightedCells] = useState([]);
  const [solving, setSolving] = useState(false);
  const [showSteps, setShowSteps] = useState(false);

  // Calculate maximum words allowed for current grid size
  const maxWordsAllowed = getMaxWordsForGrid(gridSize);

  // 📄 PROCESS FILE UPLOAD
  const handleFileUpload = async (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    setLoading(true);
    setError("");

    try {
      let rawText = await readDocument(uploadedFile);
      rawText = rawText.slice(0, 15000);

      const aiText = await getAIText(rawText);
      const extraction = extractKeywords(aiText, 20); // Extract more for user to choose

      if (!extraction.success) {
        throw new Error("Keyword extraction failed");
      }

      setExtractionResult(extraction);
      const words = getKeywordList(extraction);

      if (!words || words.length === 0) {
        throw new Error("No keywords extracted");
      }

      setExtractedWords(words);
      // Default select only up to max allowed
      setSelectedWords(words.slice(0, Math.min(maxWordsAllowed, words.length)));
      setPage('select'); // Move to selection page
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ✏️ PROCESS TEXT INPUT
  const handleTextSubmit = async () => {
    if (!textInput.trim()) {
      setError("Please enter some text");
      return;
    }

    setLoading(true);
    setError("");

    try {
      let rawText = textInput.slice(0, 15000);

      const aiText = await getAIText(rawText);
      const extraction = extractKeywords(aiText, 20); // Extract more for user to choose

      if (!extraction.success) {
        throw new Error("Keyword extraction failed");
      }

      setExtractionResult(extraction);
      const words = getKeywordList(extraction);

      if (!words || words.length === 0) {
        throw new Error("No keywords extracted");
      }

      setExtractedWords(words);
      // Default select only up to max allowed
      setSelectedWords(words.slice(0, Math.min(maxWordsAllowed, words.length)));
      setPage('select'); // Move to selection page
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 🧩 GENERATE GRID WITH VALIDATION
  const handleGenerate = () => {
    setError("");
    
    if (selectedWords.length < 3) {
      setError("❌ Please select at least 3 keywords");
      return;
    }

    if (selectedWords.length > maxWordsAllowed) {
      setError(`❌ Too many words! Maximum ${maxWordsAllowed} words allowed for ${gridSize}×${gridSize} grid. Please deselect ${selectedWords.length - maxWordsAllowed} word(s) or increase grid size.`);
      return;
    }

    // Check if any word is too long for the grid
    const tooLongWords = selectedWords.filter(word => word.length > gridSize);
    if (tooLongWords.length > 0) {
      setError(`❌ These words are too long for ${gridSize}×${gridSize} grid: ${tooLongWords.join(', ')}. Please increase grid size or deselect them.`);
      return;
    }

    const generatedGrid = generateHardPuzzle(gridSize, selectedWords);
    setGrid(generatedGrid);
    setFound([]);
    setHighlightedCells([]);
    setPage('puzzle'); // Move to puzzle page
  };

  // ☑️ TOGGLE WORD WITH VALIDATION
  const toggleWord = (word) => {
    const isCurrentlySelected = selectedWords.includes(word);
    
    if (isCurrentlySelected) {
      // Deselecting - always allow
      setSelectedWords(prev => prev.filter(w => w !== word));
      setError("");
    } else {
      // Selecting - check if we're at max
      if (selectedWords.length >= maxWordsAllowed) {
        setError(`⚠️ Maximum ${maxWordsAllowed} words allowed for ${gridSize}×${gridSize} grid. Please deselect a word first or increase grid size.`);
      } else {
        setSelectedWords(prev => [...prev, word]);
        setError("");
      }
    }
  };

  // Handle grid size change
  const handleGridSizeChange = (newSize) => {
    setGridSize(newSize);
    const newMaxWords = getMaxWordsForGrid(newSize);
    
    // If current selection exceeds new max, show warning but don't auto-deselect
    if (selectedWords.length > newMaxWords) {
      setError(`⚠️ You have ${selectedWords.length} words selected but ${newSize}×${newSize} grid allows maximum ${newMaxWords} words. Please deselect ${selectedWords.length - newMaxWords} word(s).`);
    } else {
      setError("");
    }
  };

  // 🎯 SOLVE PUZZLE
  const handleSolve = () => {
    setSolving(true);
    setTimeout(() => {
      const result = solveGrid(grid, selectedWords);
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

  // Find word positions in grid
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

  // 🔄 REGENERATE
  const handleRegenerate = () => {
    const newGrid = generateHardPuzzle(gridSize, selectedWords);
    setGrid(newGrid);
    setFound([]);
    setHighlightedCells([]);
  };

  // 🔄 START OVER
  const handleStartOver = () => {
    setPage('choice');
    setUploadMethod(null);
    setFile(null);
    setTextInput('');
    setExtractedWords([]);
    setExtractionResult(null);
    setSelectedWords([]);
    setGrid(null);
    setFound([]);
    setHighlightedCells([]);
    setError('');
  };

  // 📋 CHOICE PAGE - Upload Method Selection
  if (page === 'choice') {
    return (
      <div className="game-mode">
        <button className="back-btn" onClick={onBack}>← Back</button>

        <h1>📄 Scan Document Mode</h1>
        <p className="mode-description">Upload a document or paste text to extract keywords using AI & DSA algorithms</p>

        <div className="setup-container">
          <div className="setup-step">
            <h3>Choose Input Method</h3>
            
            <div className="button-group" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <button
                onClick={() => {
                  setUploadMethod('file');
                  setPage('scan');
                }}
                className="btn-choice"
                style={{ minWidth: '100%', padding: '30px' }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '10px' }}>📁</div>
                Upload Document (TXT, PDF, or DOCX)
              </button>

              <button
                onClick={() => {
                  setUploadMethod('text');
                  setPage('scan');
                }}
                className="btn-choice"
                style={{ minWidth: '100%', padding: '30px' }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '10px' }}>✏️</div>
                Paste Text/Paragraph
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 📄 SCAN PAGE - File Upload or Text Input
  if (page === 'scan') {
    return (
      <div className="game-mode">
        <button className="back-btn" onClick={() => setPage('choice')}>← Back</button>
        
        <h1>📄 {uploadMethod === 'file' ? 'Upload Document' : 'Paste Text'}</h1>
        <p className="mode-description">
          {uploadMethod === 'file' 
            ? 'Upload a document to extract keywords and generate puzzle' 
            : 'Paste your text to extract keywords and generate puzzle'}
        </p>

        <div className="setup-container">
          <div className="setup-step">
            {uploadMethod === 'file' ? (
              <>
                <h3>Upload Document</h3>
                <p>Supported formats: .txt, .pdf, .docx (max 20 pages for PDF)</p>
                
                {loading ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: 'var(--accent-blue)' }}>
                    <div className="loading-spinner"></div>
                    <p style={{ marginTop: '20px' }}>⏳ Processing document...</p>
                  </div>
                ) : (
                  <input
                    type="file"
                    accept=".txt,.pdf,.docx"
                    onChange={handleFileUpload}
                    className="file-input"
                  />
                )}
              </>
            ) : (
              <>
                <h3>Enter Your Document or Paragraph</h3>
                <p>AI will analyze the text using DSA algorithms and extract relevant keywords</p>
                
                <textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Paste your document or paragraph here...

Example: Machine learning is a subset of artificial intelligence that focuses on developing algorithms and statistical models that enable computer systems to improve their performance on tasks through experience..."
                  className="textarea-field"
                  rows="10"
                  style={{ width: '100%', marginBottom: '20px' }}
                />
                
                <button
                  onClick={handleTextSubmit}
                  disabled={!textInput.trim() || loading}
                  className="btn-primary"
                  style={{ 
                    width: '100%',
                    opacity: (textInput.trim() && !loading) ? 1 : 0.5,
                    cursor: (textInput.trim() && !loading) ? 'pointer' : 'not-allowed'
                  }}
                >
                  {loading ? '⏳ Processing...' : '🤖 Extract Keywords with AI'}
                </button>
              </>
            )}

            {error && <div className="warning-message" style={{ marginTop: '20px' }}>{error}</div>}
          </div>
        </div>
      </div>
    );
  }

  // 📝 KEYWORD SELECTION PAGE
  if (page === 'select') {
    return (
      <div className="game-mode">
        <button className="back-btn" onClick={handleStartOver}>← Start Over</button>
        
        <h1>📝 Select Keywords</h1>
        <p className="mode-description">
          Choose keywords to include in your puzzle (Selected: {selectedWords.length}/{extractedWords.length} | Max allowed: {maxWordsAllowed})
        </p>

        <div className="setup-container" style={{ maxWidth: '800px' }}>
          <div className="setup-step">
            {/* Stats Display */}
            {extractionResult && extractionResult.stats && (
              <div className="stats-display" style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                gap: '15px', 
                marginBottom: '20px',
                padding: '15px',
                background: 'var(--bg-secondary)',
                borderRadius: '8px'
              }}>
                <div className="stat-item">
                  <span className="stat-label" style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total Words:</span>
                  <span className="stat-value" style={{ display: 'block', fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent-blue)' }}>
                    {extractionResult.stats.totalWords}
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label" style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Valid Words:</span>
                  <span className="stat-value" style={{ display: 'block', fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent-green)' }}>
                    {extractionResult.stats.validWords}
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label" style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Bigrams:</span>
                  <span className="stat-value" style={{ display: 'block', fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent-purple)' }}>
                    {extractionResult.stats.bigramsDetected}
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label" style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Unique Keywords:</span>
                  <span className="stat-value" style={{ display: 'block', fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent-orange)' }}>
                    {extractionResult.stats.uniqueWords}
                  </span>
                </div>
              </div>
            )}

            {/* Show DSA Steps Button */}
            {extractionResult && extractionResult.processingSteps && (
              <button
                onClick={() => setShowSteps(!showSteps)}
                className="btn-secondary"
                style={{ width: '100%', marginBottom: '20px' }}
              >
                {showSteps ? '📚 Hide' : '📚 Show'} DSA Processing Steps
              </button>
            )}

            {/* Processing Steps */}
            {showSteps && extractionResult && extractionResult.processingSteps && (
              <div className="processing-steps" style={{ 
                marginBottom: '20px', 
                padding: '15px', 
                background: 'var(--bg-secondary)', 
                borderRadius: '8px',
                maxHeight: '400px',
                overflowY: 'auto'
              }}>
                {extractionResult.processingSteps.map((step, index) => (
                  <div key={index} className="step-item" style={{ marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px solid var(--border-color)' }}>
                    <h4 style={{ color: 'var(--accent-blue)', marginBottom: '5px' }}>Step {step.step}: {step.name}</h4>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>{step.description}</p>
                    <div className="step-result" style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{step.result}</div>
                    {step.data && step.data.length > 0 && (
                      <div className="step-data" style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '8px' }}>
                        {step.data.slice(0, 5).map((item, i) => (
                          <div key={i} className="data-item" style={{ 
                            padding: '4px 8px', 
                            background: 'var(--bg-primary)', 
                            borderRadius: '4px',
                            fontSize: '0.8rem'
                          }}>{item}</div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <h3>Keywords Extracted</h3>
            <p>Click to select/deselect keywords for your puzzle</p>

            <div className="keyword-grid" style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', 
              gap: '10px', 
              marginBottom: '20px' 
            }}>
              {extractedWords.map((word, i) => (
                <div
                  key={i}
                  className={`keyword-chip ${selectedWords.includes(word) ? 'selected' : ''}`}
                  onClick={() => toggleWord(word)}
                  style={{ 
                    padding: '10px 15px', 
                    borderRadius: '8px', 
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.2s'
                  }}
                >
                  {word}
                  {selectedWords.includes(word) && ' ✓'}
                </div>
              ))}
            </div>

            {/* 🔢 GRID SIZE SLIDER - BLUE ONLY */}
            <div style={{ marginTop: '30px' }}>
              <label className="slider-label" style={{ display: 'block', marginBottom: '10px' }}>
                Grid Size: <strong>{gridSize} × {gridSize}</strong> (Max words: {maxWordsAllowed})
              </label>
              <input
                type="range"
                min="6"
                max="15"
                value={gridSize}
                onChange={(e) => handleGridSizeChange(Number(e.target.value))}
                className="grid-slider"
                style={{ 
                  width: '100%',
                  accentColor: '#3498db' // Blue color only
                }}
              />
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                fontSize: '0.9rem', 
                color: 'var(--text-secondary)',
                marginTop: '5px'
              }}>
                <span>6×6</span>
                <span>15×15</span>
              </div>
            </div>

            {/* Warning/Error Messages */}
            {error && (
              <div className="warning-message" style={{ marginTop: '20px', padding: '15px', background: '#fee', border: '1px solid #fcc', borderRadius: '8px', color: '#c00' }}>
                {error}
              </div>
            )}

            {selectedWords.length < 3 && !error && (
              <div className="warning-message" style={{ marginTop: '20px' }}>
                Please select at least 3 keywords
              </div>
            )}

            <button 
              className="btn-primary" 
              onClick={handleGenerate}
              disabled={selectedWords.length < 3 || selectedWords.length > maxWordsAllowed}
              style={{ 
                marginTop: '20px',
                width: '100%',
                opacity: (selectedWords.length >= 3 && selectedWords.length <= maxWordsAllowed) ? 1 : 0.5,
                cursor: (selectedWords.length >= 3 && selectedWords.length <= maxWordsAllowed) ? 'pointer' : 'not-allowed'
              }}
            >
              🧩 Generate Puzzle ({selectedWords.length} words)
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 🧩 PUZZLE PAGE
  if (page === 'puzzle' && grid) {
    return (
      <div className="game-mode">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <button className="back-btn" onClick={() => setPage('select')}>← Back to Keywords</button>
          <button className="back-btn" onClick={onBack} style={{ background: 'var(--accent-purple)', borderColor: 'var(--accent-purple)' }}>
            🏠 Back to Categories
          </button>
        </div>
        
        <h1>🧩 Your Word Search Puzzle</h1>
        <p className="mode-description">
          {found.length === selectedWords.length 
            ? '🎉 All words found!' 
            : `Found ${found.length} of ${selectedWords.length} words`}
        </p>

        <div className="controls">
          <button className="btn-generate" onClick={handleRegenerate}>
            🔄 Regenerate Puzzle
          </button>
          <button 
            className="btn-solve" 
            onClick={handleSolve} 
            disabled={solving || found.length === selectedWords.length}
          >
            {solving ? '⏳ Solving...' : found.length === selectedWords.length ? '✅ All Found' : '🎯 Solve Puzzle'}
          </button>
        </div>

        <Grid grid={grid} highlightedCells={highlightedCells} />
        <WordList words={selectedWords} found={found} />
      </div>
    );
  }

  return null;
}