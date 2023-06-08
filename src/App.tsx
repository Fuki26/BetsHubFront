import { useCallback, useState, useEffect, } from 'react';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { styled, } from '@mui/material/styles';
import { ToastContainer, } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Hub } from './pages/hub/index';
import { Counteragents, } from './pages/counteragents/index';
import { Users } from './pages/users/index';
import { Currencies } from './pages/currency/index';
import PersistentDrawerLeft from './pages/ApplicationComponent/ApplicationComponent';
import Search from './pages/search/Search';
import Authentication from './pages/authentication/Authentication';
import RequireAuth from './contexts/providers/RequireAuthProvider';
import React from 'react';



const router = createBrowserRouter([
  {
    path: '/login',
    element: <Authentication />,
  },
  {
    path: '/',
    element: (
      <RequireAuth>
        <Hub />
      </RequireAuth>
    ),
  },
  {
    path: '/search',
    element: (
      <RequireAuth>
        <Search />
      </RequireAuth>
    ),
  },
  {
    path: '/counteragents',
    element: (
      <RequireAuth>
        <Counteragents />
      </RequireAuth>
    ),
  },
  {
    path: '/currency',
    element: (
      <RequireAuth>
        <Currencies />
      </RequireAuth>
    ),
  },
  {
    path: '/users',
    element: (
      <RequireAuth>
        <Users />
      </RequireAuth>
    ),
  },
]);

function App() {
  const [ isOpenSideBar, setIsOpenSideBar, ] = React.useState<boolean>();

  const SIDE_NAV_WIDTH = 280;
  let LayoutRoot = styled('div')(({ theme }) => ({
    display: 'flex',
    flex: '1 1 auto',
    maxWidth: '100%',
    [theme.breakpoints.up('lg')]: isOpenSideBar 
      ? {
          paddingLeft: SIDE_NAV_WIDTH
        }
      :
       null
  }));

  const LayoutContainer = styled('div')({
    display: 'flex',
    flex: '1 1 auto',
    flexDirection: 'column',
    width: '100%'
  });

  useEffect(
    () => {
      LayoutRoot = styled('div')(({ theme }) => ({
        display: 'flex',
        flex: '1 1 auto',
        maxWidth: '100%',
        [theme.breakpoints.up('lg')]: isOpenSideBar 
          ? {
              paddingLeft: SIDE_NAV_WIDTH
            }
          :
           null
      }));
    },
    [isOpenSideBar]
  );

  return (
    <>
      <PersistentDrawerLeft openSidebarCb={setIsOpenSideBar}/>
      <LayoutRoot>
        <LayoutContainer>
          <div>
            <header>
              <RouterProvider router={router}/>
            </header>
            <ToastContainer />
          </div>
        </LayoutContainer>
      </LayoutRoot>
    </>
  );
}

export default App;
