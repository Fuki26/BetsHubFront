import { useCallback, useState, useEffect, } from 'react';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { styled, } from '@mui/material/styles';
import { SideNav } from './components/side-navigation/side-nav';
import { Hub } from './pages/hub/index';
import { FullFeaturedCrudGrid } from './pages/search/index';
import { CounterAgents } from './pages/counteragents/index';
import { Users } from './pages/users/index';
import { Currency } from './pages/currency/index';

const SIDE_NAV_WIDTH = 280;
const LayoutRoot = styled('div')(({ theme }) => ({
  display: 'flex',
  flex: '1 1 auto',
  maxWidth: '100%',
  [theme.breakpoints.up('lg')]: {
    paddingLeft: SIDE_NAV_WIDTH
  }
}));

const LayoutContainer = styled('div')({
  display: 'flex',
  flex: '1 1 auto',
  flexDirection: 'column',
  width: '100%'
});

const router = createBrowserRouter([
  {
    path: "/",
    element: <Hub />,
  },
  {
    path: "/hub",
    element: <Hub />,
  },
  {
    path: "/search",
    element: <FullFeaturedCrudGrid />,
  },
  {
    path: "/counteragents",
    element: <CounterAgents />,
  },
  {
    path: "/users",
    element: <Users />,
  },
  {
    path: "/currency",
    element: <Currency />,
  },
]);

function App() {
  const [openNav, setOpenNav] = useState(false);

  const handlePathnameChange = useCallback(
    () => {
      if (openNav) {
        setOpenNav(false);
      }
    },
    [openNav]
  );

  useEffect(
    () => {
      handlePathnameChange();
    },
    [window.location.pathname]
  );

  return (
    <>
      <SideNav
        onClose={() => setOpenNav(false)}
        open={openNav}
      />
      <LayoutRoot>
        <LayoutContainer>
        <div>
          <header>
            <RouterProvider router={router}/>
          </header>
        </div>
        </LayoutContainer>
      </LayoutRoot>
    </>
  );
}

export default App;
