import { Navigate, } from 'react-router-dom';
import { useAuth } from '../AuthContext';

function RequireAuth({ children }: { children: React.ReactNode }){    
    const {
        auth,
        // logIn,
        // logout,
    } = useAuth();

    if (!auth.user) {
        return <Navigate to='/login' />
    }

    return (
        <>
            {children}
        </>
    );
}

export default RequireAuth;