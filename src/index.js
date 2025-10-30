import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/App';
import './App.css';

// Import Tauri API to make it available globally
import './services/tauriApi';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
