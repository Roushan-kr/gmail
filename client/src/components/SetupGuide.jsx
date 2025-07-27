import React, { useState } from 'react';
import { Box, Typography, Button, Stepper, Step, StepLabel, Paper, styled } from '@mui/material';

const SetupContainer = styled(Box)({
  maxWidth: '800px',
  margin: '0 auto',
  padding: '20px'
});

const StepContent = styled(Paper)({
  padding: '16px',
  margin: '16px 0',
  backgroundColor: '#f5f5f5'
});

const SetupGuide = ({ onComplete }) => {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    'Create Google Cloud Project',
    'Enable Gmail API',
    'Configure OAuth Consent',
    'Create Credentials',
    'Update Environment Variables'
  ];

  const stepInstructions = [
    {
      title: 'Create Google Cloud Project',
      content: `1. Go to Google Cloud Console: https://console.cloud.google.com/
2. Click "Select a project" at the top
3. Click "New Project"
4. Enter a project name (e.g., "Gmail Clone")
5. Click "Create"`
    },
    {
      title: 'Enable Gmail API',
      content: `1. In your project, go to "APIs & Services" > "Library"
2. Search for "Gmail API"
3. Click on the Gmail API result
4. Click "Enable"
5. Wait for the API to be enabled`
    },
    {
      title: 'Configure OAuth Consent Screen',
      content: `1. Go to "APIs & Services" > "OAuth consent screen"
2. Choose "External" user type
3. Click "Create"
4. Fill in required fields:
   - App name: Gmail Clone
   - User support email: your email
   - Developer contact: your email
5. Click "Save and Continue" through all steps`
    },
    {
      title: 'Create Credentials',
      content: `1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client ID"
3. Application type: Web application
4. Name: Gmail Clone Client
5. Authorized JavaScript origins: http://localhost:3000
6. Click "Create" and copy the Client ID

7. Click "Create Credentials" > "API Key"
8. Copy the API Key`
    },
    {
      title: 'Update Environment Variables',
      content: `1. Create a .env file in your project root
2. Add these lines with your actual credentials:

VITE_GOOGLE_CLIENT_ID=your_client_id_here
VITE_GOOGLE_API_KEY=your_api_key_here

3. Restart your development server
4. Click "Complete Setup" below`
    }
  ];

  return (
    <SetupContainer>
      <Typography variant="h4" gutterBottom align="center">
        Gmail API Setup Guide
      </Typography>
      
      <Stepper activeStep={activeStep} orientation="vertical">
        {steps.map((label, index) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
            {activeStep === index && (
              <StepContent>
                <Typography variant="h6" gutterBottom>
                  {stepInstructions[index].title}
                </Typography>
                <Typography component="pre" style={{ whiteSpace: 'pre-wrap', fontSize: '14px' }}>
                  {stepInstructions[index].content}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  {index < steps.length - 1 ? (
                    <Button
                      variant="contained"
                      onClick={() => setActiveStep(index + 1)}
                      sx={{ mr: 1 }}
                    >
                      Next Step
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      color="success"
                      onClick={onComplete}
                    >
                      Complete Setup
                    </Button>
                  )}
                  {index > 0 && (
                    <Button onClick={() => setActiveStep(index - 1)}>
                      Back
                    </Button>
                  )}
                </Box>
              </StepContent>
            )}
          </Step>
        ))}
      </Stepper>
    </SetupContainer>
  );
};

export default SetupGuide;
