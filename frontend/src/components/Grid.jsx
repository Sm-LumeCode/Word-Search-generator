import React from "react";

function Grid({ grid, highlightedCells = [] }) {
  return (
    <div className="grid">
      {grid.map((row, i) =>
        row.map((cell, j) => {
          const cellKey = `${i}-${j}`;
          const isHighlighted = highlightedCells.includes(cellKey);
          
          return (
            <div 
              key={cellKey} 
              className={`cell ${isHighlighted ? 'highlighted' : ''}`}
            >
              {cell}
            </div>
          );
        })
      )}
    </div>
  );
}

export default Grid;