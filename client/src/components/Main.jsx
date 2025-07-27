import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import Header from './Header';
import SideBar from './SideBar';
import Email from './Email';
import ViewEmails from './ViewEmails';

const Main = () => {
  const [openDrawer, setOpenDrawer] = useState(true);

  const toggleDrawer = () => {
    setOpenDrawer(!openDrawer);
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      backgroundColor: '#f8f9fa',
      fontFamily: 'Google Sans, sans-serif'
    }}>
      <Header toggleDrawer={toggleDrawer} />
      <Box style={{ display: 'flex' }}>
        <SideBar openDrawer={openDrawer} />
        <Box 
          style={{ 
            flex: 1,
            transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
          className="fade-in"
        >
          <Routes>
            <Route path="/" element={<Email openDrawer={openDrawer} />} />
            <Route path="/emails/:type" element={<Email openDrawer={openDrawer} />} />
            <Route path="/view" element={<ViewEmails openDrawer={openDrawer} />} />
          </Routes>
        </Box>
      </Box>
    </Box>
  );
};

export default Main;
