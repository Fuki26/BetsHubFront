import * as React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Stack } from '@mui/material';
import { SideNavItem } from '../../components/side-navigation/side-nav-item';
import { items } from '../../components/side-navigation/config';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation } from 'react-router-dom';

const drawerWidth = 240;

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme, open }) => ({
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

export default function PersistentDrawerLeft(
  props: { openSidebarCb: React.Dispatch<React.SetStateAction<boolean | undefined>>}) {
  const {
    auth,
    // logIn,
    // logout,
  } = useAuth();
  const { openSidebarCb, } = props;
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);

  const handleDrawerOpen = () => {
    setOpen(true);
    openSidebarCb(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
    openSidebarCb(false);
  };

  const location = useLocation();
  React.useEffect(() => {}, 
    [location.pathname]);

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position='fixed' open={open}
        sx={{
          backgroundColor: 'neutral.800',
        }}
      >
        <Toolbar>
          <IconButton
            aria-label='open drawer'
            onClick={handleDrawerOpen}
            edge='start'
            sx={{ 
              mr: 2, 
              backgroundColor: 'neutral.800',
              color: 'common.white',
              ...(open && { display: 'none' }) 
            }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant='h6' noWrap component='div'>
            {window.location.pathname.substring(1)}
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            backgroundColor: 'neutral.800',
            color: 'common.white',
          },
        }}
        variant='persistent'
        anchor='left'
        open={open}
      >
        <DrawerHeader>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </DrawerHeader>
        <Box
            component='nav'
            sx={{
            flexGrow: 1,
            px: 2,
            py: 3
            }}
        >
            <Stack
                component='ul'
                spacing={0.5}
                sx={{
                    listStyle: 'none',
                    p: 0,
                    m: 0
                }}
            >
                {
                    items.map(
                        (item: { 
                              path: any;
                              icon: any; 
                              title: string; 
                              requireAuthentication: boolean;
                              adminOnly?: boolean;
                            }
                        // eslint-disable-next-line array-callback-return
                        ) => 
                        {

                          if( !item.requireAuthentication 
                                || (item.requireAuthentication && !item.adminOnly && auth.user)
                                || (item.requireAuthentication && item.adminOnly && auth.user 
                                    && Number(auth.user.role) === 1)) {
                            const isActive = window.location.pathname === item.path
                              ? true
                              : false;
                            return (
                              <SideNavItem
                                  active={isActive}
                                  icon={item.icon}
                                  key={item.title}
                                  path={item.path}
                                  title={item.title!}
                                  disabled={false}
                              />
                            );
                          }
                            
                        }
                    )
                }
            </Stack>
        </Box>
      </Drawer>
    </Box>
  );
}