import PropTypes from 'prop-types';
import { Box, Drawer, Stack, useMediaQuery, } from '@mui/material';
import { items } from './config';
import { SideNavItem } from './side-nav-item';

export function SideNav(props: { open: any; onClose: any; }) {
  const { open, onClose } = props;
  const lgUp = useMediaQuery((theme: any) => theme.breakpoints.up('lg'));

  const content = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        // backgroundColor: '#333333'
      }}
    >
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
                }
              ) => 
              {
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
                  />
                );
              }
            )
          }
        </Stack>
      </Box>
    </Box>
  );

  if (lgUp) {
    return (
      <Drawer
        anchor='left'
        open
        PaperProps={{
          sx: {
            backgroundColor: 'neutral.800',
            color: 'common.white',
            width: 280
          }
        }}
        variant='permanent'
      >
        {content}
      </Drawer>
    );
  }

  return (
    <Drawer
      anchor='left'
      onClose={onClose}
      open={open}
      PaperProps={{
        sx: {
          backgroundColor: 'neutral.800',
          color: 'common.white',
          width: 280
        }
      }}
      sx={{ zIndex: (theme) => theme.zIndex.appBar + 100 }}
      variant='temporary'
    >
      {content}
    </Drawer>
  );
};

SideNav.propTypes = {
  onClose: PropTypes.func,
  open: PropTypes.bool
};
