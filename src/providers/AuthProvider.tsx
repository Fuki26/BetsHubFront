// import { createContext, useContext } from "react";
// import React from "react";

// export type UserContext = {
//     id: string;
//     email: string;
//     username: string;
//     token: string;
// } | undefined;

// const AuthContext = createContext<UserContext>(undefined);
// const useAuthContext = () => useContext(AuthContext);

// const AuthenticationProvider = (props: { children: any }) => {
//     const { children, } = props;
//     const [user, setUser] = React.useState<UserContext | undefined>();
    
//     const logIn = async (props: { username: string; password: string; }) => {
//         try {
//             const { username, password, } = props;
//             // let authresult = await axios.post('/api/auth/login', data);

//             if(username === 'Radoslav' && password === 'Radoslav123') {
//                 let user: UserContext = {
//                     id: '1',
//                     email: 'radoslav.emilov.todorov@gmail.com',
//                     username: 'Radoslav',
//                     token: 'some_token_value',
//                 };
//                 setUser(user);
//             } else {
//                 setUser(undefined);
//             } 
//         } catch (err) {
//             console.error(err);
//         }
//     };

//     const logOut = () => {
//         setUser(undefined);
//     };

//     const register = async (data: any) => {
//         try {
//             // let authresult = await axios.post('/api/auth/signUp', data);
//             let user: UserContext = {
//                 id: '1',
//                 email: 'radoslav.emilov.todorov@gmail.com',
//                 username: 'Radoslav',
//                 token: 'some_token_value',
//             };
//             setUser(user);
//         } catch (err) {
//             console.error(err);
//         }
//     };
//     return (
//         <AddressContext.Provider value={{ AddressList, addAddress, editAddress, deleteAddress }}>
//             {children}
//         </AddressContext.Provider>
//     )
// }

// export { useAuthContext, AuthProvider, }