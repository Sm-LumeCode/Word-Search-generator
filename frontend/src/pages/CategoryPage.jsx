import React, { useEffect, useState } from 'react';

export default function CategoryPage({ onSelectCategory }) {
  const [puzzlePieces, setPuzzlePieces] = useState([]);

  useEffect(() => {
    // Create puzzle pieces scattered across the screen, avoiding center area
    const pieces = [];
    
    for (let i = 0; i < 30; i++) {
      let top, left;
      
      // Keep trying until we get a position outside the center area
      do {
        top = Math.random() * 100;
        left = Math.random() * 100;
      } while (
        // Avoid center horizontal band (20-80% height, 10-90% width)
        (top > 20 && top < 80 && left > 10 && left < 90) ||
        // Avoid title area (top 30%)
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
      description: 'Fast generator and solver demo',
      color: 'linear-gradient(135deg, #ff6b35, #f7931e)',
      textColor: 'white'
    },
    {
      id: 'demo',
      title: '🚀 Demo',
      description: 'Manual vs DSA Speed Comparison',
      color: 'linear-gradient(135deg, #06ffa5, #00d9ff)',
      textColor: '#0f0f23'
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