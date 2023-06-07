// import { Button, Paper, TextField, Typography } from '@mui/material';
// import * as React from 'react';
// import { useAuth } from '../../hooks';

// export default function Login() {
//   const { user, logIn, logOut, register, } = useAuth();
//   const usernameRef = React.useRef('');
//   const passwordRef = React.useRef('');

//   React.useEffect(() => {
//     if(user) {
//       alert(`Success, user: ${JSON.stringify(user)}`);
//     }
//   }, [ user, ]);


//   return (
//     <Paper sx={{ padding: '5%', }}>
//       <Typography variant='h3'>Log in</Typography>
//       <TextField
//         required
//         id="username"
//         label="Username"
//         defaultValue="Radoslav"
//         inputRef={usernameRef} 
//       />
//       <TextField
//         id="password"
//         label="Password"
//         type="password"
//         inputRef={passwordRef} 
//       />
//       <Button variant="contained" onClick={() => {
//         const username = (usernameRef.current.valueOf() as any).value;
//         const password = (passwordRef.current.valueOf() as any).value;

//         logIn({ username, password, });
//       }}>
//         Log In
//       </Button>
//     </Paper>
//   );
// }