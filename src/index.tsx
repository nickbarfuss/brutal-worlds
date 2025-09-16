import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConnectionProvider } from '@/hooks/useConnection';
import App from '@/app/App';
import ThemeInjector from '@/theme/ThemeInjector';
import '@/index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to.");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ConnectionProvider>
      <ThemeInjector />
      <App />
    </ConnectionProvider>
  </React.StrictMode>
);
