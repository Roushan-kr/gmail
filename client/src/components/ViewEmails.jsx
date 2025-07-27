import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Box, Typography, styled, Button, TextField, Collapse, IconButton, Chip, CircularProgress } from '@mui/material';
import { useLocation } from "react-router-dom";
import { ArrowBack, Delete, Reply, Send, Close, AutoAwesome, Refresh, PersonAdd, PictureAsPdf } from '@mui/icons-material';
import { emptyProfilePic } from '../assets/Asset.js';
import { trashEmail, sendEmail } from '../api/gmailApi.js';
import { saveResumeData, getResumeData, getResumeHistory, exportResumeData } from '../utils/resumeStorage.js';
import { saveAIContext, buildContextualPrompt } from '../utils/aiContext.js';

// Move styled components outside the component to prevent re-creation
const IconWrapper = styled(Box)({
  padding: 15
});

const Subject = styled(Typography)({
  fontSize: 22,
  margin: '10px 0 20px 75px',
  display: 'flex'
});

const Indicator = styled(Box)`
  font-size: 12px !important;
  background: #ddd;
  color: #222;
  border-radius: 4px;
  margin-left: 6px;
  padding: 2px 4px;
  align-self: center;
`;

const Image = styled('img')({
  borderRadius: '50%',
  width: 40,
  height: 40,
  margin: '0 10px 0 10px',
  backgroundColor: '#cccccc'
});

const Container = styled(Box)({
  marginLeft: 15,
  width: '100%',
  '& > div': {
      display: 'flex',
      '& > p > span': {
          fontSize: 12,
          color: '#5E5E5E'
      }
  }
});

const DateStyled = styled(Typography)({
  margin: '0 50px 0 auto',
  fontSize: 12,
  color: '#5E5E5E'
});

const ReplySection = styled(Box)({
  marginTop: '20px',
  border: '1px solid #e0e0e0',
  borderRadius: '8px',
  overflow: 'hidden'
});

const ReplyHeader = styled(Box)({
  backgroundColor: '#f8f9fa',
  padding: '12px 16px',
  borderBottom: '1px solid #e0e0e0',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between'
});

const ReplyBody = styled(Box)({
  padding: '16px'
});

const AIAssistSection = styled(Box)({
  marginTop: '16px',
  padding: '16px',
  backgroundColor: '#f8f9ff',
  border: '1px solid #e3f2fd',
  borderRadius: '8px'
});

const SuggestionChip = styled(Chip)({
  margin: '4px',
  cursor: 'pointer'
});

const MainContainer = styled(Box)({
  width: '100%',
  minHeight: '100vh',
  backgroundColor: '#f5f5f5',
  transition: 'margin-left 0.3s ease',
  overflow: 'auto',
  padding: '20px',
});

const ContentWrapper = styled(Box)({
  maxWidth: '1200px',
  margin: '0 auto',
  backgroundColor: 'white',
  minHeight: 'calc(100vh - 64px)',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
});

const EmailContent = styled(Box)({
  padding: '20px',
  maxWidth: '100%',
  overflowX: 'auto'
});

const ResumeSection = styled(Box)({
  marginTop: '16px',
  padding: '16px',
  backgroundColor: '#f0f8f0',
  border: '1px solid #c8e6c9',
  borderRadius: '8px'
});

