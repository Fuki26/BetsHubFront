import PropTypes from 'prop-types';
import { Box, ButtonBase } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import { Link } from 'react-router-dom';

export function SideNavItem(props: 
  { active: boolean; icon: any; path: any; title: any; disabled?: boolean }) 
{
  const { active, icon, path, title, disabled = false } = props;

  const linkProps = path
    ? {
        component: Link,
        to: path
      }
    : {};

  return (
    <li>
      <ButtonBase
        sx={{
          alignItems: 'center',
          borderRadius: 1,
          display: 'flex',
          justifyContent: 'flex-start',
          pl: '16px',
          pr: '16px',
          py: '6px',
          textAlign: 'left',
          width: '100%',
          ...(active && {
            backgroundColor: 'rgba(255, 255, 255, 0.04)'
          }),
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.04)'
          },
          ...(disabled && {
            pointerEvents: 'none',
            color: 'gray',
            backgroundColor: 'lightgray',
          }),
        }}
        {...linkProps}
        disabled={disabled}
      >
        {icon && (
          <Box
            component='span'
            sx={{
              alignItems: 'center',
              color: 'neutral.400',
              display: 'inline-flex',
              justifyContent: 'center',
              mr: 2,
              ...(active && {
                color: 'primary.main'
              }),
              ...(disabled && {
                color: 'gray',
              }),
            }}
          >
            {icon}
          </Box>
        )}
        {disabled && (
          <LockIcon
            sx={{
              ml: 1,
              color: 'gray',
            }}
          />
        )}
        <Box
          component='span'
          sx={{
            color: 'neutral.400',
            flexGrow: 1,
            fontFamily: (theme) => theme.typography.fontFamily,
            fontSize: 14,
            fontWeight: 600,
            lineHeight: '24px',
            whiteSpace: 'nowrap',
            ...(active && {
              color: 'common.white'
            }),
            ...(disabled && {
              color: 'gray',
            }),
          }}
        >
          {title}
        </Box>
      </ButtonBase>
    </li>
  );
};

SideNavItem.propTypes = {
  active: PropTypes.bool,
  disabled: PropTypes.bool,
  external: PropTypes.bool,
  icon: PropTypes.node,
  path: PropTypes.string,
  title: PropTypes.string.isRequired
};
