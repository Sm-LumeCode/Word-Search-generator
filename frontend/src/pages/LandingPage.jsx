import React from 'react';

export default function LandingPage({ onStart }) {
  return (
    <div className="landing-page">
      <div className="landing-content">
        <h1 className="game-title">🔍 Word Search Master</h1>
        <p className="game-subtitle">Challenge your mind with the ultimate word puzzle experience</p>
        <button className="start-btn" onClick={onStart}>
          Start Playing
        </button>
      </div>
    </div>
  );
}