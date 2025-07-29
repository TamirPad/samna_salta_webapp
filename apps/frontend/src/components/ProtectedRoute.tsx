import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAppSelector } from '../hooks/redux';
import {
  selectIsAuthenticated,
  selectIsAuthInitialized,
  selectUser,
} from '../features/auth/authSlice';
import LoadingSpinner from './LoadingSpinner';
import styled from 'styled-components';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  fallbackPath?: string;
  showLoading?: boolean;
}

const AuthContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 2rem;
  text-align: center;
`;

const AuthMessage = styled.p`
  color: #666;
  margin: 1rem 0;
  font-size: 1.1rem;
`;

const LoginButton = styled.button`
  background: #8B4513;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  margin-top: 1rem;
  transition: background-color 0.2s;

  &:hover {
    background: #A0522D;
  }
`;

const AccessDeniedContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 2rem;
  text-align: center;
`;

const AccessDeniedIcon = styled.div`
  font-size: 3rem;
  color: #e74c3c;
  margin-bottom: 1rem;
`;

const AccessDeniedTitle = styled.h2`
  color: #2c3e50;
  margin-bottom: 1rem;
`;

const AccessDeniedMessage = styled.p`
  color: #7f8c8d;
  margin-bottom: 1.5rem;
  max-width: 500px;
`;

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAdmin = false,
  fallbackPath = '/login',
  showLoading = true
}) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const location = useLocation();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isAuthInitialized = useAppSelector(selectIsAuthInitialized);
  const user = useAppSelector(selectUser);

  // Show loading while auth is being initialized
  if (!isAuthInitialized) {
    return showLoading ? (
      <LoadingSpinner 
        text="Checking authentication..." 
        size="medium" 
        fullScreen={false}
      />
    ) : null;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <AuthContainer>
        <AuthMessage>
          Please log in to access this page.
        </AuthMessage>
        <LoginButton onClick={() => window.location.href = fallbackPath}>
          Go to Login
        </LoginButton>
      </AuthContainer>
    );
  }

  // Show access denied if admin access required but user is not admin
  if (requireAdmin && !user?.isAdmin) {
    return (
      <AccessDeniedContainer>
        <AccessDeniedIcon>🚫</AccessDeniedIcon>
        <AccessDeniedTitle>Access Denied</AccessDeniedTitle>
        <AccessDeniedMessage>
          You don&apos;t have permission to access this page. 
          Please contact an administrator if you believe this is an error.
        </AccessDeniedMessage>
        <LoginButton onClick={() => window.location.href = '/home'}>
          Go to Home
        </LoginButton>
      </AccessDeniedContainer>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
