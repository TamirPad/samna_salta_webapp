import React, { useState } from 'react';
import styled from 'styled-components';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppSelector } from '../hooks/redux';
import { selectLanguage } from '../features/language/languageSlice';
import { api } from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { t } from '../utils/i18n';

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

function useQuery() {
  const { search } = useLocation();
  return React.useMemo(() => new URLSearchParams(search), [search]);
}

const ResetPasswordPage: React.FC = () => {
  const language = useAppSelector(selectLanguage);
  const navigate = useNavigate();
  const qs = useQuery();
  const token = qs.get('token') || '';
  const uid = qs.get('uid') || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/reset-password', { token, password, uid });
      navigate('/login');
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Card>
        <Title>{t('reset_password', language)}</Title>
        {error && <div style={{ color: '#EF4444', marginBottom: '0.5rem' }}>{error}</div>}
        <Form onSubmit={handleSubmit} noValidate>
          <div>
            <Label htmlFor="password">{t('new_password', language)}</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="confirm">{t('confirm_password', language)}</Label>
            <Input id="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
          </div>
          <Submit type="submit" disabled={loading}>
            {loading ? <LoadingSpinner size="small" text="" /> : t('submit', language)}
          </Submit>
        </Form>
      </Card>
    </Container>
  );
};

export default ResetPasswordPage;


