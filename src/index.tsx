import React from 'react';
import ReactDOM from "react-dom";
import { Provider } from 'react-redux';
import { CssBaseline, ThemeProvider, } from '@mui/material';
import { store } from './app/store';
import App from './App';
import './index.css';
import { createTheme } from './theme';

const defaultMaterialTheme = createTheme();

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider theme={defaultMaterialTheme}>
        <CssBaseline />
        <App/>
      </ThemeProvider>
    </Provider>
  </React.StrictMode>,
  document.getElementById("root")
);
