import React from 'react';

export default function WordList({ words, found = [] }) {
  return (
    <div className="word-list-container">
      <h3>Words to Find ({found.length}/{words.length})</h3>
      <ul className="word-list">
        {words.map((word, index) => (
          <li 
            key={index} 
            className={found.includes(word) ? 'found' : ''}
          >
            {word}
          </li>
        ))}
      </ul>
    </div>
  );
}
