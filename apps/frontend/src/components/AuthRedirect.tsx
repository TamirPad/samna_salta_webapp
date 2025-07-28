import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../hooks/redux";
import {
  selectAuth,
  selectIsAuthInitialized,
} from "../features/auth/authSlice";
import LoadingSpinner from "./LoadingSpinner";

interface AuthRedirectProps {
  children: React.ReactNode;
}

const AuthRedirect: React.FC<AuthRedirectProps> = ({ children }) => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAppSelector(selectAuth);
  const isAuthInitialized = useAppSelector(selectIsAuthInitialized);

  useEffect(() => {
    if (isAuthInitialized && isAuthenticated) {
      // Redirect authenticated users away from login page
      if (user?.isAdmin) {
        navigate("/admin", { replace: true });
      } else {
        navigate("/home", { replace: true });
      }
    }
  }, [isAuthenticated, user?.isAdmin, isAuthInitialized, navigate]);

  // Show loading while auth is being initialized
  if (!isAuthInitialized) {
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

  // If authenticated, show loading while redirecting
  if (isAuthenticated) {
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

  // If not authenticated, show the children (login form)
  return <>{children}</>;
};

export default AuthRedirect;
