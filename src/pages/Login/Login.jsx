import { useState } from "react";
import { Button, Typography, TextField, Box, Avatar } from "@mui/material";
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { login, verifyTfa, getTfaSetup } from "../../api";

const LoginPage = () => {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [tfaCode, setTfaCode] = useState("");
  const [isTfaRequired, setIsTfaRequired] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [error, setError] = useState(null);

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
      <Typography component="h1" variant="h5">
        Sign in
      </Typography>
      {!isTfaRequired ? (
        <Box
          component="form"
          onSubmit={handleSubmit}
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
      ) : (
        <Box
          component="form"
          onSubmit={handleTfaSubmit}
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center", // Centers items horizontally
            width: "300px",
            marginBottom: 2,
          }}
          noValidate
          autoComplete="off"
        >
          {qrCodeUrl && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                marginBottom: 4, // Adds some space below the QR code
              }}
            >
              <Typography variant="body1" sx={{ marginBottom: 2 }}>
                You didn't setup MFA? Use the following QR in desired
                authenticator
              </Typography>
              <img
                src={qrCodeUrl}
                alt="QR Code for TFA setup"
                style={{ width: "100px", height: "100px" }}
              />
            </Box>
          )}
          <TextField
            sx={{ marginBottom: 2 }}
            label="2FA Code"
            type="text"
            value={tfaCode}
            onChange={(e) => setTfaCode(e.target.value)}
            required
          />
          <Button variant="contained" color="primary" type="submit">
            Verify 2FA Code
          </Button>
        </Box>
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
