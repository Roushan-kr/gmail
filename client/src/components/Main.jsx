import React, { useState } from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import Header from './Header';
import SideBar from './SideBar';
import Email from './Email';
import ViewEmails from './ViewEmails';
import PrivacyPolicy from './PrivacyPolicy';
import TermsOfService from './TermsOfService';

const Main = () => {
  const [openDrawer, setOpenDrawer] = useState(true);

  const toggleDrawer = () => {
    setOpenDrawer(!openDrawer);
  };

  return (
    <Box>
      <Header toggleDrawer={toggleDrawer} />
      <Box style={{ display: 'flex' }}>
        <SideBar openDrawer={openDrawer} />
        <Box style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Email openDrawer={openDrawer} />} />
            <Route path="/emails/:type" element={<Email openDrawer={openDrawer} />} />
            <Route path="/view" element={<ViewEmails openDrawer={openDrawer} />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
          </Routes>
        </Box>
      </Box>
    </Box>
  );
};

export default Main;
