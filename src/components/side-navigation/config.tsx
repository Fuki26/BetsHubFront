import { SvgIcon } from '@mui/material';
import { CopyrightSharp, PeopleRounded, SearchRounded, 
  SupportAgentRounded, EuroRounded, VerifiedUserRounded, } from '@mui/icons-material';

export const items = [
  {
    title: 'Home',
    path: '/',
    icon: (
      <SvgIcon fontSize='small'>
        <CopyrightSharp />
      </SvgIcon>
    ),
    requireAuthentication: true,
  },
  {
    title: 'Search',
    path: '/search',
    icon: (
      <SvgIcon fontSize='small'>
        <SearchRounded />
      </SvgIcon>
    ),
    requireAuthentication: true,
  },
  {
    title: 'Counteragents',
    path: '/counteragents',
    icon: (
      <SvgIcon fontSize='small'>
        <SupportAgentRounded />
      </SvgIcon>
    ),
    requireAuthentication: true,
  },
  {
    title: 'Users',
    path: '/users',
    icon: (
      <SvgIcon fontSize='small'>
        <PeopleRounded />
      </SvgIcon>
    ),
    requireAuthentication: true,
    adminOnly: true,
  },
  {
    title: 'Currency',
    path: '/currency',
    icon: (
      <SvgIcon fontSize='small'>
        <EuroRounded />
      </SvgIcon>
    ),
    requireAuthentication: true,
  },
  {
    title: 'Authentication',
    path: '/login',
    icon: (
      <SvgIcon fontSize='small'>
        <VerifiedUserRounded />
      </SvgIcon>
    ),
    requireAuthentication: false,
  },
];
