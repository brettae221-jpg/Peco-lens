import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register Service Worker for PWA capabilities using vite-plugin-pwa
const updateSW = registerSW({
  onNeedRefresh() {
    console.log('New content available, please refresh.');
    // Fire a custom event that pwaService can listen to
    window.dispatchEvent(new CustomEvent('pwa-update-available'));
  },
  onOfflineReady() {
    console.log('App ready for offline use.');
  },
});

// Expose registration for the custom pwaService
(window as any).swRegistration = {
    waiting: true, // simplified flag for UI check
    update: updateSW,
    postMessage: (msg: any) => {
        if (msg.type === 'SKIP_WAITING') {
            updateSW(true);
        }
    }
};

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
