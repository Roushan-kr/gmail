import React from 'react';
import { Box, Typography, Container, Paper, Divider, List, ListItem, ListItemText, styled, Button, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { Security, Storage, Share, Visibility, Update, ContactMail, ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
  },
});

const FullPageContainer = styled(Box)({
  minHeight: '100vh',
  backgroundColor: '#f8f9fa',
  display: 'flex',
  flexDirection: 'column',
});

const PolicyContainer = styled(Container)({
  maxWidth: '800px',
  padding: '40px 20px',
  backgroundColor: '#f8f9fa'
});

const PolicyPaper = styled(Paper)({
  padding: '40px',
  borderRadius: '12px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
});

const SectionHeader = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  marginBottom: '16px',
  marginTop: '32px'
});

const IconWrapper = styled(Box)({
  marginRight: '12px',
  color: '#1976d2'
});

const PrivacyPolicy = () => {
  const navigate = useNavigate();
  
  const lastUpdated = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const handleBackClick = () => {
    navigate('/');
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <FullPageContainer>
        <PolicyContainer>
          <PolicyPaper>
            <Box sx={{ mb: 2 }}>
              <Button 
                startIcon={<ArrowBack />} 
                onClick={handleBackClick}
                variant="outlined"
                size="small"
              >
                Back to Gmail Clone
              </Button>
            </Box>

            <Typography variant="h3" component="h1" gutterBottom align="center" color="primary">
              Privacy Policy
            </Typography>
            
            <Typography variant="subtitle1" align="center" color="textSecondary" gutterBottom>
              ReplyMate Application
            </Typography>
            
            <Typography variant="body2" align="center" color="textSecondary" sx={{ mb: 4 }}>
              Last Updated: {lastUpdated}
            </Typography>

            <Divider sx={{ mb: 4 }} />

            {/* Introduction */}
            <Typography variant="h5" gutterBottom color="primary">
              Introduction
            </Typography>
            <Typography variant="body1" paragraph>
              This ReplyMate application ("we", "our", or "us") is committed to protecting your privacy. 
              This Privacy Policy explains how we collect, use, and safeguard your information when you use 
              our email client application that integrates with Google's Gmail API.
            </Typography>

            <Typography variant="body1" paragraph>
              By using our application, you agree to the collection and use of information in accordance 
              with this policy. We only access the minimum data necessary to provide our email client 
              functionality.
            </Typography>

            {/* Information We Collect */}
            <SectionHeader>
              <IconWrapper>
                <Storage />
              </IconWrapper>
              <Typography variant="h5" color="primary">
                Information We Collect
              </Typography>
            </SectionHeader>

            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Gmail Data Access
            </Typography>
            <List>
              <ListItem>
                <ListItemText 
                  primary="Email Messages"
                  secondary="We access your Gmail messages to display them in our interface. This includes email content, sender/recipient information, timestamps, and attachments."
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Email Management"
                  secondary="We access permissions to send emails, mark emails as read/unread, move emails to trash, and manage email labels through our interface."
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Profile Information"
                  secondary="We access basic profile information including your name and email address to personalize the application experience."
                />
              </ListItem>
            </List>

            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Local Data Storage
            </Typography>
            <List>
              <ListItem>
                <ListItemText 
                  primary="Resume Information"
                  secondary="Personal details, education, skills, experience, and projects you enter in our Resume Assistant feature."
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="AI Interaction History"
                  secondary="Previous AI-generated responses and conversation context to improve future suggestions."
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Authentication Tokens"
                  secondary="Google OAuth tokens stored locally to maintain your login session."
                />
              </ListItem>
            </List>

            {/* How We Use Information */}
            <SectionHeader>
              <IconWrapper>
                <Visibility />
              </IconWrapper>
              <Typography variant="h5" color="primary">
                How We Use Your Information
              </Typography>
            </SectionHeader>

            <List>
              <ListItem>
                <ListItemText 
                  primary="Email Client Functionality"
                  secondary="To provide core email reading, composing, sending, and management features."
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="AI-Powered Assistance"
                  secondary="To generate contextual email replies using Google's Gemini AI based on your resume data and conversation history."
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Resume Generation"
                  secondary="To create professional PDF resumes using the information you provide."
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Personalization"
                  secondary="To customize the application experience and provide relevant suggestions."
                />
              </ListItem>
            </List>

            {/* Data Storage and Security */}
            <SectionHeader>
              <IconWrapper>
                <Security />
              </IconWrapper>
              <Typography variant="h5" color="primary">
                Data Storage and Security
              </Typography>
            </SectionHeader>

            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Local Storage Only
            </Typography>
            <Typography variant="body1" paragraph>
              All your personal data (resume information, AI context, preferences) is stored locally 
              in your browser using localStorage. We do not transmit this data to any external servers 
              or third parties.
            </Typography>

            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Gmail Data Access
            </Typography>
            <Typography variant="body1" paragraph>
              We access your Gmail data directly through Google's official Gmail API. Your email data 
              flows directly from Google to your browser without passing through our servers.
            </Typography>

            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              AI Processing
            </Typography>
            <Typography variant="body1" paragraph>
              When using AI features, your email content and instructions are sent to Google's Gemini AI 
              service to generate responses. This data is processed according to Google's privacy policies.
            </Typography>

            {/* Data Sharing */}
            <SectionHeader>
              <IconWrapper>
                <Share />
              </IconWrapper>
              <Typography variant="h5" color="primary">
                Data Sharing and Third Parties
              </Typography>
            </SectionHeader>

            <Typography variant="body1" paragraph>
              We do not sell, trade, or rent your personal information to third parties. Limited data 
              sharing occurs only in the following circumstances:
            </Typography>

            <List>
              <ListItem>
                <ListItemText 
                  primary="Google Services"
                  secondary="Gmail API for email access and Gemini AI for response generation, governed by Google's privacy policies."
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Legal Requirements"
                  secondary="If required by law or to protect our legal rights (though we have minimal data to share due to local-only storage)."
                />
              </ListItem>
            </List>

            {/* Your Rights and Controls */}
            <SectionHeader>
              <IconWrapper>
                <ContactMail />
              </IconWrapper>
              <Typography variant="h5" color="primary">
                Your Rights and Controls
              </Typography>
            </SectionHeader>

            <List>
              <ListItem>
                <ListItemText 
                  primary="Data Access and Export"
                  secondary="You can export your locally stored data (resume information, AI context) at any time using our export feature."
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Data Deletion"
                  secondary="You can clear all locally stored data through your browser settings or our application's clear data feature."
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Gmail Access Revocation"
                  secondary="You can revoke our access to your Gmail account at any time through your Google Account settings."
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Feature Control"
                  secondary="You can disable AI features, auto-save, or any other functionality at your discretion."
                />
              </ListItem>
            </List>

            {/* Data Retention */}
            <SectionHeader>
              <IconWrapper>
                <Update />
              </IconWrapper>
              <Typography variant="h5" color="primary">
                Data Retention
              </Typography>
            </SectionHeader>

            <Typography variant="body1" paragraph>
              Since all data is stored locally in your browser:
            </Typography>

            <List>
              <ListItem>
                <ListItemText 
                  primary="Local Data"
                  secondary="Remains until you clear your browser data or explicitly delete it through our application."
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Gmail Access"
                  secondary="Tokens expire automatically and can be revoked at any time through Google Account settings."
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="AI Context"
                  secondary="Limited to the last 50 interactions and automatically cycles older data."
                />
              </ListItem>
            </List>

            {/* Children's Privacy */}
            <Typography variant="h5" gutterBottom color="primary" sx={{ mt: 4 }}>
              Children's Privacy
            </Typography>
            <Typography variant="body1" paragraph>
              Our application is not intended for use by children under 13 years of age. We do not 
              knowingly collect personal information from children under 13.
            </Typography>

            {/* Changes to Privacy Policy */}
            <Typography variant="h5" gutterBottom color="primary" sx={{ mt: 4 }}>
              Changes to This Privacy Policy
            </Typography>
            <Typography variant="body1" paragraph>
              We may update this Privacy Policy from time to time. Changes will be posted in the 
              application with an updated "Last Updated" date. Continued use of the application 
              after changes constitutes acceptance of the updated policy.
            </Typography>

            {/* Contact Information */}
            <Typography variant="h5" gutterBottom color="primary" sx={{ mt: 4 }}>
              Contact Us
            </Typography>
            <Typography variant="body1" paragraph>
              If you have questions about this Privacy Policy or our data practices, please contact us:
            </Typography>
            
            <Box sx={{ mt: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
              <Typography variant="body2">
                <strong>Email:</strong> dev.roushncse@gmail.com<br/>
                <strong>Project:</strong> ReplyMate - Educational Application<br/>
                <strong>Data Controller:</strong> Local Browser Storage Only<br/>
                <strong>Terms of Service:</strong> 
                <Typography 
                  component="span" 
                  variant="body2" 
                  color="primary" 
                  sx={{ cursor: 'pointer', textDecoration: 'underline', ml: 1 }}
                  onClick={() => navigate('/terms')}
                >
                  View Terms
                </Typography>
              </Typography>
            </Box>

            <Divider sx={{ my: 4 }} />

            <Typography variant="body2" color="textSecondary" align="center">
              This privacy policy is designed to be transparent about our minimal data collection 
              practices. Your privacy and data security are our top priorities.
            </Typography>
          </PolicyPaper>
        </PolicyContainer>
      </FullPageContainer>
    </ThemeProvider>
  );
};

export default PrivacyPolicy;
