import React from 'react';

export default function ContentModeSelection({ onSelectMode, onBack }) {
  const modes = [
    {
      id: 'custom',
      title: '⚙️ Custom Content',
      description: 'Create puzzles with your own words',
      icon: '⚙️'
    },
    {
      id: 'scan',
      title: '📄 Scan Document',
      description: 'AI extracts keywords from your text',
      icon: '🤖'
    }
  ];

  return (
    <div className="category-page">
      <button className="back-btn" onClick={onBack}>← Back</button>
      
      <h2 className="category-title">📝 Content Mode</h2>
      
      <div className="category-grid" style={{ maxWidth: '900px' }}>
        {modes.map(mode => (
          <div 
            key={mode.id}
            className="category-card"
            onClick={() => onSelectMode(mode.id)}
          >
            <div style={{ fontSize: '4rem', marginBottom: '20px' }}>{mode.icon}</div>
            <h3>{mode.title}</h3>
            <p>{mode.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}