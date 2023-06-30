import { Button, Typography } from "@mui/material";

const LogoutForm = ({ user, onLogout }) => {
  return (
    <>
      <Typography component="h1" variant="h5">
        Welcome, {user.username}
      </Typography>
      <Button 
        variant="contained" 
        color="primary" 
        onClick={onLogout}
        sx={{ marginTop: 2 }}
      >
        Log Out
      </Button>
    </>
  );
};

export default LogoutForm;
