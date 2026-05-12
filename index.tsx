import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register Service Worker for PWA capabilities using vite-plugin-pwa
registerSW({
  onNeedRefresh() {
    console.log('New content available, please refresh.');
    if (confirm('New update available. Reload now?')) {
      window.location.reload();
    }
  },
  onOfflineReady() {
    console.log('App ready for offline use.');
  },
});

console.log("index.tsx is loading");
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
