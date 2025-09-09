import React from 'react';
import ReactDOM from 'react-dom/client';
import GameView from '@/components/GameView';
import ThemeInjector from '@/components/ThemeInjector';
import '@/index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to.");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ThemeInjector />
    <GameView />
  </React.StrictMode>
);
