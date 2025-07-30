import React, { useState, useEffect, useCallback } from 'react';
import { Box, Button, Typography, styled, CircularProgress } from '@mui/material';
import { initializeGapi, signIn, signOut, isSignedIn, startTokenRefresh } from '../api/gmailApi';
import { validateEnvironment, getSetupInstructions } from '../utils/envCheck.js';
import SetupGuide from './SetupGuide.jsx';
import { Link } from 'react-router-dom';
import { authCookies, cookieManager } from '../utils/cookieManager.js';

const AuthContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100vh',
  gap: '20px',
  padding: '20px'
});

const SignInButton = styled(Button)({
  backgroundColor: '#4285f4',
  color: 'white',
  padding: '12px 24px',
  fontSize: '16px',
  textTransform: 'none',
  '&:hover': {
    backgroundColor: '#357ae8'
  }
});

const GoogleAuth = ({ onAuthSuccess, onAuthFailure, children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [signingIn, setSigningIn] = useState(false);
  const [showSetupGuide, setShowSetupGuide] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check if cookies are enabled
        if (!cookieManager.isEnabled()) {
          throw new Error('Cookies are disabled. Please enable cookies to use this application.');
        }

        // Check for existing auth token in cookies
        const existingToken = authCookies.getAuthToken();
        if (existingToken) {
          console.log('Found existing auth token in cookies');
          setIsAuthenticated(true);
          onAuthSuccess();
          return;
        }

        // Validate environment first
        const envValidation = validateEnvironment();
        
        if (!envValidation.isValid) {
          throw new Error(`Configuration Error:\n${envValidation.errors.join('\n')}\n\n${getSetupInstructions()}`);
        }

        // Check if environment variables are available
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
        const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
        
        console.log('Environment check:', {
          clientId: clientId ? 'Set' : 'Missing',
          apiKey: apiKey ? 'Set' : 'Missing'
        });
        
        if (!clientId || !apiKey) {
          throw new Error('Google API credentials not found. Please check your .env file.');
        }

        // Wait for Google APIs to load with timeout
        const checkGoogleAPIs = () => {
          return new Promise((resolve, reject) => {
            let attempts = 0;
            const maxAttempts = 50;
            
            const checkInterval = setInterval(() => {
              attempts++;
              
              console.log(`Checking Google APIs... Attempt ${attempts}/${maxAttempts}`);
              console.log('window.gapi:', typeof window.gapi);
              console.log('window.google:', typeof window.google);
              
              if (window.gapi && window.google) {
                clearInterval(checkInterval);
                console.log('Google APIs are ready');
                resolve();
              } else if (attempts >= maxAttempts) {
                clearInterval(checkInterval);
                reject(new Error('Google APIs failed to load. Please check your internet connection.'));
              }
            }, 100);
          });
        };

        console.log('Waiting for Google APIs to load...');
        await checkGoogleAPIs();
        
        console.log('Google APIs loaded, initializing...');
        await initializeGapi();
        
        // Start token refresh mechanism
        startTokenRefresh();
        
        // Check authentication status
        const authenticated = isSignedIn();
        setIsAuthenticated(authenticated);
        
        if (authenticated) {
          console.log('User already authenticated');
          // Store auth token in cookie for persistence
          const token = window.gapi?.client?.getToken();
          if (token) {
            authCookies.setAuthToken(token.access_token, 3600);
          }
          onAuthSuccess();
        }
        
        console.log('Google API initialization complete');
      } catch (error) {
        console.error('Failed to initialize Google API:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
        setCheckingAuth(false);
      }
    };

    initAuth();
  }, [onAuthSuccess]);

  const handleSignIn = async () => {
    try {
      setSigningIn(true);
      setError('');
      
      console.log('Starting sign-in process...');
      await signIn();
      
      // Store auth token in cookie after successful sign-in
      const token = window.gapi?.client?.getToken();
      if (token) {
        authCookies.setAuthToken(token.access_token, 3600);
      }
      
      setIsAuthenticated(true);
      onAuthSuccess();
      console.log('Sign-in completed successfully');
    } catch (error) {
      console.error('Sign in failed:', error);
      
      // Provide user-friendly error messages
      let userMessage = 'Sign in failed. Please try again.';
      
      if (error.message.includes('cancelled by user')) {
        userMessage = 'Sign-in was cancelled. Please try again when ready.';
      } else if (error.message.includes('Access denied')) {
        userMessage = 'Access denied. Please grant the required Gmail permissions.';
      } else if (error.message.includes('popup_blocked')) {
        userMessage = 'Pop-up blocked. Please allow pop-ups for this site and try again.';
      } else if (error.message.includes('network')) {
        userMessage = 'Network error. Please check your internet connection.';
      }
      
      setError(userMessage);
    } finally {
      setSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      signOut();
      
      // Clear auth cookies
      authCookies.clearAuth();
      cookieManager.clearAll();
      
      setIsAuthenticated(false);
      window.location.reload();
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  // Enhanced error handling with retry mechanism
  const handleRetry = useCallback(async () => {
    if (retryCount >= 3) {
      setError('Maximum retry attempts reached. Please refresh the page.');
      return;
    }

    setIsRetrying(true);
    setRetryCount(prev => prev + 1);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      window.location.reload(); // Refresh to retry initialization
    } catch (error) {
      setError('Retry failed. Please refresh the page manually.');
    } finally {
      setIsRetrying(false);
    }
  }, [retryCount]);

  if (isLoading || checkingAuth) {
    return (
      <AuthContainer>
        <CircularProgress />
        <Typography>Loading Gmail...</Typography>
      </AuthContainer>
    );
  }

  if (error) {
    return (
      <AuthContainer>
        <Typography variant="h5" color="error" gutterBottom>
          Authentication Error
        </Typography>
        <Typography color="error" gutterBottom align="center">
          {error}
        </Typography>
        {retryCount < 3 && (
          <Button 
            onClick={handleRetry} 
            disabled={isRetrying}
            variant="outlined"
            sx={{ mt: 2 }}
          >
            {isRetrying ? 'Retrying...' : `Retry (${3 - retryCount} attempts left)`}
          </Button>
        )}
        <Typography variant="caption" sx={{ mt: 2, maxWidth: '400px' }}>
          If the problem persists, please check your internet connection and try refreshing the page.
        </Typography>
      </AuthContainer>
    );
  }

  if (!isAuthenticated) {
    return (
      <AuthContainer>
        <Typography variant="h4" gutterBottom>
          Gmail Clone
        </Typography>
        <Typography variant="body1" color="textSecondary" gutterBottom align="center">
          Sign in with your Google account to access your Gmail emails
        </Typography>
        
        {error && (
          <Typography color="error" gutterBottom align="center" style={{ marginBottom: '20px' }}>
            {error}
          </Typography>
        )}
        
        <SignInButton 
          onClick={handleSignIn} 
          disabled={signingIn || isLoading}
        >
          {signingIn ? 'Signing in...' : 'Sign in with Google'}
        </SignInButton>
        
        <Typography variant="caption" color="textSecondary" align="center" style={{ marginTop: '20px', maxWidth: '400px' }}>
          This app requires access to your Gmail account to read, send, and manage emails.
          Your data is processed locally and not stored on our servers.
        </Typography>

        <Box sx={{ marginTop: 2, display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Typography 
            variant="caption" 
            color="primary" 
            sx={{ cursor: 'pointer', textDecoration: 'underline' }}
            onClick={() => window.open('/privacy', '_blank')}
          >
            Privacy Policy
          </Typography>
          <Typography 
            variant="caption" 
            color="primary" 
            sx={{ cursor: 'pointer', textDecoration: 'underline' }}
            onClick={() => window.open('/terms', '_blank')}
          >
            Terms of Service
          </Typography>
        </Box>
      </AuthContainer>
    );
  }

  return (
    <Box>
      {children}
      <Box sx={{ position: 'fixed', top: 16, right: 16, zIndex: 1000 }}>
        <Button onClick={handleSignOut} variant="outlined" size="small">
          Sign Out
        </Button>
      </Box>
    </Box>
  );
};

export default GoogleAuth;
