import * as React from 'react';
import { useLocation } from 'react-router-dom';
import { ButtonBase, CSSObject, Theme, } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MuiDrawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import IconButton from '@mui/material/IconButton';
import CssBaseline from '@mui/material/CssBaseline';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useAuth } from '../../contexts/AuthContext';
import { items } from '../../components/side-navigation/config';
import { SvgIcon } from '@mui/material';
import { CopyrightSharp, PeopleRounded, SearchRounded, 
  SupportAgentRounded, EuroRounded, VerifiedUserRounded, } from '@mui/icons-material';
  import { Link } from 'react-router-dom';

const drawerWidth = 240;

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    ...(open && {
      ...openedMixin(theme),
      '& .MuiDrawer-paper': openedMixin(theme),
    }),
    ...(!open && {
      ...closedMixin(theme),
      '& .MuiDrawer-paper': closedMixin(theme),
    }),
  }),
);

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

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
      <CssBaseline />
      <Drawer variant="permanent" open={open}>
        <DrawerHeader>
          {
            open 
              ? (
                  <IconButton onClick={handleDrawerClose}>
                    <ChevronLeftIcon />
                  </IconButton>
                )
              : (
                <IconButton onClick={handleDrawerOpen}>
                  <ChevronRightIcon />
                </IconButton>
              )
          }
          
        </DrawerHeader>
        <List>
          {
            items.map(
              (item) => {
                const { icon, path, } = item;
                const linkProps = path
                  ? {
                      component: Link,
                      to: path
                    }
                  : {};
                if(!item.requireAuthentication 
                  || (item.requireAuthentication && !item.adminOnly && auth.user)
                  || (item.requireAuthentication && item.adminOnly && auth.user 
                  && Number(auth.user.role) === 1)) {
                  return (
                    <ListItem key={item.title} disablePadding sx={{ display: 'block' }} {...linkProps}>
                      <ListItemButton
                          sx={{
                            minHeight: 48,
                            justifyContent: open ? 'initial' : 'center',
                            px: 2.5,
                          }}
                        >
                        <ListItemIcon
                          sx={{
                            minWidth: 0,
                            mr: open ? 3 : 'auto',
                            justifyContent: 'center',
                          }}
                        >
                          
                          {icon}
                          
                        </ListItemIcon>
                        <ListItemText primary={item.title} sx={{ opacity: open ? 1 : 0 }} />
                      </ListItemButton>
                    </ListItem>
                  );
                }
              }
            )	
          }
        </List>
      </Drawer>
    </Box>
  );
}