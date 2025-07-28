// Ensure browser compatibility for libraries expecting Node.js globals
(window as any).global ||= window;

import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(<App />);
