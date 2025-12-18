import React from "react";
function WordList({ words, found }) {
  return (
    <div className="word-list">
      <h3>Words to Find</h3>
      <ul>
        {words.map(word => (
          <li 
            key={word}
            style={{ 
              color: found.includes(word) ? 'green' : 'black',
              fontWeight: found.includes(word) ? 'bold' : 'normal'
            }}
          >
            {word} {found.includes(word) && '✓'}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default WordList;