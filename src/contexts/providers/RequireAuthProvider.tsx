import { Navigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

function RequireAuth({ children, restrictedRole }: { children: React.ReactNode, restrictedRole?: number }) {
  const { auth } = useAuth();
  if (!auth.user || ( restrictedRole && Number(auth.user.role) !== restrictedRole)) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}


export default RequireAuth;