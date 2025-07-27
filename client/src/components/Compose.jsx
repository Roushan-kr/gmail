/* eslint-disable no-unused-vars */
import React, { useState } from 'react'
import { Box, Dialog ,InputBase,Typography,styled,TextField,Button} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { sendEmail } from '../api/gmailApi.js';


const dialogStyle = {
    height: '90%',
    width: '80%',
    maxWidth: '100%',
    maxHeight: '100%',
    boxShadow: 'none',
    borderRadius: '10px 10px 0 0',
}

const Header=styled(Box)({
    display:"flex",
    justifyContent:"space-between",
    padding:"10px 15px",
    background: "#f2f6fc",
    '& > p':{
        fontSize:14,
        fontWeight:500
    }
    

})
const RecipientWrapper = styled(Box)`
    display: flex;
    flex-direction: column;
    padding: 0 15px;
    & > div {
        font-size: 14px;
        line-height:20px;
        text-decoration:none solid rgb(34,34,34)
        border-bottom: 1px solid #F5F5F5;
        margin-top: 10px;
    }
`;
    

const Footer = styled(Box)`
    display: flex;
    justify-content: space-between;
    padding: 36px 20px;
    align-items: center;
`;
const SendButton = styled(Button)`
    background: #0B57D0;
    color: #fff;
    font-weight: 500;
    text-transform: none;
    border-radius: 18px;
    width: 100px;
`
const Compose = ({openDialog,setOpenDialog}) => {
    const [data, setData] = useState({});
    const [sending, setSending] = useState(false);

    const onValueChange=(e)=>{
        setData({ ...data, [e.target.name]: e.target.value })
    }

    const closeComposeClick=()=>{
        setOpenDialog(false);
        setData({})
    }

    const sendMail = async (e) => {
        e.preventDefault();
        
        if (!data.to || !data.subject) {
            alert('Please fill in recipient and subject');
            return;
        }

        try {
            setSending(true);
            await sendEmail(data.to, data.subject, data.body || '');
            alert('Email sent successfully!');
            setOpenDialog(false);
            setData({});
        } catch (error) {
            console.error('Error sending email:', error);
            alert('Failed to send email. Please try again.');
        } finally {
            setSending(false);
        }
    }

   const deleteMail=()=>{
    setOpenDialog(false)
   }

  return (
   <Dialog
   open={openDialog}
   PaperProps={{ sx: dialogStyle }}
   >

  <Header>

    <Typography >New Message</Typography>
    <CloseIcon fontSize="small" onClick={closeComposeClick} />


  </Header>
     <RecipientWrapper style={{}}>
     <InputBase 
                    placeholder='Recipients' 
                    onChange={onValueChange} 
                    name="to" 
                    value={data.to || ''}
                />
                <InputBase 
                    placeholder='Subject' 
                    onChange={onValueChange} 
                    name="subject"
                    value={data.subject || ''}
                />
     </RecipientWrapper>

      <TextField 
                multiline
                rows={10}
                sx={{ '& .MuiOutlinedInput-notchedOutline': { border: 'none' } }}
                name="body"
                onChange={onValueChange}
                value={data.body || ''}
            />
        <Footer>
        <SendButton 
                    onClick={sendMail}
                    disabled={sending}
                >
                    {sending ? 'Sending...' : 'Send'}
                </SendButton>

        <DeleteOutlineOutlinedIcon onClick={deleteMail}/>
               
            </Footer>

   </Dialog>
  )
}

export default Compose