import React from 'react';

export type UserContext = {
  id: string;
  username: string;
  email: string;
  token: string;
  role: string;
};

type State = {
  user?: UserContext;
};

export const getUserFromLocalStorate = () => {
  const lSItem = localStorage.getItem('user');
  const user: UserContext | undefined
      = lSItem 
          ? JSON.parse(lSItem) 
          : undefined;
  return user;
}

type AuthState = {
  auth: State;
  logIn: (userName: string, token: string, role: string) => void;
  logout: () => void;
};

const AuthContext = React.createContext<AuthState | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [auth, setAuth] = React.useState<State>(() => {
      const user: UserContext | undefined = getUserFromLocalStorate();
      return {
        user,
      };
    });

    const logout = async () => {
      localStorage.setItem('user', '');
      localStorage.setItem('token', '');
      setAuth((prevState) => ({
          ...prevState,
          user: undefined,
      }));
    };

  const logIn = async (userName: string, token: string, role: string) => {
    const user: UserContext = {
      id: 'User_Id',
      username: userName,
      email: 'User_email',
      token: token,
      role,
    };
    
    localStorage.setItem('user', JSON.stringify(user));
    setAuth((prevState) => ({
      ...prevState,
      user,
    }));
  };

  return (
    <AuthContext.Provider
      value={{
        auth,
        logIn,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a AuthContext');
  }
  return context;
};
