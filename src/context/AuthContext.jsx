import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';
import { ROLES } from '../utils/constants';

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
  const [error, setError] = useState(null);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      const { user, token } = await authService.login(email, password);
      setUser(user);
      return { user, token };
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const signup = async (userData) => {
    try {
      setError(null);
      const { user, token } = await authService.signup(userData);
      setUser(user);
      return { user, token };
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const isAdmin = () => {
    return user?.role === ROLES.ADMIN;
  };

  const value = {
    user,
    loading,
    error,
    login,
    signup,
    logout,
    isAdmin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};