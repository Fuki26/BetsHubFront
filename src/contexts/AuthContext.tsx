import React from "react";

export type UserContext = {
  id: string;
  username: string;
  email: string;
  token: string;
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
  logIn: () => void;
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
      setAuth((prevState) => ({
          ...prevState,
          user: undefined,
      }));
    };

  const logIn = async () => {
    const user: UserContext = {
      id: 'User_Id',
      username: 'User_Username',
      email: 'User_email',
      token: 'User_token',
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
    throw new Error("useAuth must be used within a AuthContext");
  }
  return context;
};
