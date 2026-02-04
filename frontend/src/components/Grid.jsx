import React from 'react';

export default function Grid({ grid, highlightedCells = [], onMouseDown, onMouseEnter, onMouseUp, selectedCells = [] }) {
  // Responsive cell size calculation
  const getCellSize = () => {
    if (window.innerWidth <= 480) {
      return grid.length <= 8 ? 40 : grid.length <= 12 ? 35 : 30;
    }
    return grid.length <= 8 ? 50 : grid.length <= 12 ? 45 : 40;
  };

  const [cellSize, setCellSize] = React.useState(getCellSize());

  React.useEffect(() => {
    const handleResize = () => setCellSize(getCellSize());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [grid.length]);

  const handleTouchStart = (e) => {
    // Prevent default to stop scrolling/zooming while playing
    if (e.cancelable) e.preventDefault();

    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);

    if (element && element.dataset.row !== undefined) {
      const row = parseInt(element.dataset.row);
      const col = parseInt(element.dataset.col);
      onMouseDown && onMouseDown(row, col);
    }
  };

  const handleTouchMove = (e) => {
    if (e.cancelable) e.preventDefault();

    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);

    if (element && element.dataset.row !== undefined) {
      const row = parseInt(element.dataset.row);
      const col = parseInt(element.dataset.col);
      onMouseEnter && onMouseEnter(row, col);
    }
  };

  const handleTouchEnd = (e) => {
    // For touch end, we might not have a "current" element under finger if it lifted off.
    // However, the game logic typically expects the *last* valid hovered cell to determine the word.
    // In GameMode.jsx, onMouseUp typically uses the startCell and the "current" (last entered) cell logic 
    // implicitly via state or by passing the endpoint.
    // Looking at GameMode.jsx: `handleMouseUp(row, col)` uses the row/col passed to it.

    // We need the LAST valid touched cell.
    // Since 'touchend' touches list is empty, we use changedTouches.
    const touch = e.changedTouches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);

    if (element && element.dataset.row !== undefined) {
      const row = parseInt(element.dataset.row);
      const col = parseInt(element.dataset.col);
      onMouseUp && onMouseUp(row, col);
    } else {
      // If lifted outside, we might want to just cancel or try to end at last known?
      // For now, let's try to pass the event if possible or just rely on state.
      // Actually GameMode.jsx onMouseUp requires row/col.
      // If we can't get it, we might need to rely on the tracking in GameMode? 
      // No, GameMode relies on us passing it.

      // Fallback: If we lift finger outside a cell, strictly speaking we can't "end" on a specific cell.
      // But often user lifts *near* the last cell.
      // Let's rely on the user lifting 'on' a cell for now. 
      // Adding a global mouse up handler in GameMode helps for mouse, but for touch we need to be careful.
    }
  };

  return (
    <div
      className="grid"
      style={{
        gridTemplateColumns: `repeat(${grid[0].length}, ${cellSize}px)`,
        userSelect: 'none',
        touchAction: 'none' // Critical for preventing scroll on mobile
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {grid.map((row, i) =>
        row.map((cell, j) => {
          const cellKey = `${i}-${j}`;
          const isHighlighted = highlightedCells.includes(cellKey);
          const isSelected = selectedCells.includes(cellKey);

          return (
            <div
              key={cellKey}
              data-row={i}
              data-col={j}
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