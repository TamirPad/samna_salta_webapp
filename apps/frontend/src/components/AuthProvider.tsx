import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import {
  initializeAuth,
  selectIsAuthInitialized,
  selectAuthLoading,
} from "../features/auth/authSlice";
import LoadingSpinner from "./LoadingSpinner";

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const isInitialized = useAppSelector(selectIsAuthInitialized);
  const isLoading = useAppSelector(selectAuthLoading);

  useEffect(() => {
    // Initialize authentication on app startup
    if (!isInitialized && !isLoading) {
      dispatch(initializeAuth());
    }
  }, [dispatch, isInitialized, isLoading]);

  // Show loading spinner while initializing authentication
  if (!isInitialized || isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background: "linear-gradient(135deg, #8B4513 0%, #D2691E 100%)",
        }}
      >
        <LoadingSpinner />
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthProvider;
