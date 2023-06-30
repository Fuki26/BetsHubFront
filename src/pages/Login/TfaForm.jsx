// TfaForm.js
import { Button, TextField, Box, Typography } from "@mui/material";

const TfaForm = ({ tfaCode, setTfaCode, qrCodeUrl, onSubmit }) => {
  return (
    <Box
      component="form"
      onSubmit={onSubmit}
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
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
            marginBottom: 4,
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
  );
};

export default TfaForm;
