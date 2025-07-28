import { Navigate, useLocation } from "react-router-dom";
import { useAppSelector } from "../hooks/redux";
import {
  selectIsAuthenticated,
  selectIsAuthInitialized,
  selectUser,
} from "../features/auth/authSlice";
import LoadingSpinner from "./LoadingSpinner";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  fallbackPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAdmin = false,
  fallbackPath = "/login",
}) => {
  const location = useLocation();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isAuthInitialized = useAppSelector(selectIsAuthInitialized);
  const user = useAppSelector(selectUser);

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

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // Redirect to home if admin access required but user is not admin
  if (requireAdmin && !user?.isAdmin) {
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
