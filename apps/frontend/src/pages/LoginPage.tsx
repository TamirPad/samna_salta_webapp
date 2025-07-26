import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch } from '../hooks/redux';
import { loginStart, loginSuccess, loginFailure } from '../features/auth/authSlice';
import { apiService } from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';

const LoginPage: React.FC = (): JSX.Element => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the intended destination from location state, or default to admin dashboard
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/admin';

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      dispatch(loginStart());
      
      // Real backend authentication
      const response = await apiService.login({ email, password });
      const { user, token } = response.data.data;
      
      // Store token and user data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      dispatch(loginSuccess(user));
      
      // Redirect to admin dashboard
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error && 'response' in err 
        ? (err as any).response?.data?.message || 'Invalid email or password'
        : 'Login failed. Please try again.';
      setError(errorMessage);
      dispatch(loginFailure(errorMessage));
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (): void => {
    setEmail('admin@example.com');
    setPassword('admin123');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #8B4513 0%, #D2691E 100%)',
      padding: '1rem'
    }}>
      <div style={{
        background: 'white',
        padding: '2rem',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h1 style={{
          textAlign: 'center',
          color: '#8B4513',
          marginBottom: '2rem',
          fontSize: '2rem',
          fontWeight: 'bold'
        }}>
          Samna Salta Admin
        </h1>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem', color: '#333', fontWeight: '500' }}>
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>): void => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '1rem',
                boxSizing: 'border-box'
              }}
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label htmlFor="password" style={{ display: 'block', marginBottom: '0.5rem', color: '#333', fontWeight: '500' }}>
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>): void => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '1rem',
                boxSizing: 'border-box'
              }}
              placeholder="Enter your password"
            />
          </div>

          {error && (
            <div style={{
              color: '#c33',
              backgroundColor: '#fee',
              padding: '0.75rem',
              borderRadius: '6px',
              fontSize: '0.875rem'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              background: '#8B4513',
              color: 'white',
              border: 'none',
              padding: '0.75rem',
              borderRadius: '6px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'all 0.3s ease'
            }}
          >
            {loading ? <LoadingSpinner size="small" /> : 'Login'}
          </button>

          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={loading}
            style={{
              background: '#28a745',
              color: 'white',
              border: 'none',
              padding: '0.75rem',
              borderRadius: '6px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'all 0.3s ease',
              marginTop: '0.5rem'
            }}
          >
            Use Demo Credentials
          </button>
        </form>

        <div style={{
          marginTop: '1.5rem',
          textAlign: 'center',
          fontSize: '0.875rem',
          color: '#666'
        }}>
          <p><strong>Test Credentials:</strong></p>
          <p><strong>Email:</strong> admin@example.com</p>
          <p><strong>Password:</strong> admin123</p>
          <p style={{ marginTop: '1rem', fontSize: '0.75rem', color: '#999' }}>
            Make sure the backend server is running on port 3001.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 