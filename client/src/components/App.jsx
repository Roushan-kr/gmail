import React, { useState, useCallback } from 'react';
import { BrowserRouter } from "react-router-dom";
import GoogleAuth from './GoogleAuth';
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
    <div className="App">
      <GoogleAuth 
        onAuthSuccess={handleAuthSuccess}
        onAuthFailure={handleAuthFailure}
      >
        {isAuthenticated && authChecked && (
          <BrowserRouter>
            <Main />
          </BrowserRouter>
        )}
      </GoogleAuth>
    </div>
  );
}

export default App;