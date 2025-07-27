import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Box, Typography, styled, Button, TextField, Collapse, IconButton, Chip, CircularProgress } from '@mui/material';
import { useLocation } from "react-router-dom";
import { ArrowBack, Delete, Reply, Send, Close, AutoAwesome, Refresh } from '@mui/icons-material';
import { emptyProfilePic } from '../assets/Asset.js';
import { trashEmail, sendEmail } from '../api/gmailApi.js';

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
  
  // Add refs for text fields
  const replyBodyRef = useRef(null);
  const subjectRef = useRef(null);
  const aiInstructionRef = useRef(null);

  const { state } = useLocation();
  const { email, autoReply = false } = state ||{};

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
      const prompt = `
        Original Email:
        From: ${email.from}
        Subject: ${email.subject}
        Body: ${email.body}

        User Instruction: ${aiInstruction}

        Please generate a professional email reply based on the original email and user instruction. Keep it concise and appropriate.
      `;

      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + import.meta.env.VITE_GEMINI_API_KEY, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
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
        // Focus the text area after AI generation
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