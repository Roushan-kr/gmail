/* eslint-disable no-unused-vars */
import { useParams } from "react-router-dom";
import { useEffect,useState } from "react";
import { Box, List, Checkbox } from '@mui/material';
import { DeleteOutline } from '@mui/icons-material';
import DisplayEmail from "./DisplayEmail";
import { EMPTY_TABS } from "../assets/Asset.js";
import NoMails from "./error/NoMails";
import { getEmails, trashEmail, deleteEmail } from '../api/gmailApi';

const Email = ({ openDrawer }) => {
    const [starredEmail, setStarredEmail] = useState(false);
    const [selectedEmails ,setSelectedEmails]=useState([]);
    const [emails, setEmails] = useState([]);
    const [loading, setLoading] = useState(true);

    const {type = 'inbox'}=useParams();

    useEffect(() => {
        fetchEmails();
    }, [type]);

    const fetchEmails = async () => {
        try {
            setLoading(true);
            let query = '';
            
            switch(type) {
                case 'inbox':
                    query = 'in:inbox -in:sent -in:drafts';
                    break;
                case 'sent':
                    query = 'in:sent';
                    break;
                case 'starred':
                    query = 'is:starred -in:trash';
                    break;
                case 'drafts':
                    query = 'in:drafts';
                    break;
                case 'bin':
                    query = 'in:trash';
                    break;
                case 'allmail':
                    query = '';
                    break;
                default:
                    query = 'in:inbox';
            }
            
            const fetchedEmails = await getEmails(query, 20);
            
            // Sort emails by date (newest first)
            const sortedEmails = fetchedEmails.sort((a, b) => 
                new Date(b.date) - new Date(a.date)
            );
            
            setEmails(sortedEmails);
        } catch (error) {
            console.error('Error fetching emails:', error);
            setEmails([]);
        } finally {
            setLoading(false);
        }
    };

    const selectAllEmails=(e)=>{
        if(e.target.checked){
            const emailIds = emails.map(email => email.id);
            setSelectedEmails(emailIds);
        }else{
            setSelectedEmails([])
        }
    }

    const deleteEmails = async () => {
        try {
            if (selectedEmails.length === 0) return;
            
            if(type === 'bin'){
                // Permanently delete emails
                await Promise.all(selectedEmails.map(id => deleteEmail(id)));
            } else {
                // Move to trash
                await Promise.all(selectedEmails.map(id => trashEmail(id)));
            }
            
            // Refresh emails after deletion
            await fetchEmails();
            setSelectedEmails([]);
        } catch (error) {
            console.error('Error deleting emails:', error);
        }
    }

    return(
        <Box >
           <Box style={{ padding: '20px 10px 0 10px', display: 'flex', alignItems: 'center' }}>
            <Checkbox size="small" onChange={(e)=>selectAllEmails(e)}/>
            <DeleteOutline
                onClick={deleteEmails}
                style={{ 
                    cursor: selectedEmails.length > 0 ? 'pointer' : 'default',
                    color: selectedEmails.length > 0 ? '#1976d2' : '#ccc'
                }}
            />
           </Box>
           
           {loading ? (
               <Box style={{ textAlign: 'center', padding: '50px' }}>
                   Loading emails...
               </Box>
           ) : (
               <>
                   <List>
                    {
                        emails.map(email=>(
                            <DisplayEmail
                                 email={email} 
                                key={email.id}
                                setStarredEmail={setStarredEmail} 
                                selectedEmails={selectedEmails}
                                setSelectedEmails={setSelectedEmails}
                                onEmailUpdate={fetchEmails}
                            />
                        ))
                    }
                   </List>
                   {
                    emails.length === 0 &&
                            <NoMails message={EMPTY_TABS[type] || EMPTY_TABS.inbox} />
                    }
               </>
           )}
        </Box>
    )
}

export default Email;