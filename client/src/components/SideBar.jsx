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
          position: 'relative',
          width: openDrawer ? 250 : 0,
          height: 'calc(100vh - 64px)',
          borderRight: '1px solid #e0e0e0',
          transition: 'width 0.2s ease-in-out',
        },
      }}
    >
      <SideBarContent />
    </Drawer>
  );
};

export default SideBar;