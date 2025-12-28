import React from 'react';

export default function WordList({ words, found }) {
  return (
    <div className="word-list">
      <h3>Words to Find ({found.length}/{words.length})</h3>
      <ul>
        {words.map(word => (
          <li 
            key={word}
            className={found.includes(word) ? 'found' : ''}
          >
            {word} {found.includes(word) && '✓'}
          </li>
        ))}
      </ul>
    </div>
  );
}