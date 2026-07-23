import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: { main: '#1b2a4e' },
    secondary: { main: '#e5354a' },
    background: { default: '#f4f5f7' },
  },
  shape: { borderRadius: 8 },
  typography: {
    fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: { transition: 'box-shadow 120ms ease-in-out' },
      },
    },
  },
});

export default theme;
