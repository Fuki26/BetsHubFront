import { SvgIcon } from '@mui/material';
import { CopyrightSharp, PeopleRounded, SearchRounded, SupportAgentRounded, EuroRounded, } from '@mui/icons-material';

export const items = [
  {
    title: 'Home',
    path: '/',
    icon: (
      <SvgIcon fontSize="small">
        <CopyrightSharp />
      </SvgIcon>
    )
  },
  {
    title: 'Hub',
    path: '/hub',
    icon: (
      <SvgIcon fontSize="small">
        <CopyrightSharp />
      </SvgIcon>
    )
  },
  {
    title: 'Search',
    path: '/search',
    icon: (
      <SvgIcon fontSize="small">
        <SearchRounded />
      </SvgIcon>
    )
  },
  {
    title: 'Counteragents',
    path: '/counteragents',
    icon: (
      <SvgIcon fontSize="small">
        <SupportAgentRounded />
      </SvgIcon>
    )
  },
  {
    title: 'Users',
    path: '/users',
    icon: (
      <SvgIcon fontSize="small">
        <PeopleRounded />
      </SvgIcon>
    )
  },
  {
    title: 'Currency',
    path: '/currency',
    icon: (
      <SvgIcon fontSize="small">
        <EuroRounded />
      </SvgIcon>
    )
  },
];
