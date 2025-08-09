import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { selectLanguage } from '../features/language/languageSlice';
import { apiService } from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { t } from '../utils/i18n';
import { loginStart, loginSuccess, loginFailure, selectAuth } from '../features/auth/authSlice';

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.gradients.background};
  padding: 1rem;
`;
const Card = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.large};
  box-shadow: ${({ theme }) => theme.shadows.large};
  padding: 2rem;
  width: 100%;
  max-width: 420px;
`;
const Title = styled.h1``;
const Form = styled.form`
  display: grid;
  gap: 1rem;
`;
const Label = styled.label``;
const Input = styled.input`
  width: 100%;
  padding: 0.875rem 0.75rem;
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
`;
const Submit = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  border: none;
  padding: 0.875rem;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
`;

const ActionsRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-top: 0.5rem;
`;

const SmallLink = styled.button`
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.colors.textLight};
  font-size: 0.9rem;
  cursor: pointer;
  padding: 0;
  text-decoration: underline;
`;

const RegisterPage: React.FC = () => {
  const language = useAppSelector(selectLanguage);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector(selectAuth);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect authenticated users away from register (guest-only guard)
  React.useEffect(() => {
    if (isAuthenticated && user) {
      navigate(user.isAdmin ? '/admin' : '/home', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      dispatch(loginStart());
      const response = await apiService.register({ name, email, password, phone: phone || undefined });
      const payload = (response as any)?.data?.data || (response as any)?.data;

      if (payload && payload.user && payload.token) {
        const { user, token } = payload;

        // Persist auth state
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        // Prime profile (creates if missing)
        try { await apiService.getProfile(); } catch (_) {}

        dispatch(loginSuccess(user));

        // Redirect based on role
        if (user.isAdmin) {
          navigate('/admin', { replace: true });
        } else {
          navigate('/home', { replace: true });
        }
      } else {
        throw new Error((response as any)?.data?.message || 'Registration failed');
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.error || err?.message || 'Registration failed';
      setError(errorMessage);
      dispatch(loginFailure(errorMessage));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Card>
        <Title>{t('register_title', language)}</Title>
        {error && <div style={{ color: '#EF4444', marginBottom: '0.5rem' }}>{error}</div>}
        <Form onSubmit={handleSubmit} noValidate>
          <div>
            <Label htmlFor="name">{t('name', language)}</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="email">{t('email', language)}</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="phone">{language === 'he' ? 'טלפון (אופציונלי)' : 'Phone (optional)'}</Label>
            <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="password">{t('password', language)}</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <Submit type="submit" disabled={loading}>
            {loading ? <LoadingSpinner size="small" text="" /> : t('register', language)}
          </Submit>
          <ActionsRow>
            <SmallLink type="button" onClick={() => navigate('/login')}>
              {language === 'he' ? 'כבר יש לך חשבון? התחבר/י' : 'Already have an account? Sign in'}
            </SmallLink>
          </ActionsRow>
        </Form>
      </Card>
    </Container>
  );
};

export default RegisterPage;


