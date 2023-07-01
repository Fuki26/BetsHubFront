import { useState } from 'react';
import { Button, TextField, Box, Dialog, DialogContent, DialogTitle, IconButton, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import { AddCircle } from '@mui/icons-material';

const roles = [
  { value: 2, label: "User" },
  { value: 0, label: "GeneralAdministrator" },
  { value: 1, label: "RegularAdministrator" },
];

const Register = ({ submit }) => {
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState(roles[0].value);
  const [submitted, setSubmitted] = useState(false);

  const validateEmail = (email) => {
    const re =
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitted(true);
    if (password !== confirmPassword || !validateEmail(email)) {
      return;
    }
    const payload = {
      userName: username,
      email: email,
      password: password,
      role: role,
    };
    try {
      await submit(payload);
      setOpen(false);
      setSubmitted(false);
    } catch (error) {}
  };

  return (
    <Box>
      <IconButton onClick={() => setOpen(true)}>
        <AddCircle />
      </IconButton>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Register a new user</DialogTitle>
        <DialogContent>
          <FormControl component="form" onSubmit={handleSubmit} fullWidth>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                fullWidth
              />
              <TextField
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                fullWidth
                error={submitted && !validateEmail(email)}
                helperText={
                  submitted && !validateEmail(email) ? "Invalid email!" : ""
                }
              />
              <TextField
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                fullWidth
                error={submitted && password !== confirmPassword}
                helperText={
                  submitted && password !== confirmPassword
                    ? "Passwords do not match!"
                    : ""
                }
              />
              <TextField
                label="Confirm Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                fullWidth
                error={submitted && password !== confirmPassword}
                helperText={
                  submitted && password !== confirmPassword
                    ? "Passwords do not match!"
                    : ""
                }
              />
              <FormControl fullWidth>
                <InputLabel id="role-label">Role</InputLabel>
                <Select
                  labelId="role-label"
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  {roles.map((role) => (
                    <MenuItem key={role.value} value={role.value}>
                      {role.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Button type="submit" color="primary">
              Submit
            </Button>
          </FormControl>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Register;