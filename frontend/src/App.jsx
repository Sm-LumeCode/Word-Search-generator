import React, { useState } from "react";
import Grid from "./components/Grid";
import WordList from "./components/WordList";
import Controls from "./components/Controls";
import { generateGrid } from "./algorithms/Generator";
import { solveGrid } from "./algorithms/SolverDFS";

export default function App() {
  const words = ["CAT", "DOG", "BIRD", "FISH"];
  const [grid, setGrid] = useState(generateGrid(5, words));
  const [found, setFound] = useState([]);
  const [highlightedCells, setHighlightedCells] = useState([]);

  const handleSolve = () => {
    const result = solveGrid(grid, words);
    setFound(result);
    
    // Find positions of found words
    const highlighted = [];
    result.forEach(word => {
      const positions = findWordPositions(grid, word);
      highlighted.push(...positions);
    });
    setHighlightedCells(highlighted);
  };

  const handleGenerate = () => {
    setGrid(generateGrid(5, words));
    setFound([]);
    setHighlightedCells([]);
  };

  const findWordPositions = (grid, word) => {
    const positions = [];
    const rows = grid.length;
    const cols = grid[0].length;
    
    // Search in all 8 directions
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
            positions.push(...foundPositions);
          }
        }
      }
    }
    return positions;
  };

  const checkDirection = (grid, word, startRow, startCol, dr, dc) => {
    const positions = [];
    let r = startRow;
    let c = startCol;
    
    for (let i = 0; i < word.length; i++) {
      if (r < 0 || r >= grid.length || c < 0 || c >= grid[0].length) {
        return [];
      }
      if (grid[r][c] !== word[i]) {
        return [];
      }
      positions.push(`${r}-${c}`);
      r += dr;
      c += dc;
    }
    return positions;
  };

  return (
    <div className="app">
      <h1>🔍 Word Search Generator & Solver</h1>
      <Controls onGenerate={handleGenerate} onSolve={handleSolve} />
      <Grid grid={grid} highlightedCells={highlightedCells} />
      <WordList words={words} found={found} />
    </div>
  );
}