import React from 'react';
import ReactDOM from 'react-dom/client';
import Routes from './routes';
import './index.css';
import { initPdfWorker } from './lib/pdfWorker';

// Initialize PDF.js worker before rendering the app
initPdfWorker();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Routes />
  </React.StrictMode>,
);
