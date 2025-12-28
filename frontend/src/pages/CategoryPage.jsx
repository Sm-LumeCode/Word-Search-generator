import React from 'react';

export default function CategoryPage({ onSelectCategory }) {
  const categories = [
    {
      id: 'content',
      title: '📝 Content',
      description: 'Fast generator and solver demo',
      color: '#FF986A',
      textColor: '#161E54'
    },
    {
      id: 'demo',
      title: '🚀 Demo',
      description: 'Manual vs DSA Speed Comparison',
      color: '#161E54',
      textColor: 'white'
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