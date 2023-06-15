import * as React from 'react';
import { Autocomplete, CircularProgress, Paper, TextField, Typography, } from '@mui/material';
import { UserModel, } from '../../models';
import { getUsers, } from '../../api';
import { User } from '../../database-models';

export default function Users(props: {}) {
  const [ isLoading, setIsLoading, ] = React.useState<boolean>(false);

  const [ users, setUsers] = React.useState<Array<UserModel> | undefined>(undefined);
  const [ selectedUser, setSelectedUser ] = 
    React.useState<{ value: string; label: string; } | null>(null);

  React.useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const users: Array<User> | undefined 
          = await getUsers();
        let userModels: Array<UserModel> = users
          ? users.map((user: User) => {
              return {
                id: user.id,
                userName: user.userName,
                password: user.password,
                roleId: user.roleId,
                role: user.role,
                address: user.address,
                device: user.device,

                actionTypeApplied: undefined,
                isSavedInDatabase: true,
              };
            })
          : [];

        setUsers(userModels);

        setIsLoading(false);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  return (
    <Paper sx={{ padding: '5%', }}>
      <Typography variant='h3'>Users</Typography>
      {
        isLoading
          ? (
              <>
                <CircularProgress color="success" 
                  size={250}
                  disableShrink={true}
                  style={{
                    position: 'fixed', 
                    top: '40%', 
                    right: '50%', 
                    zIndex: 9999999999999,
                    transition: 'none',
                  }}

                />
              </>
              
            )
          : null
      }
      {
        users
          ? (
              <>
                <Autocomplete
                  disablePortal
                  options={
                    users
                      ? users.map((user) => {
                          return {
                                value: user.id,
                                label: user.userName,
                              };
                          })
                      : []
                  }       
                  sx={{ width: 300 }}
                  renderInput={(params: any) => <TextField {...params} label={'User'} />}
                  onChange={(event, value: any) => {
                    setSelectedUser(value);
                  }}
                  value={selectedUser}
                />
              </> 
            )
          : null
      }
      <Paper>Selected user: { selectedUser ? selectedUser.label : ''}</Paper>
    </Paper>
  );
}