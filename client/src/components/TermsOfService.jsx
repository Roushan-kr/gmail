import React from 'react';
import { Box, Typography, Container, Paper, Divider, List, ListItem, ListItemText, styled, Button } from '@mui/material';
import { Gavel, Assignment, Warning, AccountBalance, ContactMail, ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

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

const TermsOfService = () => {
  const navigate = useNavigate();
  
  const lastUpdated = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const handleBackClick = () => {
    try {
      navigate(-1);
    } catch (error) {
      window.history.back();
    }
  };

  return (
    <PolicyContainer>
      <PolicyPaper>
        {/* Back Button */}
        <Box sx={{ mb: 2 }}>
          <Button 
            startIcon={<ArrowBack />} 
            onClick={handleBackClick}
            variant="outlined"
            size="small"
          >
            Back
          </Button>
        </Box>

        <Typography variant="h3" component="h1" gutterBottom align="center" color="primary">
          Terms of Service
        </Typography>
        
        <Typography variant="subtitle1" align="center" color="textSecondary" gutterBottom>
          Gmail Clone Application
        </Typography>
        
        <Typography variant="body2" align="center" color="textSecondary" sx={{ mb: 4 }}>
          Last Updated: {lastUpdated}
        </Typography>

        <Divider sx={{ mb: 4 }} />

        {/* Introduction */}
        <Typography variant="h5" gutterBottom color="primary">
          Agreement to Terms
        </Typography>
        <Typography variant="body1" paragraph>
          These Terms of Service ("Terms") govern your use of the Gmail Clone application ("Service") 
          operated by us ("we", "our", or "us"). By accessing or using our Service, you agree to be 
          bound by these Terms.
        </Typography>

        <Typography variant="body1" paragraph>
          If you disagree with any part of these terms, then you may not access the Service. 
          This application is intended for educational and demonstration purposes.
        </Typography>

        {/* Service Description */}
        <SectionHeader>
          <IconWrapper>
            <Assignment />
          </IconWrapper>
          <Typography variant="h5" color="primary">
            Service Description
          </Typography>
        </SectionHeader>

        <Typography variant="body1" paragraph>
          Gmail Clone is an educational web application that provides:
        </Typography>

        <List>
          <ListItem>
            <ListItemText 
              primary="Email Client Interface"
              secondary="A web-based interface to access and manage your Gmail account through Google's official APIs."
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="AI-Powered Email Assistant"
              secondary="Integration with Google's Gemini AI to help compose professional email responses."
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="Resume Builder and Management"
              secondary="Tools to create, store, and generate professional resumes in PDF format."
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="Local Data Storage"
              secondary="Browser-based storage for your personal information and preferences."
            />
          </ListItem>
        </List>

        {/* User Accounts and Access */}
        <SectionHeader>
          <IconWrapper>
            <AccountBalance />
          </IconWrapper>
          <Typography variant="h5" color="primary">
            User Accounts and Access
          </Typography>
        </SectionHeader>

        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
          Google Account Integration
        </Typography>
        <Typography variant="body1" paragraph>
          To use this Service, you must have a valid Google account and grant permission for our 
          application to access your Gmail data. You are responsible for maintaining the security 
          of your Google account credentials.
        </Typography>

        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
          Authorized Use
        </Typography>
        <List>
          <ListItem>
            <ListItemText 
              primary="Personal Use Only"
              secondary="This application is intended for personal, non-commercial use only."
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="Educational Purpose"
              secondary="The Service is provided primarily for educational and demonstration purposes."
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="Age Requirement"
              secondary="You must be at least 13 years old to use this Service."
            />
          </ListItem>
        </List>

        {/* Prohibited Uses */}
        <SectionHeader>
          <IconWrapper>
            <Warning />
          </IconWrapper>
          <Typography variant="h5" color="primary">
            Prohibited Uses
          </Typography>
        </SectionHeader>

        <Typography variant="body1" paragraph>
          You may not use our Service:
        </Typography>

        <List>
          <ListItem>
            <ListItemText 
              primary="Illegal Activities"
              secondary="For any unlawful purpose or to violate any applicable laws or regulations."
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="Spam or Abuse"
              secondary="To send unsolicited emails, spam, or engage in any form of email abuse."
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="Malicious Content"
              secondary="To transmit viruses, malware, or any other malicious code."
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="Unauthorized Access"
              secondary="To attempt to gain unauthorized access to other systems or accounts."
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="Commercial Use"
              secondary="For commercial purposes without explicit written permission."
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="Reverse Engineering"
              secondary="To reverse engineer, decompile, or attempt to extract the source code."
            />
          </ListItem>
        </List>

        {/* Data and Privacy */}
        <SectionHeader>
          <IconWrapper>
            <ContactMail />
          </IconWrapper>
          <Typography variant="h5" color="primary">
            Data and Privacy
          </Typography>
        </SectionHeader>

        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
          Your Data
        </Typography>
        <Typography variant="body1" paragraph>
          You retain all rights to your data. We do not claim ownership of any content you create, 
          store, or transmit through the Service. Your resume data and preferences are stored 
          locally in your browser.
        </Typography>

        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
          Gmail Data Access
        </Typography>
        <Typography variant="body1" paragraph>
          We access your Gmail data solely to provide the email client functionality. We do not 
          store your emails on our servers. All email data flows directly between Google's servers 
          and your browser.
        </Typography>

        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
          AI Processing
        </Typography>
        <Typography variant="body1" paragraph>
          When you use AI features, your email content and instructions are sent to Google's 
          Gemini AI service. This processing is governed by Google's terms of service and privacy policy.
        </Typography>

        {/* Disclaimers and Limitations */}
        <SectionHeader>
          <IconWrapper>
            <Gavel />
          </IconWrapper>
          <Typography variant="h5" color="primary">
            Disclaimers and Limitations
          </Typography>
        </SectionHeader>

        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
          Educational Purpose
        </Typography>
        <Typography variant="body1" paragraph>
          This application is provided for educational and demonstration purposes. It is not 
          intended to replace production email clients or be used for critical business communications.
        </Typography>

        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
          Service Availability
        </Typography>
        <Typography variant="body1" paragraph>
          We do not guarantee that the Service will be available at all times. The Service may 
          be subject to maintenance, updates, or unexpected downtime.
        </Typography>

        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
          Limitation of Liability
        </Typography>
        <Typography variant="body1" paragraph>
          To the maximum extent permitted by law, we shall not be liable for any indirect, 
          incidental, special, consequential, or punitive damages, or any loss of profits or 
          revenues, whether incurred directly or indirectly.
        </Typography>

        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
          "As Is" Basis
        </Typography>
        <Typography variant="body1" paragraph>
          The Service is provided on an "as is" and "as available" basis without any warranties 
          of any kind, either express or implied.
        </Typography>

        {/* Third-Party Services */}
        <Typography variant="h5" gutterBottom color="primary" sx={{ mt: 4 }}>
          Third-Party Services
        </Typography>
        <Typography variant="body1" paragraph>
          Our Service integrates with third-party services including:
        </Typography>

        <List>
          <ListItem>
            <ListItemText 
              primary="Google Gmail API"
              secondary="For email access and management, governed by Google's Terms of Service."
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="Google Gemini AI"
              secondary="For AI-powered email assistance, governed by Google's AI Terms of Service."
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="Google OAuth 2.0"
              secondary="For authentication and authorization, governed by Google's OAuth policies."
            />
          </ListItem>
        </List>

        <Typography variant="body1" paragraph>
          Your use of these third-party services is subject to their respective terms of service 
          and privacy policies. We are not responsible for the practices of these third-party services.
        </Typography>

        {/* Termination */}
        <Typography variant="h5" gutterBottom color="primary" sx={{ mt: 4 }}>
          Termination
        </Typography>
        <Typography variant="body1" paragraph>
          You may terminate your use of the Service at any time by:
        </Typography>

        <List>
          <ListItem>
            <ListItemText secondary="• Revoking access permissions in your Google Account settings" />
          </ListItem>
          <ListItem>
            <ListItemText secondary="• Clearing your browser data to remove all locally stored information" />
          </ListItem>
          <ListItem>
            <ListItemText secondary="• Simply stopping use of the application" />
          </ListItem>
        </List>

        <Typography variant="body1" paragraph>
          We may terminate or suspend access to our Service immediately, without prior notice, 
          if you breach these Terms.
        </Typography>

        {/* Changes to Terms */}
        <Typography variant="h5" gutterBottom color="primary" sx={{ mt: 4 }}>
          Changes to Terms
        </Typography>
        <Typography variant="body1" paragraph>
          We reserve the right to modify these Terms at any time. We will notify users of any 
          material changes by updating the "Last Updated" date. Your continued use of the Service 
          after changes constitutes acceptance of the new Terms.
        </Typography>

        {/* Governing Law */}
        <Typography variant="h5" gutterBottom color="primary" sx={{ mt: 4 }}>
          Governing Law
        </Typography>
        <Typography variant="body1" paragraph>
          These Terms shall be governed by and construed in accordance with applicable laws, 
          without regard to conflict of law provisions.
        </Typography>

        {/* Contact Information */}
        <Typography variant="h5" gutterBottom color="primary" sx={{ mt: 4 }}>
          Contact Information
        </Typography>
        <Typography variant="body1" paragraph>
          If you have any questions about these Terms of Service, please contact us:
        </Typography>
        
        <Box sx={{ mt: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
          <Typography variant="body2">
            <strong>Email:</strong> dev.roushncse@gmail.com<br/>
            <strong>Project:</strong> Gmail Clone - Educational Application<br/>
            <strong>Purpose:</strong> Educational and Demonstration Only
          </Typography>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Typography variant="body2" color="textSecondary" align="center">
          By using this application, you acknowledge that you have read, understood, and agree 
          to be bound by these Terms of Service.
        </Typography>
      </PolicyPaper>
    </PolicyContainer>
  );
};

export default TermsOfService;
