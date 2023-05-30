import React from 'react';
import ReactDOM from 'react-dom';
import { CssBaseline, ThemeProvider, } from '@mui/material';
import { createTheme, } from './theme';
import App from './App';
import './index.css';

const defaultMaterialTheme = createTheme();

ReactDOM.render(
  <React.StrictMode>
    <ThemeProvider theme={defaultMaterialTheme}>
      <CssBaseline />
        <App/>
    </ThemeProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
