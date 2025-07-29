import React from 'react';
import { useAppSelector } from '../hooks/redux';
import { selectIsAuthenticated } from '../features/auth/authSlice';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

interface AuthRedirectProps {
  children: React.ReactNode;
  redirectTo?: string;
  requireAuth?: boolean;
}

const AuthRedirect: React.FC<AuthRedirectProps> = ({
  children,
  redirectTo = '/home',
  requireAuth = false
}) => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // If user is on login page and already authenticated, redirect to home
    if (isAuthenticated && (location.pathname === '/' || location.pathname === '/login')) {
      navigate(redirectTo, { replace: true });
    }
    
    // If user is not authenticated and auth is required, redirect to login
    if (!isAuthenticated && requireAuth && location.pathname !== '/login') {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, location.pathname, navigate, redirectTo, requireAuth]);

  return <>{children}</>;
};

export default AuthRedirect;
