import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useAppSelector } from '../hooks/redux';
import { selectLanguage } from '../features/language/languageSlice';
import { apiService } from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';

const Container = styled.div`
  max-width: 720px;
  margin: 0 auto;
  padding: 2rem 1rem;
`;
const Title = styled.h1``;
const Form = styled.form`
  display: grid;
  gap: 1rem;
`;
const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  @media (max-width: 768px) { grid-template-columns: 1fr; }
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

const ProfilePage: React.FC = () => {
  const language = useAppSelector(selectLanguage);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState<any>({ name: '', email: '', phone: '', delivery_address: '', language });

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const resp = await apiService.getProfile();
        const data = (resp as any)?.data?.data || (resp as any)?.data;
        if (data) setProfile((prev: any) => ({ ...prev, ...data }));
      } catch (e: any) {
        setError(e?.response?.data?.error || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await apiService.updateProfile(profile);
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Failed to update profile');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Container>
      <Title>{language === 'he' ? 'הפרופיל שלי' : 'My Profile'}</Title>
      {error && <div style={{ color: '#EF4444', marginBottom: '0.5rem' }}>{error}</div>}
      <Form onSubmit={handleSubmit}>
        <Row>
          <div>
            <Label htmlFor="name">{language === 'he' ? 'שם' : 'Name'}</Label>
            <Input id="name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} required />
          </div>
          <div>
            <Label htmlFor="email">{language === 'he' ? 'אימייל' : 'Email'}</Label>
            <Input id="email" type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} required />
          </div>
        </Row>
        <Row>
          <div>
            <Label htmlFor="phone">{language === 'he' ? 'טלפון' : 'Phone'}</Label>
            <Input id="phone" value={profile.phone || ''} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="delivery_address">{language === 'he' ? 'כתובת משלוח' : 'Delivery Address'}</Label>
            <Input id="delivery_address" value={profile.delivery_address || ''} onChange={(e) => setProfile({ ...profile, delivery_address: e.target.value })} />
          </div>
        </Row>
        <Submit type="submit">{language === 'he' ? 'שמירת שינויים' : 'Save Changes'}</Submit>
      </Form>
    </Container>
  );
};

export default ProfilePage;


