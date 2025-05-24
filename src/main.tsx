
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { registerServiceWorker, showInstallPrompt, checkOnlineStatus } from './utils/pwa'

// Register PWA features
registerServiceWorker();
showInstallPrompt();
checkOnlineStatus();

createRoot(document.getElementById("root")!).render(<App />);
