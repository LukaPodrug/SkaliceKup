import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Box, 
  Tabs, 
  Tab, 
  IconButton, 
  Drawer, 
  List, 
  ListItem, 
  ListItemText, 
  useTheme, 
  useMediaQuery,
  Divider
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import logoImg from '../assets/logo2.png';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  tab: number;
  handleTabChange: (event: React.SyntheticEvent, newValue: number) => void;
}

const Header: React.FC<HeaderProps> = ({ tab, handleTabChange }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const tabLabels = ['Početna', 'Novosti', 'Rezultati'];
  const tabRoutes = ['/', '/news', '/results'];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMobileTabClick = (index: number) => {
    navigate(tabRoutes[index]);
    setMobileOpen(false);
  };

  const drawer = (
    <Box sx={{ width: '100%', pt: 0 }}>
      <List>
        {tabLabels.map((label, index) => (
          <React.Fragment key={label}>
            <ListItem 
              onClick={() => handleMobileTabClick(index)}
              sx={{
                fontFamily: 'Ubuntu, sans-serif',
                fontWeight: tab === index ? 600 : 400,
                color: tab === index ? '#fd9905' : '#222',
                cursor: 'pointer',
                backgroundColor: tab === index ? '#ffe2b8' : 'transparent',
                py: 2,
                px: 3,
                textAlign: 'center',
                justifyContent: 'center',
                '&:hover': {
                  backgroundColor: '#ffe2b8',
                },
              }}
            >
              <ListItemText 
                primary={label} 
                sx={{ 
                  textAlign: 'center',
                  '& .MuiListItemText-primary': {
                    fontFamily: 'Ubuntu, sans-serif',
                    textAlign: 'center'
                  }
                }}
              />
            </ListItem>
            {index < tabLabels.length - 1 && (
              <Divider sx={{ bgcolor: '#e0e0e0', height: '1px' }} />
            )}
          </React.Fragment>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="static" sx={{ left: 0, top: 0, width: '100%', zIndex: 1201, bgcolor: '#fff', color: '#222', boxShadow: 2 }}>
        <Toolbar sx={{ justifyContent: 'space-between', py: isMobile ? 1 : 2 }}>
          <Box display="flex" alignItems="center">
            <Box
              sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              onClick={() => navigate('/')}
            >
              <img 
                src={logoImg} 
                alt="Logo" 
                style={{ 
                  height: isMobile ? 64 : 96, 
                  marginRight: isMobile ? 16 : 24, 
                  borderRadius: isMobile ? 12 : 16, 
                  objectFit: 'cover' 
                }} 
              />
            </Box>
          </Box>
          
          {isMobile ? (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="end"
              onClick={handleDrawerToggle}
              sx={{ 
                mr: 1,
                color: '#fd9905',
                '&:hover': {
                  backgroundColor: '#ffe2b8',
                },
                '&:active': {
                  backgroundColor: '#ffe2b8',
                }
              }}
            >
              {mobileOpen ? <CloseIcon /> : <MenuIcon />}
            </IconButton>
          ) : (
            <Tabs
              value={tab}
              onChange={handleTabChange}
              textColor="inherit"
              TabIndicatorProps={{
                sx: {
                  height: '48px',
                  borderRadius: '999px',
                  backgroundColor: '#fd9905',
                  zIndex: 0,
                  transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
                  display: 'flex',
                  alignItems: 'center',
                },
              }}
              sx={{
                fontFamily: 'Ubuntu, sans-serif',
                position: 'relative',
                minHeight: '48px',
                '.MuiTab-root': {
                  color: '#222',
                  fontWeight: 600,
                  fontSize: '1.1rem',
                  fontFamily: 'Ubuntu, sans-serif',
                  borderRadius: 999,
                  px: 3,
                  py: 0,
                  minHeight: '48px',
                  height: '48px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.2s, color 0.2s',
                  zIndex: 1,
                  mx: 1,
                  '&.Mui-selected': {
                    color: '#fff',
                    backgroundColor: 'transparent',
                  },
                  '&:hover': {
                    backgroundColor: '#ffe2b8',
                  },
                  '&.Mui-selected:hover': {
                    backgroundColor: 'transparent',
                  },
                  '&.Mui-focusVisible': {
                    outline: 'none',
                    boxShadow: 'none',
                  },
                },
              }}
            >
              <Tab label="Početna" />
              <Tab label="Novosti" />
              <Tab label="Rezultati" />
            </Tabs>
          )}
        </Toolbar>
      </AppBar>
      
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', sm: 'block', md: 'block', lg: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: '100vw',
            top: '74px', // Start below header (match header height)
            height: 'calc(100vh - 74px)', // Full height minus header
            left: 0,
            right: 0,
            zIndex: 1202,
            pt: 0
          },
        }}
        anchor="top"
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Header; 