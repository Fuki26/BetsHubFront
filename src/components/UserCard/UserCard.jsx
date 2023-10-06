import { useState } from "react";
import './userCard.css'
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Link,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from "@mui/material";
import SessionTable from "../../components/SessionTable/SessionTable";

const UserCard = ({ user, qrCodeUrl, deleteUser, promoteUser }) => {
  const [openDeleteUser, setOpenDeleteUser] = useState(false);

  const handleOpenDeleteUser = () => {
    setOpenDeleteUser(true);
  };

  const handleCloseDeleteUser = () => {
    setOpenDeleteUser(false);
  };

  const handlePromoteUser = async () =>{
    await promoteUser(user.userName);
  }

  const handleDelete = async () => {
    await deleteUser(user.userName);
    handleCloseDeleteUser();
  };

  return (
    <Card variant="outlined" style={{ margin: "20px" }}>
      <CardContent>
        <Grid container>
          <Grid item xs={8}>
            <Grid container alignItems="center" spacing={2}>
              <Grid item>
                <Typography variant="subtitle1">
                  Role: {user?.role?.name}
                </Typography>
              </Grid>
              {
                user?.role?.name === "RA" 
                  && (
                        <Grid item>
                          <Button
                            variant="outlined"
                            color="primary"
                            onClick={handlePromoteUser}
                          >
                            Promote to GA
                          </Button>
                        </Grid>
                      )
                }
            </Grid>
            <Typography variant="subtitle1">Email: {user.email}</Typography>
            <Typography variant="subtitle1">
              Failed Access Attempts: {user.accessFailedCount}
            </Typography>
            <Typography variant="subtitle1">
              Role: {user?.role?.name}
            </Typography>
            <Link
              href="#"
              variant="body2"
              color="error"
              onClick={handleOpenDeleteUser}
            >
              Delete this user
            </Link>
            <Dialog open={openDeleteUser} onClose={handleCloseDeleteUser}>
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
              QR for two-factor setup
            </Typography>
            <img
              src={qrCodeUrl}
              alt="QR Code for TFA setup"
              style={{ width: "100px", height: "100px" }}
            />
          </Grid>
        </Grid>
        <SessionTable userName={user.userName} />
      </CardContent>
    </Card>
  );
};

export default UserCard;
