'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const StatsContext = createContext();

export function StatsProvider({ children }) {
  const [stats, setStats] = useState({
    merged: 0,
    cropped: 0,
    removed: 0
  });

  // Load stats from localStorage on initial render
  useEffect(() => {
    const savedStats = localStorage.getItem('pdfEditorStats');
    if (savedStats) {
      try {
        setStats(JSON.parse(savedStats));
      } catch (error) {
        console.error('Error parsing stats from localStorage:', error);
      }
    }
  }, []);

  // Save stats to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('pdfEditorStats', JSON.stringify(stats));
  }, [stats]);

  // Functions to increment each stat
  const incrementMerged = () => {
    setStats(prev => ({ ...prev, merged: prev.merged + 1 }));
  };

  const incrementCropped = () => {
    setStats(prev => ({ ...prev, cropped: prev.cropped + 1 }));
  };

  const incrementRemoved = () => {
    setStats(prev => ({ ...prev, removed: prev.removed + 1 }));
  };

  return (
    <StatsContext.Provider 
      value={{ 
        stats, 
        incrementMerged, 
        incrementCropped, 
        incrementRemoved 
      }}
    >
      {children}
    </StatsContext.Provider>
  );
}

export function useStats() {
  const context = useContext(StatsContext);
  if (!context) {
    throw new Error('useStats must be used within a StatsProvider');
  }
  return context;
}
