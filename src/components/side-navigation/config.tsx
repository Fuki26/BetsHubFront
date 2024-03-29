import { SvgIcon } from '@mui/material';
import { PeopleRounded, SearchRounded, 
  SupportAgentRounded, EuroRounded, VerifiedUserRounded, } from '@mui/icons-material';
import PendingIcon from '@mui/icons-material/Pending';
import DoneOutlineIcon from '@mui/icons-material/DoneOutline';
import PaymentIcon from '@mui/icons-material/Payment';

export const items = [
  {
    title: 'Pending Bets',
    path: '/pending_bets',
    icon: (
      <SvgIcon fontSize='small'>
        <PendingIcon />
      </SvgIcon>
    ),
    requireAuthentication: true,
  },
  {
    title: 'Completed Bets',
    path: '/completed_bets',
    icon: (
      <SvgIcon fontSize='small'>
        <DoneOutlineIcon />
      </SvgIcon>
    ),
    requireAuthentication: true,
  },
  {
    title: 'Expenses',
    path: '/expenses',
    icon: (
      <SvgIcon fontSize='small'>
        <PaymentIcon />
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
