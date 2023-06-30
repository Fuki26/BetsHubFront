import { useState } from "react";
import { Box, Typography, Avatar } from "@mui/material";
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useAuth } from "../../contexts/AuthContext";
import { login, verifyTfa, getTfaSetup } from "../../api";
import LoginForm from './LoginForm';
import TfaForm from './TfaForm';
import LogoutForm from './LogoutForm';

const LoginPage = () => {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [tfaCode, setTfaCode] = useState("");
  const [isTfaRequired, setIsTfaRequired] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [error, setError] = useState(null);
  const { auth, logIn, logout } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await login(userName, password);

      if (res && res.data && res.data.isTfaRequired) {
        setIsTfaRequired(true);
        fetchTfaSetup();
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
          id: res.data.userId, // assuming response has a userId field
          username: userName,
          email: res.data.email, // assuming response has an email field
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

  const fetchTfaSetup = async () => {
    try {
      const res = await getTfaSetup(userName);
      if (res && res.data && res.data.formattedKey) {
        setQrCodeUrl(
          `https://api.qrserver.com/v1/create-qr-code/?data=${res.data.formattedKey}`
        );
      }
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
          {!isTfaRequired ? (
            <LoginForm 
              userName={userName} 
              password={password} 
              setUserName={setUserName} 
              setPassword={setPassword} 
              onSubmit={handleSubmit} 
            />
          ) : (
            <TfaForm 
              tfaCode={tfaCode} 
              setTfaCode={setTfaCode} 
              qrCodeUrl={qrCodeUrl} 
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
