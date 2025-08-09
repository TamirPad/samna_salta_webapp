import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../hooks/redux';
import { selectLanguage } from '../features/language/languageSlice';
import { apiService } from '../utils/api';
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

const RegisterPage: React.FC = () => {
  const language = useAppSelector(selectLanguage);
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await apiService.register({ name, email, password });
      navigate('/login');
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Registration failed');
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
            <Label htmlFor="password">{t('password', language)}</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <Submit type="submit" disabled={loading}>
            {loading ? <LoadingSpinner size="small" text="" /> : t('register', language)}
          </Submit>
        </Form>
      </Card>
    </Container>
  );
};

export default RegisterPage;


