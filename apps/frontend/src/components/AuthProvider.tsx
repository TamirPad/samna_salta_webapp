import React, { useEffect } from 'react';
import { useAppDispatch } from '../hooks/redux';
import { initializeAuth } from '../features/auth/authSlice';

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Initialize authentication on app startup
    // This will check localStorage and validate with backend
    dispatch(initializeAuth());
  }, [dispatch]);

  return <>{children}</>;
};

export default AuthProvider;
