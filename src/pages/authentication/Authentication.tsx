
import { Paper, TextField, Typography, Button, Box, } from '@mui/material';
import { useAuth, } from '../../contexts/AuthContext';

export default function Authentication(props: {}) {
    const {
        auth,
        logIn,
        logout,
    } = useAuth();

    return (
        <Paper sx={{ padding: '5%', }}>
            <Typography variant='h3' style={{ marginBottom: '20px'}}>
                { auth.user ? 'Logout' : 'Login'}
            </Typography>
            {
                auth.user
                    ?   (
                            <>
                                <Button onClick={() => {
                                    logout();
                                }} variant='contained'>
                                    Logout
                                </Button>
                            </>
                        )
                    :   (   
                            <>
                                <Box style={{ marginBottom: '20px'}}>
                                    <TextField
                                        required
                                        id="username"
                                        label="Username"
                                        style={{ width: '25%'}}
                                    />
                                </Box>
                                <Box style={{ marginBottom: '20px'}}>
                                    <TextField
                                        required
                                        id="password"
                                        label="Password"
                                        type="password"
                                        style={{ width: '25%'}}
                                    />
                                </Box>
                                
                                <Button onClick={() => {
                                    logIn();
                                }} variant='contained'>
                                    Login
                                </Button>
                            </>
                        )
            }
        </Paper>
    );
}