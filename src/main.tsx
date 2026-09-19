import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerServiceWorker } from './services/serviceWorkerRegistration';

// Register NoorSync Offline Service Worker
registerServiceWorker({
  onSuccess: () => console.log('NoorSync Service Worker registered: App ready for offline use.'),
  onUpdate: () => console.log('NoorSync update available.'),
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
