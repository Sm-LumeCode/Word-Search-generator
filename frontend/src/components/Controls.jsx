import React from "react";
function Controls({ onGenerate, onSolve }) {
  return (
    <div className="controls">
      <button onClick={onGenerate}>Generate</button>
      <button onClick={onSolve}>Solve</button>
    </div>
  );
}

export default Controls;