import React, { useState } from 'react'
import { ListItem, Checkbox, Typography, Box, styled, IconButton } from "@mui/material"
import { StarBorder, Star, Reply, AttachFile } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import {routes} from '../routes/route.js'
import { starEmail } from '../api/gmailApi';

const DisplayEmail = ({ email, selectedEmails, setSelectedEmails, onEmailUpdate }) => {
    const [showQuickReply, setShowQuickReply] = useState(false);
    const toggleStarred = async () => {
        try {
            await starEmail(email.id, !email.starred);
            // Update local state
            email.starred = !email.starred;
            // Refresh emails if callback provided
            if (onEmailUpdate) {
                onEmailUpdate();
            }
        } catch (error) {
            console.error('Error toggling star:', error);
        }
    };

    const onSelectChange=()=>{
        if(selectedEmails.includes(email.id)){
            setSelectedEmails(prevState => prevState.filter(id => id !== email.id));
        }else{
            setSelectedEmails(prevState => [...prevState, email.id]);
        }
    }

    const reduceEmailBody = (body, maxLength = 50) => {
        if (!body || body.length <= maxLength) {
          return body || '';
        }
        return body.slice(0, maxLength) + "...";
    };

    const formatSender = (name, from) => {
        if (!name || name === 'Unknown') {
            // Extract name from email
            const emailMatch = from?.match(/(.+)@/);
            return emailMatch ? emailMatch[1] : 'Unknown';
        }
        return name.length > 20 ? name.substring(0, 20) + '...' : name;
    };

    const formatDate = (date) => {
        const now = new window.Date();
        const emailDate = new window.Date(date);
        const diffTime = Math.abs(now - emailDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 1) {
            return emailDate.toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit',
                hour12: true 
            });
        } else if (diffDays <= 7) {
            return emailDate.toLocaleDateString('en-US', { weekday: 'short' });
        } else {
            return emailDate.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
            });
        }
    };
    
    const truncatedBody = reduceEmailBody(email.body, 30);
    const formattedSender = formatSender(email.name, email.from);
    const formattedDate = formatDate(email.date);

    const Wrapper=styled(Box)({
        padding:'0 0 0 10px',
        background: '#f2f6fc',
        display:'flex',
        alignItems:'center',
        cursor: 'pointer',
        '&>div':{
            display: 'flex',
             width: '100%',

        },
        '& > div > p':{
            fontSize: '14px',

        }
    })
    const Indicator=styled(Typography)({
        fontSize: '12px !important',
        background: '#ddd',
        color: '#222',
        borderRadius: '4px',
        marginRight: '6px',
        padding: '0 4px',

    }
    )
    const DateStyled = styled(Typography)({
        marginLeft: 'auto',
        marginRight: 20,
        fontSize: 12,
        color: '#5F6368'
    })
    const navigate=useNavigate()

    const handleQuickReply = (e) => {
        e.stopPropagation(); // Prevent navigation to view email
        // Navigate to view email with reply mode
        navigate(routes.view.path, { 
            state: { 
                email: email,
                autoReply: true 
            }
        });
    };

    const QuickActions = styled(Box)({
        display: 'none',
        gap: '4px',
        '.email-item:hover &': {
            display: 'flex'
        }
    });

    const hasAttachments = email.payload?.parts?.some(part => 
        part.filename && part.filename.length > 0
    ) || false;
        
    
  return (
 <Wrapper className="email-item">
      <Checkbox size="small"
        checked={selectedEmails.includes(email.id)}
        onChange={onSelectChange}
      />
     {email.starred ? (
        <Star fontSize="small" style={{ marginRight: 10,color:'#FFF200' }} onClick={toggleStarred} />
      ) : (
        <StarBorder fontSize="small" style={{ marginRight: 10 }} onClick={toggleStarred} />
      )}

      <Box onClick={() => navigate(routes.view.path, { state: { email: email }})}>
      <Typography style={{ 
                    width: 200, 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    fontWeight: email.read ? 'normal' : '600'
                }}>
                    {formattedSender}
                </Typography>
                <Indicator>Inbox</Indicator>
                <Typography style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    flex: 1
                }}>
                    <span style={{ fontWeight: email.read ? 'normal' : '600' }}>
                        {email.subject}
                    </span>
                    {email.body && ' - '}
                    <span style={{ color: '#5f6368' }}>
                        {truncatedBody}
                    </span>
                </Typography>
                <Box sx={{ fontSize: 12, color: '#5f6368', display: 'flex', alignItems: 'center', gap: 1 }}>
                    {formattedDate}
                    {hasAttachments && <AttachFile fontSize="small" />}
                </Box>
      </Box>

      <QuickActions>
                <IconButton 
                    size="small" 
                    onClick={handleQuickReply}
                    title="Reply"
                    style={{ padding: '4px' }}
                >
                    <Reply fontSize="small" />
                </IconButton>
            </QuickActions>
 </Wrapper>
  )
}

export default DisplayEmail