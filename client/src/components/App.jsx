import React, { useState, useCallback } from 'react';
import { BrowserRouter } from "react-router-dom";
import GoogleAuth from './GoogleAuth';
import { Analytics } from "@vercel/analytics/react"; // Fixed import
import Main from './Main';

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
    <BrowserRouter> {/* Move BrowserRouter to top level */}
      <div className="App">
        <GoogleAuth 
          onAuthSuccess={handleAuthSuccess}
          onAuthFailure={handleAuthFailure}
        >
          {isAuthenticated && authChecked && <Main />}
        </GoogleAuth>
        <Analytics />
      </div>
    </BrowserRouter>
  );
}

export default App;