// LoginForm.js
import { Button, TextField, Box } from "@mui/material";

const LoginForm = ({ userName, password, setUserName, setPassword, onSubmit }) => {
  setTimeout(() => {
    const loginInput = document.getElementById('loginFormInputId');
    if(loginInput) {
      loginInput.focus();
    }
  }, (500));
  return (
    <Box
      component="form"
      onSubmit={onSubmit}
      sx={{
        display: "flex",
        flexDirection: "column",
        width: "300px",
        marginBottom: 2,
        marginTop: 1,
      }}
      noValidate
      autoComplete="off"
    >
      <TextField
        id={'loginFormInputId'}
        sx={{ marginBottom: 2 }}
        label="Username"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
        required
      />
      <TextField
        sx={{ marginBottom: 2 }}
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <Button variant="contained" color="primary" type="submit">
        Log In
      </Button>
    </Box>
  );
};

export default LoginForm;
