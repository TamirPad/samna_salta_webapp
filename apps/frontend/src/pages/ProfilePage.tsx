import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { selectLanguage, setLanguage, type Language } from '../features/language/languageSlice';
import { apiService } from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { toast } from 'react-toastify';

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
const Select = styled.select`
  width: 100%;
  padding: 0.875rem 0.75rem;
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  background: ${({ theme }) => theme.colors.background};
`;
const HelperText = styled.p`
  margin: 0.25rem 0 0;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.textLight};
`;
const ErrorText = styled.p`
  margin: 0.25rem 0 0;
  font-size: 0.85rem;
  color: #EF4444;
`;
const Actions = styled.div`
  display: flex;
  gap: 0.75rem;
`;
const Button = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  border: none;
  padding: 0.875rem;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
`;
const SecondaryButton = styled(Button)`
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.textPrimary};
  border: 2px solid ${({ theme }) => theme.colors.border};
`;

interface ProfileForm {
  name: string;
  email: string;
  phone?: string;
  delivery_address?: string;
  language: Language;
}

type FieldErrors = Partial<Record<keyof ProfileForm, string>>;

const ProfilePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const language = useAppSelector(selectLanguage);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState<ProfileForm>({ name: '', email: '', phone: '', delivery_address: '', language });
  const [initialProfile, setInitialProfile] = useState<ProfileForm>({ name: '', email: '', phone: '', delivery_address: '', language });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const isDirty = useMemo(() => JSON.stringify(profile) !== JSON.stringify(initialProfile), [profile, initialProfile]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const resp = await apiService.getProfile();
        const data = (resp as any)?.data?.data || (resp as any)?.data;
        if (data) {
          const loaded: ProfileForm = {
            name: data.name ?? '',
            email: data.email ?? '',
            phone: data.phone ?? '',
            delivery_address: data.delivery_address ?? '',
            language: (data.language as Language) || language,
          };
          setProfile(loaded);
          setInitialProfile(loaded);
        }
      } catch (e: any) {
        setError(e?.response?.data?.error || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const validate = (values: ProfileForm): FieldErrors => {
    const errors: FieldErrors = {};
    if (!values.name?.trim()) errors.name = language === 'he' ? 'שם נדרש' : 'Name is required';
    if (!values.email?.trim()) {
      errors.email = language === 'he' ? 'אימייל נדרש' : 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      errors.email = language === 'he' ? 'אימייל לא תקין' : 'Invalid email';
    }
    if (values.phone && values.phone.trim().length > 0) {
      const phoneOk = /[0-9+()\-\s]{7,}/.test(values.phone);
      if (!phoneOk) errors.phone = language === 'he' ? 'טלפון לא תקין' : 'Invalid phone number';
    }
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const errors = validate(profile);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      setSaving(true);
      const resp = await apiService.updateProfile(profile);
      const saved = (resp as any)?.data?.data || (resp as any)?.data || profile;
      // Update local baselines and optionally app language
      const normalized: ProfileForm = {
        name: saved.name ?? profile.name,
        email: saved.email ?? profile.email,
        phone: saved.phone ?? profile.phone,
        delivery_address: saved.delivery_address ?? profile.delivery_address,
        language: (saved.language as Language) || profile.language,
      };
      setProfile(normalized);
      setInitialProfile(normalized);
      if (normalized.language !== language) {
        dispatch(setLanguage(normalized.language));
      }
      toast.success(language === 'he' ? 'הפרופיל עודכן בהצלחה' : 'Profile updated');
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Failed to update profile');
    }
    finally {
      setSaving(false);
    }
  };

  const handleReset = (): void => {
    setProfile(initialProfile);
    setFieldErrors({});
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Container>
      <Title>{language === 'he' ? 'הפרופיל שלי' : 'My Profile'}</Title>
      {error && <div style={{ color: '#EF4444', marginBottom: '0.5rem' }}>{error}</div>}
      <Form onSubmit={handleSubmit} noValidate aria-describedby="form-status">
        <Row>
          <div>
            <Label htmlFor="name">{language === 'he' ? 'שם' : 'Name'}</Label>
            <Input
              id="name"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              required
              autoComplete="name"
              aria-invalid={Boolean(fieldErrors.name)}
              aria-describedby={fieldErrors.name ? 'name-error' : undefined}
            />
            {fieldErrors.name && <ErrorText id="name-error">{fieldErrors.name}</ErrorText>}
          </div>
          <div>
            <Label htmlFor="email">{language === 'he' ? 'אימייל' : 'Email'}</Label>
            <Input
              id="email"
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              required
              autoComplete="email"
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={fieldErrors.email ? 'email-error' : undefined}
            />
            {fieldErrors.email && <ErrorText id="email-error">{fieldErrors.email}</ErrorText>}
          </div>
        </Row>
        <Row>
          <div>
            <Label htmlFor="phone">{language === 'he' ? 'טלפון' : 'Phone'}</Label>
            <Input
              id="phone"
              value={profile.phone || ''}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              autoComplete="tel"
              inputMode="tel"
              pattern="[0-9+()\-\s]{7,}"
              aria-invalid={Boolean(fieldErrors.phone)}
              aria-describedby={fieldErrors.phone ? 'phone-error' : 'phone-help'}
            />
            {fieldErrors.phone ? (
              <ErrorText id="phone-error">{fieldErrors.phone}</ErrorText>
            ) : (
              <HelperText id="phone-help">{language === 'he' ? 'כולל קידומת' : 'Include country/area code'}</HelperText>
            )}
          </div>
          <div>
            <Label htmlFor="delivery_address">{language === 'he' ? 'כתובת משלוח' : 'Delivery Address'}</Label>
            <Input
              id="delivery_address"
              value={profile.delivery_address || ''}
              onChange={(e) => setProfile({ ...profile, delivery_address: e.target.value })}
              autoComplete="street-address"
            />
          </div>
        </Row>
        <Row>
          <div>
            <Label htmlFor="language">{language === 'he' ? 'שפה מועדפת' : 'Preferred Language'}</Label>
            <Select
              id="language"
              value={profile.language}
              onChange={(e) => setProfile({ ...profile, language: e.target.value as Language })}
              aria-label={language === 'he' ? 'שפה מועדפת' : 'Preferred Language'}
            >
              <option value="he">{language === 'he' ? 'עברית' : 'Hebrew'}</option>
              <option value="en">{language === 'he' ? 'אנגלית' : 'English'}</option>
            </Select>
            <HelperText>
              {language === 'he'
                ? 'נשתמש בשפה הזו לכל הממשק וההתראות'
                : 'We will use this language for UI and notifications'}
            </HelperText>
          </div>
          <div />
        </Row>
        <Actions>
          <Button type="submit" disabled={!isDirty || saving} aria-disabled={!isDirty || saving}>
            {saving
              ? (language === 'he' ? 'שומר…' : 'Saving…')
              : (language === 'he' ? 'שמירת שינויים' : 'Save Changes')}
          </Button>
          <SecondaryButton type="button" onClick={handleReset} disabled={!isDirty || saving}>
            {language === 'he' ? 'ביטול' : 'Cancel'}
          </SecondaryButton>
        </Actions>
        <div id="form-status" aria-live="polite" style={{ height: 0, overflow: 'hidden' }}>
          {error ? (language === 'he' ? 'שגיאה' : 'Error') : isDirty ? (language === 'he' ? 'שינויים לא נשמרו' : 'Unsaved changes') : ''}
        </div>
      </Form>
    </Container>
  );
};

export default ProfilePage;


