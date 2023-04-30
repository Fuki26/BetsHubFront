import React from 'react';
import ReactDOM from "react-dom";
import { Provider } from 'react-redux';
import { CssBaseline, ThemeProvider, createTheme, } from '@mui/material';
import { store } from './app/store';
import App from './App';
import './index.css';

const defaultMaterialTheme = createTheme({
  palette: {
      mode: "dark",
      common: {
        black: "#000",
        white: "#fff",
      },
      primary: {
        main: "#1976d2",
        light: "#42a5f5",
        dark: "#1565c0",
      },
      secondary: {
        main: "#9c27b0",
        light: "#ba68c8",
        dark: "#7b1fa2",
      },
      error: {
        main: "#d32f2f",
        light: "#ef5350",
        dark: "#c62828",
      },
      warning: {
        main: "#ed6c02",
        light: "#ff9800",
        dark: "#e65100",
      },
      info: {
        main: "#0288d1",
        light: "#03a9f4",
        dark: "#01579b",
      }, 
      success: {
        main: "#2e7d32",
        light: "#4caf50",
        dark: "#1b5e20",
      },
  },
});

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
