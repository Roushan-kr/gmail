import React from 'react';
import { Drawer } from '@mui/material';
import SideBarContent from './SideBarContent';

const SideBar = ({ openDrawer }) => {
  return (
    <Drawer
      anchor="left"
      open={openDrawer}
      hideBackdrop={true}
      ModalProps={{
        keepMounted: true,
      }}
      variant="persistent"
      sx={{
        '& .MuiDrawer-paper': {
          position: 'fixed',
          top: '64px',
          width: openDrawer ? 250 : 0,
          height: 'calc(100vh - 64px)',
          borderRight: '1px solid #e8eaed',
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          overflow: 'hidden',
          zIndex: 1200,
          backgroundColor: '#ffffff',
          fontFamily: 'Google Sans, sans-serif',
          boxShadow: '1px 0 3px rgba(60, 64, 67, 0.08)',
        },
      }}
    >
      <SideBarContent />
    </Drawer>
  );
};

export default SideBar;