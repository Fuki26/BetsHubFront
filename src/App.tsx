import { useState } from 'react';
import { BrowserRouter, Route, Routes, Navigate, } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Hub } from './pages/hub/index';
import { Counteragents } from './pages/counteragents/index';
import { Users } from './pages/users/index';
import { Currencies } from './pages/currency/index';
import PersistentDrawerLeft from './pages/ApplicationComponent/ApplicationComponent';
import Search from './pages/search/Search';
import Login from './pages/Login/Login';
import RequireAuth from './contexts/providers/RequireAuthProvider';
import './App.css'

const LayoutRoot = styled('div')<{ isOpenSideBar: boolean | undefined }>(
  ({ theme, isOpenSideBar }) => ({
    display: 'flex',
    flex: '1 1 auto',
    maxWidth: '100%',
    
    [theme.breakpoints.up('lg')]: isOpenSideBar ? { paddingLeft: 230 } : { paddingLeft: 65 },
  })
);

const LayoutContainer = styled('div')({
  display: 'flex',
  flex: '1 1 auto',
  flexDirection: 'column',
  width: '100%',
});

function App() {
  const [isOpenSideBar, setIsOpenSideBar] = useState<boolean>();

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route
            path='/pending_bets'
            element={
              <RequireAuth>
                <LayoutRoot isOpenSideBar={isOpenSideBar}>
                  <LayoutContainer>
                    <Hub id='pending_bets'/>
                  </LayoutContainer>
                </LayoutRoot>
              </RequireAuth>
            }
          />
          <Route
            path='/completed_bets'
            element={
              <RequireAuth>
                <LayoutRoot isOpenSideBar={isOpenSideBar}>
                  <LayoutContainer>
                    <Hub id='completed_bets'/>
                  </LayoutContainer>
                </LayoutRoot>
              </RequireAuth>
            }
          />
          <Route
            path='/expenses'
            element={
              <RequireAuth>
                <LayoutRoot isOpenSideBar={isOpenSideBar}>
                  <LayoutContainer>
                    <Hub id='expenses'/>
                  </LayoutContainer>
                </LayoutRoot>
              </RequireAuth>
            }
          />
          <Route
            path='/login'
            element={
              <LayoutRoot isOpenSideBar={isOpenSideBar}>
                <LayoutContainer>
                  <Login />{' '}
                </LayoutContainer>
              </LayoutRoot>
            }
          />
          <Route
            path='/search'
            element={
              <RequireAuth>
                <LayoutRoot isOpenSideBar={isOpenSideBar}>
                  <LayoutContainer>
                    <Search />
                  </LayoutContainer>
                </LayoutRoot>
              </RequireAuth>
            }
          />
          <Route
            path='/counteragents'
            element={
              <RequireAuth>
                <LayoutRoot isOpenSideBar={isOpenSideBar}>
                  <LayoutContainer>
                    <Counteragents />
                  </LayoutContainer>
                </LayoutRoot>
              </RequireAuth>
            }
          />
          <Route
            path='/currency'
            element={
              <RequireAuth>
                <LayoutRoot isOpenSideBar={isOpenSideBar}>
                  <LayoutContainer>
                    <Currencies />
                  </LayoutContainer>
                </LayoutRoot>
              </RequireAuth>
            }
          />
          <Route
            path='/users'
            element={
              <RequireAuth restrictedRole={1}>
                <LayoutRoot isOpenSideBar={isOpenSideBar}>
                  <LayoutContainer>
                    <Users />
                  </LayoutContainer>
                </LayoutRoot>
              </RequireAuth>
            }
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        <PersistentDrawerLeft openSidebarCb={setIsOpenSideBar} />
      </BrowserRouter>
      <ToastContainer />
    </>
  );
}

export default App;
