import React, { useState } from 'react';
import { Box, Button, TextField } from '@mui/material';

const ResetPasswordForm = ({ onSubmit }) => {
  const [email, setEmail] = useState('');

  const handleResetPassword = (e) => {
    e.preventDefault();
    onSubmit(email);
  };

  return (
    <Box component="form" noValidate onSubmit={handleResetPassword}>
      <TextField
        variant="outlined"
        margin="normal"
        required
        fullWidth
        id="email"
        label="Email Address"
        name="email"
        autoComplete="email"
        autoFocus
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Button
        type="submit"
        fullWidth
        variant="contained"
        color="primary"
      >
        Reset Password
      </Button>
    </Box>
  );
};

export default ResetPasswordForm;