const ViewEmails = ({ openDrawer }) => {
  const [showReply, setShowReply] = useState(false);
  const [replyData, setReplyData] = useState({
    to: '',
    subject: '',
    body: ''
  });
  const [sending, setSending] = useState(false);
  const [showAIAssist, setShowAIAssist] = useState(false);
  const [aiInstruction, setAiInstruction] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [showResumeAssist, setShowResumeAssist] = useState(false);
  const [resumeData, setResumeData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    education: '',
    skills: '',
    experience: '',
    projects: '',
    certifications: ''
  });
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [generatingResume, setGeneratingResume] = useState(false);
  
  // Add refs for text fields
  const replyBodyRef = useRef(null);
  const subjectRef = useRef(null);
  const aiInstructionRef = useRef(null);

  const { state } = useLocation();
  const { email, autoReply = false } = state ||{};

  // Load resume data on component mount
  useEffect(() => {
    const savedResumeData = getResumeData();
    if (savedResumeData) {
      setResumeData(savedResumeData);
    }
  }, []);

  // Auto-save resume data when it changes
  useEffect(() => {
    if (autoSaveEnabled && resumeData.fullName) {
      const timeoutId = setTimeout(() => {
        saveResumeData(resumeData);
      }, 1000); // Debounce save for 1 second

      return () => clearTimeout(timeoutId);
    }
  }, [resumeData, autoSaveEnabled]);

  // Auto-open reply if coming from quick reply
  useEffect(() => {
    if (autoReply && !showReply) {
      initializeReply();
    }
  }, [autoReply]);

  const initializeReply = () => {
    const senderInfo = formatSenderInfo(email);
    setReplyData({
      to: senderInfo.email,
      subject: email.subject.startsWith('Re:') ? email.subject : `Re: ${email.subject}`,
      body: `\n\n--- Original Message ---\nFrom: ${senderInfo.name} <${senderInfo.email}>\nDate: ${formatDate(email.date)}\nSubject: ${email.subject}\n\n${email.body}`
    });
    setShowReply(true);
  };

  const handleReplyChange = (field) => (event) => {
    const value = event.target.value;
    setReplyData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Alternative direct handlers for better state management
  const handleBodyChange = useCallback((event) => {
    setReplyData(prev => ({
      ...prev,
      body: event.target.value
    }));
  }, []);

  const handleSubjectChange = useCallback((event) => {
    setReplyData(prev => ({
      ...prev,
      subject: event.target.value
    }));
  }, []);

  const handleToChange = useCallback((event) => {
    setReplyData(prev => ({
      ...prev,
      to: event.target.value
    }));
  }, []);

  const handleAiInstructionChange = useCallback((event) => {
    setAiInstruction(event.target.value);
  }, []);

  const handleResumeChange = useCallback((field) => (event) => {
    setResumeData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  }, []);

  const deleteEmails = async () => {
    try {
      await trashEmail(email._id || email.id);
      window.history.back();
    } catch (error) {
      console.error('Error deleting email:', error);
    }
  }
  
  const sendReply = async () => {
    try {
      setSending(true);
      await sendEmail(replyData.to, replyData.subject, replyData.body);
      setShowReply(false);
      setReplyData({ to: '', subject: '', body: '' });
      alert('Reply sent successfully!');
    } catch (error) {
      console.error('Error sending reply:', error);
      alert('Failed to send reply. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const cancelReply = () => {
    setShowReply(false);
    setReplyData({ to: '', subject: '', body: '' });
  };
  
  const formatEmailContent = (body) => {
    if (!body) return 'No content';
    
    // Convert line breaks to paragraphs for better display
    return body
      .split('\n\n')
      .map(paragraph => paragraph.trim())
      .filter(paragraph => paragraph.length > 0)
      .join('\n\n');
  };

  const formatSenderInfo = (email) => {
    if (!email.from) return { name: 'Unknown', email: '' };
    
    const match = email.from.match(/^(.*?)\s*<(.+)>$/) || email.from.match(/^(.+)$/);
    if (match) {
      if (match[2]) {
        return {
          name: match[1].trim().replace(/"/g, '') || match[2].split('@')[0],
          email: match[2].trim()
        };
      } else {
        return {
          name: match[1].split('@')[0],
          email: match[1].trim()
        };
      }
    }
    return { name: 'Unknown', email: email.from };
  };

  const formatDate = (date) => {
    const emailDate = new window.Date(date);
    return emailDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const senderInfo = formatSenderInfo(email);
  
  const generateAIReply = async () => {
    if (!aiInstruction.trim()) return;

    setAiGenerating(true);
    try {
      const currentResumeData = getResumeData();
      const contextualPrompt = buildContextualPrompt(email, aiInstruction, currentResumeData);

      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + import.meta.env.VITE_GEMINI_API_KEY, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: contextualPrompt
            }]
          }]
        })
      });

      const data = await response.json();
      
      if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
        const generatedReply = data.candidates[0].content.parts[0].text;
        setReplyData(prev => ({
          ...prev,
          body: generatedReply
        }));

        // Save AI interaction context
        saveAIContext({
          type: 'ai_assisted_reply',
          emailSubject: email.subject,
          emailFrom: email.from,
          userInstruction: aiInstruction,
          generatedReply: generatedReply.substring(0, 200) + '...',
          hasResumeContext: !!currentResumeData
        });

        setTimeout(() => {
          if (replyBodyRef.current) {
            replyBodyRef.current.focus();
          }
        }, 100);
      } else {
        throw new Error('Failed to generate reply');
      }
    } catch (error) {
      console.error('Error generating AI reply:', error);
      alert('Failed to generate AI reply. Please try again.');
    } finally {
      setAiGenerating(false);
    }
  };

  const getAISuggestions = () => {
    const suggestions = [
      'Write a professional thank you response',
      'Politely decline this request',
      'Ask for more details about the proposal',
      'Confirm receipt and next steps',
      'Schedule a meeting to discuss further',
      'Provide a brief status update',
      'Express interest and ask questions',
      'Apologize for the delay in response'
    ];
    setAiSuggestions(suggestions);
  };

  const applySuggestion = (suggestion) => {
    setAiInstruction(suggestion);
  };

  const toggleAIAssist = () => {
    if (!showAIAssist) {
      getAISuggestions();
    }
    setShowAIAssist(!showAIAssist);
  };

  const generateResumeBasedReply = async () => {
    if (!resumeData.fullName || !resumeData.email) {
      alert('Please fill in at least your name and email');
      return;
    }

    setAiGenerating(true);
    try {
      // Build contextual prompt using AI context and resume data
      const contextualPrompt = buildContextualPrompt(email, 'Generate a professional application reply', resumeData);

      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + import.meta.env.VITE_GEMINI_API_KEY, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: contextualPrompt
            }]
          }]
        })
      });

      const data = await response.json();
      
      if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
        const generatedReply = data.candidates[0].content.parts[0].text;
        setReplyData(prev => ({
          ...prev,
          body: generatedReply
        }));

        // Save AI interaction context
        saveAIContext({
          type: 'resume_based_reply',
          emailSubject: email.subject,
          emailFrom: email.from,
          userInstruction: 'Generate professional application reply',
          generatedReply: generatedReply.substring(0, 200) + '...', // Save summary
          resumeSnapshot: {
            name: resumeData.fullName,
            skills: resumeData.skills.substring(0, 100),
            experience: resumeData.experience.substring(0, 100)
          }
        });

        setTimeout(() => {
          if (replyBodyRef.current) {
            replyBodyRef.current.focus();
          }
        }, 100);
      } else {
        throw new Error('Failed to generate resume-based reply');
      }
    } catch (error) {
      console.error('Error generating resume-based reply:', error);
      alert('Failed to generate resume-based reply. Please try again.');
    } finally {
      setAiGenerating(false);
    }
  };

  const generateResumePDF = async () => {
    setGeneratingResume(true);
    try {
      // Import jsPDF dynamically
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      
      // Set fonts and colors
      doc.setFontSize(20);
      doc.setTextColor(40, 40, 40);
      doc.text(resumeData.fullName || 'Your Name', 20, 30);
      
      // Contact info
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`${resumeData.email} | ${resumeData.phone} | ${resumeData.address}`, 20, 40);
      
      let yPosition = 60;
      
      // Helper function to add sections
      const addSection = (title, content) => {
        if (content) {
          doc.setFontSize(14);
          doc.setTextColor(40, 40, 40);
          doc.text(title, 20, yPosition);
          yPosition += 10;
          
          doc.setFontSize(10);
          doc.setTextColor(60, 60, 60);
          const lines = doc.splitTextToSize(content, 170);
          doc.text(lines, 20, yPosition);
          yPosition += lines.length * 5 + 10;
        }
      };
      
      addSection('EDUCATION', resumeData.education);
      addSection('SKILLS', resumeData.skills);
      addSection('EXPERIENCE', resumeData.experience);
      addSection('PROJECTS', resumeData.projects);
      addSection('CERTIFICATIONS', resumeData.certifications);
      
      // Save the PDF
      doc.save(`${resumeData.fullName.replace(/\s+/g, '_')}_Resume.pdf`);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setGeneratingResume(false);
    }
  };

  const toggleResumeAssist = () => {
    setShowResumeAssist(!showResumeAssist);
  };

  const saveResumeManually = useCallback(() => {
    try {
      const saved = saveResumeData(resumeData);
      if (saved) {
        alert('Resume data saved successfully!');
      } else {
        alert('Failed to save resume data.');
      }
    } catch (error) {
      console.error('Error saving resume data manually:', error);
      alert('Failed to save resume data.');
    }
  }, [resumeData]);

  const handleExportData = useCallback(() => {
    try {
      exportResumeData();
    } catch (error) {
      console.error('Error exporting resume data:', error);
      alert('Failed to export resume data.');
    }
  }, []);

  return (
    <MainContainer style={openDrawer ? { marginLeft: 20, width: 'calc(100% - 20px)' } : { width: '100%' }}>
      <ContentWrapper>
        <IconWrapper>
          <ArrowBack fontSize='small' color="action" onClick={() => window.history.back() } />
          <Delete fontSize='small' color="action" style={{ marginLeft: 40 }} onClick={()=>deleteEmails()} />
        </IconWrapper>
        
        <Subject>
          {email && email.subject ? email.subject : 'No subject'}
          <Indicator component="span">Inbox</Indicator>
        </Subject>

        <EmailContent>
          <Box style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Email Header Info */}
            <Box style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <Image src={emptyProfilePic} alt="profile" />
              <Container>
                <Box>
                  <Typography>
                    <strong>{senderInfo.name}</strong>
                    <Box component="span" style={{ color: '#5f6368' }}>
                      &nbsp;&lt;{senderInfo.email}&gt;
                    </Box>
                  </Typography>
                  <DateStyled>
                    {formatDate(email.date)}
                  </DateStyled>
                </Box>
              </Container>
            </Box>

            {/* Email Body */}
            <Box style={{ 
              padding: '16px',
              backgroundColor: '#fafafa',
              borderRadius: '8px',
              border: '1px solid #e0e0e0'
            }}>
              <Typography 
                style={{ 
                  whiteSpace: 'pre-wrap',
                  lineHeight: 1.6,
                  fontSize: '14px',
                  fontFamily: 'inherit'
                }}
              >
                {formatEmailContent(email.body)}
              </Typography>
            </Box>

            {/* Reply Button */}
            <Box style={{ display: 'flex', gap: '8px', paddingTop: '16px' }}>
              <Button
                startIcon={<Reply />}
                variant="outlined"
                size="small"
                onClick={initializeReply}
                disabled={showReply}
              >
                Reply
              </Button>
            </Box>

            {/* Reply Section */}
            <Collapse in={showReply}>
              <ReplySection>
                <ReplyHeader>
                  <Typography variant="h6">Reply</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Button
                      size="small"
                      startIcon={<PersonAdd />}
                      onClick={toggleResumeAssist}
                      variant={showResumeAssist ? 'contained' : 'outlined'}
                      color="success"
                    >
                      Resume Assist
                    </Button>
                    <Button
                      size="small"
                      startIcon={<AutoAwesome />}
                      onClick={toggleAIAssist}
                      variant={showAIAssist ? 'contained' : 'outlined'}
                      color="primary"
                    >
                      AI Assist
                    </Button>
                    <IconButton size="small" onClick={cancelReply}>
                      <Close />
                    </IconButton>
                  </Box>
                </ReplyHeader>
                
                {/* Resume Assistant Section */}
                <Collapse in={showResumeAssist}>
                  <ResumeSection>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                      <Typography variant="subtitle2">
                        📄 Resume-Based Reply Generator
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
                          color={autoSaveEnabled ? 'success' : 'default'}
                          variant="outlined"
                        >
                          Auto-save: {autoSaveEnabled ? 'ON' : 'OFF'}
                        </Button>
                        <Button
                          size="small"
                          onClick={exportResumeData}
                          variant="outlined"
                        >
                          Export Data
                        </Button>
                        <Button
                          size="small"
                          onClick={saveResumeManually}
                          variant="outlined"
                        >
                          Save Now
                        </Button>
                      </Box>
                    </Box>
                    
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Your resume data is automatically saved locally and used for contextual AI responses.
                    </Typography>
                    
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, marginTop: 2 }}>
                      <TextField
                        size="small"
                        label="Full Name"
                        value={resumeData.fullName}
                        onChange={handleResumeChange('fullName')}
                        required
                      />
                      <TextField
                        size="small"
                        label="Email"
                        value={resumeData.email}
                        onChange={handleResumeChange('email')}
                        required
                      />
                      <TextField
                        size="small"
                        label="Phone"
                        value={resumeData.phone}
                        onChange={handleResumeChange('phone')}
                      />
                      <TextField
                        size="small"
                        label="Address"
                        value={resumeData.address}
                        onChange={handleResumeChange('address')}
                      />
                    </Box>
                    
                    <TextField
                      fullWidth
                      size="small"
                      label="Education"
                      placeholder="e.g., B.Tech Computer Science, XYZ University (2021-2025)"
                      value={resumeData.education}
                      onChange={handleResumeChange('education')}
                      multiline
                      rows={2}
                      sx={{ marginTop: 2 }}
                    />
                    
                    <TextField
                      fullWidth
                      size="small"
                      label="Skills"
                      placeholder="e.g., JavaScript, React, Node.js, Python, Machine Learning"
                      value={resumeData.skills}
                      onChange={handleResumeChange('skills')}
                      multiline
                      rows={2}
                      sx={{ marginTop: 2 }}
                    />
                    
                    <TextField
                      fullWidth
                      size="small"
                      label="Experience"
                      placeholder="e.g., Software Development Intern at ABC Company (Summer 2023)"
                      value={resumeData.experience}
                      onChange={handleResumeChange('experience')}
                      multiline
                      rows={2}
                      sx={{ marginTop: 2 }}
                    />
                    
                    <TextField
                      fullWidth
                      size="small"
                      label="Projects"
                      placeholder="e.g., E-commerce Web App using MERN Stack, AI Chatbot using Python"
                      value={resumeData.projects}
                      onChange={handleResumeChange('projects')}
                      multiline
                      rows={2}
                      sx={{ marginTop: 2 }}
                    />
                    
                    <TextField
                      fullWidth
                      size="small"
                      label="Certifications"
                      placeholder="e.g., AWS Cloud Practitioner, Google Analytics Certified"
                      value={resumeData.certifications}
                      onChange={handleResumeChange('certifications')}
                      multiline
                      rows={1}
                      sx={{ marginTop: 2 }}
                    />
                    
                    <Box sx={{ marginTop: 3, display: 'flex', justifyContent: 'space-between', gap: 1 }}>
                      <Button
                        size="small"
                        startIcon={<PictureAsPdf />}
                        onClick={generateResumePDF}
                        disabled={generatingResume || !resumeData.fullName}
                        variant="outlined"
                      >
                        {generatingResume ? 'Generating PDF...' : 'Download Resume PDF'}
                      </Button>
                      
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        startIcon={aiGenerating ? <CircularProgress size={16} /> : <AutoAwesome />}
                        onClick={generateResumeBasedReply}
                        disabled={aiGenerating || !resumeData.fullName || !resumeData.email}
                      >
                        {aiGenerating ? 'Generating...' : 'Generate Smart Reply'}
                      </Button>
                    </Box>
                  </ResumeSection>
                </Collapse>

                {/* AI Assistant Section */}
                <Collapse in={showAIAssist}>
                  <AIAssistSection>
                    <Typography variant="subtitle2" gutterBottom>
                      AI Reply Assistant
                    </Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Tell the AI how you want to respond, and it will craft a perfect reply for you.
                    </Typography>
                    
                    {/* Quick Suggestions */}
                    <Box sx={{ marginBottom: 2 }}>
                      <Typography variant="caption" color="textSecondary">
                        Quick suggestions:
                      </Typography>
                      <Box sx={{ marginTop: 1 }}>
                        {aiSuggestions.map((suggestion, index) => (
                          <SuggestionChip
                            key={index}
                            label={suggestion}
                            size="small"
                            variant="outlined"
                            onClick={() => applySuggestion(suggestion)}
                          />
                        ))}
                      </Box>
                    </Box>

                    {/* AI Instruction Input */}
                    <TextField
                      fullWidth
                      size="small"
                      label="How do you want to respond?"
                      placeholder="e.g., Write a professional thank you response"
                      value={aiInstruction}
                      onChange={handleAiInstructionChange}
                      margin="dense"
                      multiline
                      rows={2}
                      inputProps={{
                        autoComplete: 'off'
                      }}
                      InputProps={{
                        style: {
                          fontFamily: 'inherit',
                          fontSize: '14px'
                        }
                      }}
                    />
                    
                    <Box sx={{ marginTop: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                      <Button
                        size="small"
                        onClick={() => setAiInstruction('')}
                        disabled={aiGenerating}
                      >
                        Clear
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={aiGenerating ? <CircularProgress size={16} /> : <AutoAwesome />}
                        onClick={generateAIReply}
                        disabled={aiGenerating || !aiInstruction.trim()}
                      >
                        {aiGenerating ? 'Generating...' : 'Generate Reply'}
                      </Button>
                    </Box>
                  </AIAssistSection>
                </Collapse>

                <ReplyBody>
                  <TextField
                    fullWidth
                    size="small"
                    label="To"
                    value={replyData.to}
                    onChange={handleToChange}
                    margin="dense"
                    disabled
                    style={{ marginBottom: '8px' }}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="Subject"
                    value={replyData.subject}
                    onChange={handleSubjectChange}
                    margin="dense"
                    style={{ marginBottom: '8px' }}
                    inputRef={subjectRef}
                    inputProps={{
                      autoComplete: 'off'
                    }}
                  />
                  <TextField
                    fullWidth
                    multiline
                    rows={8}
                    label="Message"
                    value={replyData.body}
                    onChange={handleBodyChange}
                    margin="dense"
                    style={{ marginBottom: '16px' }}
                    helperText={showAIAssist ? "AI-generated content will appear here" : ""}
                    inputRef={replyBodyRef}
                    inputProps={{
                      autoComplete: 'off',
                      spellCheck: 'true'
                    }}
                    InputProps={{
                      style: {
                        fontFamily: 'inherit',
                        fontSize: '14px'
                      }
                    }}
                  />
                  <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      {replyData.body && showAIAssist && (
                        <Button
                          size="small"
                          startIcon={<Refresh />}
                          onClick={generateAIReply}
                          disabled={aiGenerating || !aiInstruction.trim()}
                        >
                          Regenerate
                        </Button>
                      )}
                    </Box>
                    <Box style={{ display: 'flex', gap: '8px' }}>
                      <Button
                        variant="outlined"
                        onClick={cancelReply}
                        disabled={sending}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="contained"
                        startIcon={<Send />}
                        onClick={sendReply}
                        disabled={sending || !replyData.body.trim()}
                      >
                        {sending ? 'Sending...' : 'Send Reply'}
                      </Button>
                    </Box>
                  </Box>
                </ReplyBody>
              </ReplySection>
            </Collapse>
          </Box>
        </EmailContent>
      </ContentWrapper>
    </MainContainer>
  )
}

export default ViewEmails