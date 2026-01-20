import React, { useEffect, useState } from 'react';

export default function CategoryPage({ onSelectCategory }) {
  const [letters, setLetters] = useState([]);

  useEffect(() => {
    // Create popping letters animation from random positions
    const letterPool = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const newLetters = [];
    
    for (let i = 0; i < 25; i++) {
      newLetters.push({
        id: i,
        char: letterPool[Math.floor(Math.random() * letterPool.length)],
        top: Math.random() * 100,
        left: Math.random() * 100,
        delay: Math.random() * 3,
        scale: 0.6 + Math.random() * 0.8,
      });
    }
    
    setLetters(newLetters);
  }, []);

  const categories = [
    {
      id: 'content',
      title: '📝 Content',
      description: 'Fast generator and solver demo',
      color: 'linear-gradient(135deg, #ff6b35, #f7931e)',
      textColor: 'white'
    },
    {
      id: 'demo',
      title: '🚀 Demo',
      description: 'Manual vs DSA Speed Comparison',
      color: 'linear-gradient(135deg, #9d4edd, #3d5af1)',
      textColor: 'white'
    }
  ];

  return (
    <div className="category-page">
      {/* Popping letters background */}
      {letters.map(letter => (
        <div
          key={letter.id}
          className="popping-letter"
          style={{
            top: `${letter.top}%`,
            left: `${letter.left}%`,
            animationDelay: `${letter.delay}s`,
            fontSize: `${letter.scale * 3}rem`,
          }}
        >
          {letter.char}
        </div>
      ))}
      
      <h2 className="category-title">Choose Your Mode</h2>
      <div className="category-grid">
        {categories.map(cat => (
          <div 
            key={cat.id}
            className="category-card"
            style={{ background: cat.color, color: cat.textColor }}
            onClick={() => onSelectCategory(cat.id)}
          >
            <h3>{cat.title}</h3>
            <p>{cat.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}