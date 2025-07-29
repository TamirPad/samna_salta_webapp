import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import {
  loginStart,
  loginSuccess,
  loginFailure,
  selectAuth,
  selectIsAuthInitialized,
} from "../features/auth/authSlice";
import { selectLanguage } from "../features/language/languageSlice";
import LoadingSpinner from "../components/LoadingSpinner";
import AuthRedirect from "../components/AuthRedirect";
import { apiService } from "../utils/api";

const LoginPage: React.FC = (): JSX.Element => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAppSelector(selectAuth);
  const isAuthInitialized = useAppSelector(selectIsAuthInitialized);

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      dispatch(loginStart());

      // Real backend authentication
      const response = await apiService.login({ email, password });
      const { user, token } = response.data.data;

      // Store token and user data
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      dispatch(loginSuccess(user));

      // Redirect based on user type
      if (user.isAdmin) {
        navigate("/admin", { replace: true });
      } else {
        navigate("/home", { replace: true });
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response
              ?.data?.message || "Invalid email or password"
          : "Login failed. Please try again.";
      setError(errorMessage);
      dispatch(loginFailure(errorMessage));
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (): void => {
    setEmail("admin@sammasalta.com");
    setPassword("admin123");
  };

  // Don't redirect here - let the routing handle it
  // The LoginPage should only show the login form

  return (
    <AuthRedirect>
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #8B4513 0%, #D2691E 100%)",
          padding: "1rem",
        }}
      >
        <div
          style={{
            background: "white",
            padding: "2rem",
            borderRadius: "12px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
            width: "100%",
            maxWidth: "400px",
          }}
        >
          <h1
            style={{
              textAlign: "center",
              color: "#8B4513",
              marginBottom: "2rem",
              fontSize: "2rem",
              fontWeight: "bold",
            }}
          >
            Samna Salta
          </h1>
          <p
            style={{
              textAlign: "center",
              color: "#666",
              marginBottom: "2rem",
              fontSize: "1rem",
            }}
          >
            Welcome to Samna Salta - Traditional Yemenite Food
          </p>

          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <div>
              <label
                htmlFor="email"
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  color: "#333",
                }}
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                  fontSize: "1rem",
                }}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  color: "#333",
                }}
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                  fontSize: "1rem",
                }}
              />
            </div>

            {error && (
              <div
                style={{
                  padding: "0.75rem",
                  backgroundColor: "#fee",
                  color: "#c33",
                  borderRadius: "6px",
                  fontSize: "0.9rem",
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "0.75rem",
                backgroundColor: "#8B4513",
                color: "white",
                border: "none",
                borderRadius: "6px",
                fontSize: "1rem",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? <LoadingSpinner text="Logging in..." /> : "Login"}
            </button>

            <button
              type="button"
              onClick={handleDemoLogin}
              style={{
                padding: "0.5rem",
                backgroundColor: "transparent",
                color: "#8B4513",
                border: "1px solid #8B4513",
                borderRadius: "6px",
                fontSize: "0.9rem",
                cursor: "pointer",
                marginTop: "0.5rem",
              }}
            >
              Use Demo Credentials
            </button>
          </form>
        </div>
      </div>
    </AuthRedirect>
  );
};

export default LoginPage;
