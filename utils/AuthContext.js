import React, {createContext, useState, useContext, useEffect} from 'react';
import {jwtDecode} from 'jwt-decode';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({children}) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check for stored token on component mount
    const checkToken = async () => {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        login(token);
      }
    };
    checkToken();
  }, []);

  const login = async token => {
    try {
      const decodedToken = jwtDecode(token);
      const userData = {
        id: decodedToken.id,
        name: decodedToken.name,
        email: decodedToken.email,
      };
      setUser(userData);
      await AsyncStorage.setItem('userToken', token);
    } catch (error) {
      console.error('JWT Decoding Error:', error);
    }
  };

  const adminLogin = async () => {
    try {
      const userData = {
        id: 'cfkadmin_id',
        name: 'Admin',
        email: 'admin@cfkapp.com',
      };
      setUser(userData);
    } catch (error) {
      console.error('JWT Decoding Error:', error);
    }
  };

  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem('userToken');
  };

  return (
    <AuthContext.Provider value={{user, login, adminLogin, logout}}>
      {children}
    </AuthContext.Provider>
  );
};
