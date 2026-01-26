import React, { useState, useEffect } from 'react';
import LandingPage from './pages/LandingPage';
import CategoryPage from './pages/CategoryPage';
import ContentModeSelection from './pages/ContentModeSelection';
import ContentMode from './pages/ContentMode';
import ScanDocumentMode from './pages/ScanDocumentMode';
import DemoMode from './pages/DemoMode';
import GameMode from './pages/GameMode';
import ThemeToggle from './components/ThemeToggle';

export default function App() {
  const [page, setPage] = useState('landing');
  const [category, setCategory] = useState(null);
  const [contentSubMode, setContentSubMode] = useState(null);
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    document.body.setAttribute('data-theme', savedTheme);
  }, []);

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  const renderPage = () => {
    if (page === 'landing') {
      return <LandingPage onStart={() => setPage('category')} />;
    }
    
    if (page === 'category') {
      return (
        <CategoryPage 
          onSelectCategory={(cat) => {
            setCategory(cat);
            if (cat === 'content') {
              setPage('content-selection');
            } else {
              setPage('game');
            }
          }} 
        />
      );
    }

    if (page === 'content-selection') {
      return (
        <ContentModeSelection
          onSelectMode={(mode) => {
            setContentSubMode(mode);
            setPage('game');
          }}
          onBack={() => setPage('category')}
        />
      );
    }

    if (page === 'game') {
      if (category === 'content') {
        if (contentSubMode === 'custom') {
          return <ContentMode onBack={() => setPage('content-selection')} />;
        }
        if (contentSubMode === 'scan') {
          return <ScanDocumentMode onBack={() => setPage('content-selection')} />;
        }
      }
      if (category === 'demo') {
        return <DemoMode onBack={() => setPage('category')} />;
      }
      if (category === 'game') {
        return <GameMode onBack={() => setPage('category')} />;
      }
    }
  };

  return (
    <div className="app">
      <ThemeToggle theme={theme} setTheme={setTheme} />
      {renderPage()}
    </div>
  );
}