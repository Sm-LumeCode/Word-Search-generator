import React, { useState } from "react";
import { generateHardPuzzle } from "../algorithms/Generator";
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
  // Page state: 'scan', 'select', 'puzzle'
  const [page, setPage] = useState('scan');
  
  const [file, setFile] = useState(null);
  const [extractedWords, setExtractedWords] = useState([]);
  const [selectedWords, setSelectedWords] = useState([]);
  const [gridSize, setGridSize] = useState(10);
  const [grid, setGrid] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Puzzle page state
  const [found, setFound] = useState([]);
  const [highlightedCells, setHighlightedCells] = useState([]);
  const [solving, setSolving] = useState(false);

  // 📄 SCAN DOCUMENT
  const handleScan = async () => {
    if (!file) {
      setError("Please upload a document");
      return;
    }

    setLoading(true);
    setError("");

    try {
      let rawText = await readDocument(file);
      rawText = rawText.slice(0, 15000);

      const aiText = await getAIText(rawText);
      const extraction = extractKeywords(aiText, 15);

      if (!extraction.success) {
        throw new Error("Keyword extraction failed");
      }

      const words = getKeywordList(extraction);

      if (!words || words.length === 0) {
        throw new Error("No keywords extracted");
      }

      setExtractedWords(words);
      setSelectedWords(words); // default: all selected
      setPage('select'); // Move to selection page
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 🧩 GENERATE GRID
  const handleGenerate = () => {
    if (selectedWords.length < 3) {
      setError("Select at least 3 words");
      return;
    }

    const generatedGrid = generateHardPuzzle(gridSize, selectedWords);
    setGrid(generatedGrid);
    setFound([]);
    setHighlightedCells([]);
    setPage('puzzle'); // Move to puzzle page
  };

  // ☑️ TOGGLE WORD
  const toggleWord = (word) => {
    setSelectedWords(prev =>
      prev.includes(word)
        ? prev.filter(w => w !== word)
        : [...prev, word]
    );
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

  // 📄 SCAN PAGE
  if (page === 'scan') {
    return (
      <div className="game-mode">
        <button className="back-btn" onClick={onBack}>← Back</button>
        
        <h1>📄 Scan Document Mode</h1>
        <p className="mode-description">Upload a document to extract keywords and generate puzzle</p>

        <div className="setup-container">
          <div className="setup-step">
            <h3>Upload Document</h3>
            <p>Supported formats: .txt, .pdf, .docx (max 20 pages for PDF)</p>
            
            <input
              type="file"
              accept=".txt,.pdf,.docx"
              onChange={(e) => {
                setFile(e.target.files[0]);
                setError("");
              }}
              className="file-input"
            />

            <button 
              className="btn-primary" 
              onClick={handleScan} 
              disabled={loading || !file}
              style={{ marginTop: '20px' }}
            >
              {loading ? '⏳ Scanning Document...' : '🔍 Scan & Extract Keywords'}
            </button>

            {error && <div className="warning-message">{error}</div>}
          </div>
        </div>
      </div>
    );
  }

  // 📝 KEYWORD SELECTION PAGE
  if (page === 'select') {
    return (
      <div className="game-mode">
        <button className="back-btn" onClick={() => setPage('scan')}>← Back to Upload</button>
        
        <h1>📝 Select Keywords</h1>
        <p className="mode-description">
          Choose keywords to include in your puzzle (Selected: {selectedWords.length}/{extractedWords.length})
        </p>

        <div className="setup-container" style={{ maxWidth: '800px' }}>
          <div className="setup-step">
            <h3>Keywords Extracted</h3>
            <p>Click to select/deselect keywords for your puzzle</p>

            <div className="keyword-grid">
              {extractedWords.map((word, i) => (
                <div
                  key={i}
                  className={`keyword-chip ${selectedWords.includes(word) ? 'selected' : ''}`}
                  onClick={() => toggleWord(word)}
                >
                  {word}
                </div>
              ))}
            </div>

            {/* 🔢 GRID SIZE SLIDER */}
            <div style={{ marginTop: '30px' }}>
              <label className="slider-label">
                Grid Size: <strong>{gridSize} × {gridSize}</strong>
              </label>
              <input
                type="range"
                min="6"
                max="15"
                value={gridSize}
                onChange={(e) => setGridSize(Number(e.target.value))}
                className="grid-slider"
              />
            </div>

            {selectedWords.length < 3 && (
              <div className="warning-message" style={{ marginTop: '20px' }}>
                Please select at least 3 keywords
              </div>
            )}

            <button 
              className="btn-primary" 
              onClick={handleGenerate}
              disabled={selectedWords.length < 3}
              style={{ marginTop: '20px' }}
            >
              🧩 Generate Puzzle
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
