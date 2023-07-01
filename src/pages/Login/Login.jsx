import { useState } from "react";
import { Box, Typography, Avatar, Button } from "@mui/material";
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useAuth } from "../../contexts/AuthContext";
import { login, verifyTfa, getTfaSetup, resetPassword } from "../../api";
import LoginForm from './LoginForm';
import TfaForm from './TfaForm';
import LogoutForm from './LogoutForm';
import ResetPasswordForm from './ResetPasswordForm'; // import the reset password form

const LoginPage = () => {
  const [view, setView] = useState("Login");
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [tfaCode, setTfaCode] = useState("");
  const [error, setError] = useState(null);
  const { auth, logIn, logout } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await login(userName, password);

      if (res && res.data && res.data.isTfaRequired) {
        setView("Tfa");
        setError(null)
      } else if (res && res.data && res.data.token) {
        localStorage.setItem("token", res.data.token);
      } else {
        throw new Error("Invalid login credentials");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleTfaSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await verifyTfa(userName, tfaCode);
      if (res && res.data && res.data.token) {
        localStorage.setItem("token", res.data.token.token);
        logIn({ 
          id: res.data.userId, 
          username: userName,
          email: res.data.email,
          token: res.data.token
        });
        window.location.href = '/';
      } else {
        throw new Error("Invalid TFA code");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleResetPassword = async (email) => {
    try {
      await resetPassword(email);
      setView("Login");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        backgroundColor: 'background.default',
      }}
    >
      <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
        <LockOutlinedIcon />
      </Avatar>
      
      {auth.user ? (
        <LogoutForm user={auth.user} onLogout={logout} />
      ) : (
        <>
          <Typography component="h1" variant="h5">
            Sign in
          </Typography>
          {view === "Login" && (
            <>
              <LoginForm 
                userName={userName} 
                password={password} 
                setUserName={setUserName} 
                setPassword={setPassword} 
                onSubmit={handleSubmit} 
              />
              <Button 
                variant="text" 
                color="primary" 
                onClick={() => setView("ResetPassword")}
              >
                Forgot password?
              </Button>
            </>
          )}
          {view === "ResetPassword" && (
            <ResetPasswordForm onSubmit={handleResetPassword} />
          )}
          {view === "Tfa" && (
            <TfaForm 
              tfaCode={tfaCode} 
              setTfaCode={setTfaCode} 
              onSubmit={handleTfaSubmit} 
            />
          )}
        </>
      )}
      {error && (
        <Typography variant="body1" sx={{ color: "red" }}>
          {error}
        </Typography>
      )}
    </Box>
  );
}

export default LoginPage;