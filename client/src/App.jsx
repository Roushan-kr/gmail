import React, { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import GoogleAuth from './components/GoogleAuth.jsx';
import Main from './components/Main.jsx';
import './index.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
  };

  return (
    <div className="App">
      <GoogleAuth onAuthSuccess={handleAuthSuccess}>
        {isAuthenticated && (
          <BrowserRouter>
            <Main />
          </BrowserRouter>
        )}
      </GoogleAuth>
    </div>
  );
}

export default App;
