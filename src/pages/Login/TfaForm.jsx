// TfaForm.js
import { Button, TextField, Box } from "@mui/material";

const TfaForm = ({ tfaCode, setTfaCode, onSubmit }) => {
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
        marginTop: 2,
      }}
      noValidate
      autoComplete="off"
    >
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
