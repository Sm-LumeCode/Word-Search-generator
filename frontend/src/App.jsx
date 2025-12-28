import React, { useState } from 'react';
import LandingPage from './pages/LandingPage';
import CategoryPage from './pages/CategoryPage';
import ContentMode from './pages/ContentMode';
import DemoMode from './pages/DemoMode';

export default function App() {
  const [page, setPage] = useState('landing');
  const [category, setCategory] = useState(null);

  const renderPage = () => {
    if (page === 'landing') {
      return <LandingPage onStart={() => setPage('category')} />;
    }
    
    if (page === 'category') {
      return (
        <CategoryPage 
          onSelectCategory={(cat) => {
            setCategory(cat);
            setPage('game');
          }} 
        />
      );
    }

    if (page === 'game') {
      if (category === 'content') {
        return <ContentMode onBack={() => setPage('category')} />;
      }
      if (category === 'demo') {
        return <DemoMode onBack={() => setPage('category')} />;
      }
    }
  };

  return <div className="app">{renderPage()}</div>;
}