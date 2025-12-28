import React from 'react';

export default function Grid({ grid, highlightedCells = [], onMouseDown, onMouseEnter, onMouseUp, selectedCells = [] }) {
  const cellSize = grid.length <= 8 ? 50 : grid.length <= 12 ? 45 : 40;
  
  return (
    <div 
      className="grid" 
      style={{
        gridTemplateColumns: `repeat(${grid[0].length}, ${cellSize}px)`,
        userSelect: 'none'
      }}
    >
      {grid.map((row, i) =>
        row.map((cell, j) => {
          const cellKey = `${i}-${j}`;
          const isHighlighted = highlightedCells.includes(cellKey);
          const isSelected = selectedCells.includes(cellKey);
          
          return (
            <div 
              key={cellKey} 
              className={`cell ${isHighlighted ? 'highlighted' : ''} ${isSelected ? 'selecting' : ''}`}
              onMouseDown={() => onMouseDown && onMouseDown(i, j)}
              onMouseEnter={() => onMouseEnter && onMouseEnter(i, j)}
              onMouseUp={() => onMouseUp && onMouseUp(i, j)}
              style={{ 
                width: cellSize, 
                height: cellSize,
                userSelect: 'none',
                WebkitUserSelect: 'none',
                MozUserSelect: 'none',
                msUserSelect: 'none'
              }}
            >
              {cell}
            </div>
          );
        })
      )}
    </div>
  );
}