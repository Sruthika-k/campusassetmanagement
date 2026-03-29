import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as authLogin, logout as authLogout, register as authRegister, getUser as getStoredUser } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = getStoredUser();
    if (storedUser) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    const data = await authLogin(credentials.email, credentials.password);
    const nextUser = data.user || data;
    setUser(nextUser);
    return nextUser;
  };

  const register = async (userData) => {
    const data = await authRegister(userData.name, userData.email, userData.password, userData.role);
    const nextUser = data.user || data;
    setUser(nextUser);
    return nextUser;
  };

  const logout = () => {
    authLogout();
    setUser(null);
  };

  const hasRole = (requiredRoles) => {
    if (!user) return false;
    return requiredRoles.includes(user.role);
  };

  const value = {
    user,
    login,
    register,
    logout,
    hasRole,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
