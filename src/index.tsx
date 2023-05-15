import React from 'react';
import ReactDOM from "react-dom";
import { CssBaseline, ThemeProvider, } from '@mui/material';
import App from './App';
import './index.css';
import { createTheme } from './theme';

const defaultMaterialTheme = createTheme();

ReactDOM.render(
  <React.StrictMode>
    <ThemeProvider theme={defaultMaterialTheme}>
      <CssBaseline />
      <App/>
    </ThemeProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
