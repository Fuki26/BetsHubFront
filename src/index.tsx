import React from 'react';
import ReactDOM from 'react-dom';
import { CssBaseline, ThemeProvider, } from '@mui/material';
import { createTheme, } from './theme';
import App from './App';
import './index.css';
import { AuthProvider } from './contexts/AuthContext';

const defaultMaterialTheme = createTheme();

ReactDOM.render(
  <React.StrictMode>
    <ThemeProvider theme={defaultMaterialTheme}>
      <CssBaseline />
      <AuthProvider>
        <App/>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
