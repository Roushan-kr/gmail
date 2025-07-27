import React, { useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import GoogleAuth from './components/GoogleAuth.jsx';
import Main from './components/Main.jsx';
import PrivacyPolicy from './components/PrivacyPolicy.jsx';
import TermsOfService from './components/TermsOfService.jsx';
import './index.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  const handleAuthSuccess = useCallback(() => {
    setIsAuthenticated(true);
    setAuthChecked(true);
  }, []);

  const handleAuthFailure = useCallback(() => {
    setIsAuthenticated(false);
    setAuthChecked(true);
  }, []);

  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          {/* Public routes - no authentication required */}
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          
          {/* Protected routes - authentication required */}
          <Route path="/*" element={
            <GoogleAuth 
              onAuthSuccess={handleAuthSuccess}
              onAuthFailure={handleAuthFailure}
            >
              {isAuthenticated && authChecked && <Main />}
            </GoogleAuth>
          } />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
