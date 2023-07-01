import React, { useState } from "react";
import { Card, CardContent, Typography, Grid, Avatar, Link, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const UserCard = ({ user, qrCodeUrl, deleteUser }) => {
  const [openDeleteUser, setOpenDeleteUser] = useState(false);

  const handleOpenDeleteUser = () => {
    setOpenDeleteUser(true);
  };

  const handleCloseDeleteUser = () => {
    setOpenDeleteUser(false);
  };

  const handleDelete = async () => {
    await deleteUser(user.userName);
    handleCloseDeleteUser();
  };

  return (
    <Card style={{ margin: "20px" }}>
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={8}>
            <Grid container alignItems="center">
              <Avatar>
                <AccountCircleIcon fontSize="large" />
              </Avatar>
              <Typography variant="h5" style={{ marginLeft: "15px" }}>
                {user.userName}
              </Typography>
            </Grid>
            <Typography variant="subtitle1">
              Email: {user.email}
            </Typography>
            <Typography variant="subtitle1">
              Failed Access Attempts: {user.accessFailedCount}
            </Typography>
            <Typography variant="subtitle1">
              Role: {user.role.name}
            </Typography>
            <Link href="#" variant="body2" color="error" onClick={handleOpenDeleteUser}>
              Delete this user
            </Link>
            <Dialog
              open={openDeleteUser}
              onClose={handleCloseDeleteUser}
            >
              <DialogTitle>{"Delete User"}</DialogTitle>
              <DialogContent>
                <DialogContentText>
                  Are you sure you want to delete this user?
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseDeleteUser} color="primary">
                  No
                </Button>
                <Button onClick={handleDelete} color="primary" autoFocus>
                  Yes
                </Button>
              </DialogActions>
            </Dialog>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="subtitle1" style={{ marginTop: "10px" }}>
              QR for two-factor authentication setup
            </Typography>
            <img
                src={qrCodeUrl}
                alt="QR Code for TFA setup"
                style={{ width: "100px", height: "100px" }}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}

export default UserCard;
