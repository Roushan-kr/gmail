import React, { useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import GoogleAuth from './GoogleAuth';
import { Analytics } from "@vercel/analytics/react";
import Main from './Main';
import PrivacyPolicy from './PrivacyPolicy';
import TermsOfService from './TermsOfService';

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
          {/* Public routes - accessible without authentication */}
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          
          {/* Protected routes - require authentication */}
          <Route path="*" element={
            <GoogleAuth 
              onAuthSuccess={handleAuthSuccess}
              onAuthFailure={handleAuthFailure}
            >
              {isAuthenticated && authChecked && <Main />}
            </GoogleAuth>
          } />
        </Routes>
        <Analytics />
      </div>
    </BrowserRouter>
  );
}

export default App;