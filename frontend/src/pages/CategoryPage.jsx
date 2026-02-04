import React, { useEffect, useState } from 'react';

export default function CategoryPage({ onSelectCategory }) {
  const [puzzlePieces, setPuzzlePieces] = useState([]);

  useEffect(() => {
    const pieces = [];
    
    for (let i = 0; i < 30; i++) {
      let top, left;
      
      do {
        top = Math.random() * 100;
        left = Math.random() * 100;
      } while (
        (top > 20 && top < 80 && left > 10 && left < 90) ||
        (top < 30 && left > 20 && left < 80)
      );
      
      pieces.push({
        id: i,
        top: top,
        left: left,
        rotation: Math.random() * 360,
        opacity: 0.15 + Math.random() * 0.15,
        size: 30 + Math.random() * 30,
      });
    }
    
    setPuzzlePieces(pieces);
  }, []);

  const categories = [
    {
      id: 'content',
      title: '📝 Content',
      description: 'Fast generator and solver demo'
    },
    {
      id: 'demo',
      title: '🚀 Demo',
      description: 'Machine: Without DSA vs With DSA'
    },
    {
      id: 'game',
      title: '🎮 Game',
      description: 'Play manually with increasing levels'
    }
  ];

  return (
    <div className="category-page">
      <h2 className="category-title">Choose Your Mode</h2>
      <div className="category-grid">
        {categories.map(cat => (
          <div 
            key={cat.id}
            className="category-card"
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