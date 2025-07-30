import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './components/App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import { trackPageLoad } from './utils/performanceMonitor.js'
import './index.css'

// Initialize performance tracking
trackPageLoad();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)

// Simple performance logging
if (typeof window !== 'undefined' && 'performance' in window) {
  console.log('Performance metrics available');
}
