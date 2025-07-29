import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { loginStart, loginSuccess, loginFailure, selectAuth } from '../features/auth/authSlice';
import { selectLanguage } from '../features/language/languageSlice';
import LoadingSpinner from '../components/LoadingSpinner';
import styled from 'styled-components';

const LoginContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #8B4513 0%, #D2691E 100%);
  padding: 1rem;
`;

const LoginCard = styled.div`
  background: white;
  padding: 2.5rem;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  text-align: center;
`;

const Logo = styled.div`
  font-size: 2.5rem;
  margin-bottom: 1rem;
`;

const Title = styled.h1`
  color: #8B4513;
  margin-bottom: 0.5rem;
  font-size: 1.8rem;
  font-weight: 600;
`;

const Subtitle = styled.p`
  color: #666;
  margin-bottom: 2rem;
  font-size: 1rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  text-align: left;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
  font-weight: 500;
  font-size: 0.9rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e1e5e9;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #8B4513;
  }

  &:invalid {
    border-color: #e74c3c;
  }
`;

const LoginButton = styled.button`
  background: #8B4513;
  color: white;
  border: none;
  padding: 0.875rem;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-top: 1rem;

  &:hover:not(:disabled) {
    background: #A0522D;
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const DemoButton = styled.button`
  background: transparent;
  color: #8B4513;
  border: 2px solid #8B4513;
  padding: 0.75rem;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 1rem;

  &:hover {
    background: #8B4513;
    color: white;
  }
`;

const ErrorMessage = styled.div`
  background: #f8d7da;
  color: #721c24;
  padding: 0.75rem;
  border-radius: 6px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  border: 1px solid #f5c6cb;
`;

const SuccessMessage = styled.div`
  background: #d4edda;
  color: #155724;
  padding: 0.75rem;
  border-radius: 6px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  border: 1px solid #c3e6cb;
`;

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAppSelector(selectAuth);
  const language = useAppSelector(selectLanguage);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      dispatch(loginStart());

      // Simulate API call (replace with actual API call)
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        const { user, token } = data.data;
        
        // Store token and user data
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        dispatch(loginSuccess(user));
        setSuccess(language === 'he' ? 'התחברות מוצלחת!' : 'Login successful!');

        // Redirect based on user type
        setTimeout(() => {
          if (user.isAdmin) {
            navigate('/admin', { replace: true });
          } else {
            navigate('/home', { replace: true });
          }
        }, 1000);
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (err: any) {
      const errorMessage = err.message || (language === 'he' ? 'שגיאה בהתחברות' : 'Login failed');
      setError(errorMessage);
      dispatch(loginFailure(errorMessage));
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setEmail('admin@sammasalta.com');
    setPassword('admin123');
  };

  const getContent = () => {
    if (language === 'he') {
      return {
        title: 'ברוכים הבאים',
        subtitle: 'התחבר לחשבון שלך',
        email: 'אימייל',
        password: 'סיסמה',
        login: 'התחבר',
        demo: 'התחבר עם חשבון דמו',
        error: 'שגיאה בהתחברות',
        success: 'התחברות מוצלחת!'
      };
    } else {
      return {
        title: 'Welcome Back',
        subtitle: 'Sign in to your account',
        email: 'Email',
        password: 'Password',
        login: 'Sign In',
        demo: 'Login with Demo Account',
        error: 'Login failed',
        success: 'Login successful!'
      };
    }
  };

  const content = getContent();

  return (
    <LoginContainer>
      <LoginCard>
        <Logo>🍽️</Logo>
        <Title>{content.title}</Title>
        <Subtitle>{content.subtitle}</Subtitle>

        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>{success}</SuccessMessage>}

        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="email">{content.email}</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              placeholder={language === 'he' ? 'הכנס את האימייל שלך' : 'Enter your email'}
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="password">{content.password}</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              placeholder={language === 'he' ? 'הכנס את הסיסמה שלך' : 'Enter your password'}
            />
          </FormGroup>

          <LoginButton type="submit" disabled={loading}>
            {loading ? (
              <LoadingSpinner size="small" text="" />
            ) : (
              content.login
            )}
          </LoginButton>

          <DemoButton type="button" onClick={handleDemoLogin} disabled={loading}>
            {content.demo}
          </DemoButton>
        </Form>
      </LoginCard>
    </LoginContainer>
  );
};

export default LoginPage;
