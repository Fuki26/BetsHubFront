import { useState, useEffect } from "react";
import Register from "../../components/Register/Register";
import UserCard from "../../components/UserCard/UserCard";
import { notifySuccess, notifyError } from "../../services";
import { registerUser, getTfaSetup, deleteUser, promoteUserToGA, demoteUserToRA, } from "../../api";
import SupervisedUserCircleIcon from '@mui/icons-material/SupervisedUserCircle';
import {
  Autocomplete,
  Box,
  CircularProgress,
  Paper,
  TextField,
} from "@mui/material";
import { getUsers } from "../../api";

const Users = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState("");

  const createNewUser = async (user) => {
    try {
      await registerUser(user);
      fetchUsers();
      notifySuccess(`Successfully created new user with username ${user.userName}`);
    } catch (err) {
      notifyError(`Error while creating user: ${err}`);
      throw err;
    }
  };

  const fetchTfaSetup = async () => {
    try {
      const res = await getTfaSetup(selectedUser.userName);
      if (res && res.data && res.data.formattedKey) {
        setQrCodeUrl(
          `https://api.qrserver.com/v1/create-qr-code/?data=${res.data.formattedKey}`
        );
      }
    } catch (err) {}
  };

  const handleDeleteUser = async (userName) => {
    try {
      await deleteUser(userName);
      fetchUsers();
      setSelectedUser(null);
    } catch (err) {
      notifyError(`Error while deleting user: ${err}`);
    }
  };

  const promoteUser = async (userName) => {
    try {
      await promoteUserToGA(userName);
      fetchUsers();
      setSelectedUser(null);
    } catch (err) {
      notifyError(`Error while deleting user: ${err}`);
    }
  };

  const demoteUser = async (userName) => {
    try {
      await demoteUserToRA(userName);
      fetchUsers();
      setSelectedUser(null);
    } catch (err) {
      notifyError(`Error while deleting user: ${err}`);
    }
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const fetchedUsers = await getUsers();
      setUsers(fetchedUsers);
    } catch (e) {     
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedUser) {
      fetchTfaSetup();
    }
  }, [selectedUser]);

  useEffect(() => {
    fetchUsers();
  }, []);

  if (isLoading) {
    return (
      <div className="background-color-blur">
        <CircularProgress
          color="success"
          size={250}
          disableShrink={true}
          style={{
            position: 'fixed', 
            top: '0', 
            right: '0',
            bottom: '0',
            left: '0',
            margin: 'auto',
            zIndex: 9999999999999,
            transition: 'none',
          }}

        />
      </div>
    );
  }

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      minWidth: '50%',
      // maxWidth: '90%',
      // margin: 'auto'
    }}>
      <SupervisedUserCircleIcon style={{ fontSize: 100 }} />
      <Paper sx={{ padding: "5%", width: '100%' }}>
        <Box sx={{ marginBottom: "5%" }}>
          <Register submit={createNewUser} />
        </Box>
        <Autocomplete
          id="users-select"
          options={users}
          getOptionLabel={(option) => option.userName}
          onChange={(_, value) => setSelectedUser(value)}
          renderInput={(params) => <TextField {...params} label="Select a user" fullWidth />}
        />
        {selectedUser && <UserCard user={selectedUser} promoteUser={promoteUser} demoteUser={demoteUser} qrCodeUrl={qrCodeUrl} deleteUser={handleDeleteUser} />}
      </Paper>
    </Box>
  );
};

export default Users;
