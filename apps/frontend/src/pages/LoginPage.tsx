import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { loginStart, loginSuccess, loginFailure, selectAuth } from '../features/auth/authSlice';
import { apiService } from '../utils/api';
import { selectLanguage } from '../features/language/languageSlice';
import LoadingSpinner from '../components/LoadingSpinner';
import { t } from '../utils/i18n';
import styled from 'styled-components';

const Page = styled.div`
  min-height: 100vh;
  width: 100%;
  display: grid;
  grid-template-columns: 1fr;
  background: ${({ theme }) => theme.gradients.background};
  position: relative;

  @media (min-width: 960px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const BrandPane = styled.div`
  display: none;
  @media (min-width: 960px) {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 3rem;
    background: ${({ theme }) => theme.gradients.primary};
    position: relative;
    overflow: hidden;
  }
`;

const BrandCard = styled.div`
  color: #fff;
  text-align: center;
  max-width: 520px;
  backdrop-filter: saturate(120%) blur(6px);
  padding: 2rem;
`;

const BrandLogo = styled.div`
  font-size: 3rem;
  line-height: 1;
  margin-bottom: 1rem;
`;

const BrandTitle = styled.h1`
  color: #fff;
  margin-bottom: 0.5rem;
`;

const BrandSubtitle = styled.p`
  color: rgba(255,255,255,0.9);
`;

const FormPane = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;

  @media (min-width: 960px) {
    padding: 3rem;
  }
`;

const Card = styled.div`
  width: 100%;
  max-width: 420px;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.large};
  box-shadow: ${({ theme }) => theme.shadows.large};
  padding: 2rem;
`;

const LogoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

const LogoGlyph = styled.div`
  font-size: 2rem;
  line-height: 1;
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: 0.25rem;
  font-size: 1.75rem;
`;

const Subtitle = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 1.5rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FormGroup = styled.div`
  text-align: left;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-weight: 500;
  font-size: 0.95rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.875rem 0.75rem;
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  font-size: 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
  }
`;

const PasswordField = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const TogglePassword = styled.button`
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.colors.textLight};
  cursor: pointer;
  padding: 0.25rem 0.5rem;
`;

const LoginButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  padding: 0.875rem;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.1s;
  margin-top: 0.5rem;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.primaryDark};
  }

  &:active:not(:disabled) {
    transform: translateY(1px);
  }

  &:disabled {
    background: #cbd5e1;
    cursor: not-allowed;
  }
`;

const DemoButton = styled.button`
  background: transparent;
  color: ${({ theme }) => theme.colors.primary};
  border: 2px solid ${({ theme }) => theme.colors.primary};
  padding: 0.75rem;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 0.75rem;

  &:hover {
    background: ${({ theme }) => theme.colors.primary};
    color: white;
  }
`;

const DemoButtonsRow = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 0.75rem;
  flex-wrap: wrap;
`;

const ErrorMessage = styled.div`
  background: #fef2f2;
  color: ${({ theme }) => theme.colors.error};
  padding: 0.75rem;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  margin-bottom: 1rem;
  font-size: 0.9rem;
  border: 1px solid #fecaca;
`;

const SuccessMessage = styled.div`
  background: #ecfdf5;
  color: ${({ theme }) => theme.colors.success};
  padding: 0.75rem;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  margin-bottom: 1rem;
  font-size: 0.9rem;
  border: 1px solid #a7f3d0;
`;

const ActionsRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.25rem;
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

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { isAuthenticated, user } = useAppSelector(selectAuth);
  const language = useAppSelector(selectLanguage);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      dispatch(loginStart());

      // Use shared API service with retries and caching
      const response = await apiService.login({ email, password });
      const payload = (response as any)?.data?.data || (response as any)?.data;

      if (payload && payload.user && payload.token) {
        const { user, token } = payload;
        
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
        throw new Error((response as any)?.data?.message || 'Login failed');
      }
    } catch (err: any) {
      const errorMessage = err.message || (language === 'he' ? 'שגיאה בהתחברות' : 'Login failed');
      setError(errorMessage);
      dispatch(loginFailure(errorMessage));
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAdmin = () => {
    setEmail('admin@sammasalta.com');
    setPassword('admin123');
  };

  const handleDemoCustomer = () => {
    setEmail('customer@sammasalta.com');
    setPassword('customer123');
  };

  const getContent = () => ({
    title: t('login_title', language),
    subtitle: t('login_subtitle', language),
    email: t('email', language),
    password: t('password', language),
    login: t('sign_in', language),
    demo: t('login_demo', language),
    demoAdmin: language === 'he' ? 'כניסת דמו (מנהל)' : 'Use Admin Demo',
    demoCustomer: language === 'he' ? 'כניסת דמו (לקוח)' : 'Use Customer Demo',
    show: language === 'he' ? 'הצג' : 'Show',
    hide: language === 'he' ? 'הסתר' : 'Hide',
    forgot: t('forgot_password', language),
    error: language === 'he' ? 'שגיאה בהתחברות' : 'Login failed',
    success: language === 'he' ? 'התחברות מוצלחת!' : 'Login successful!'
  });

  const content = getContent();

  return (
    <Page>
      <BrandPane>
        <BrandCard>
          <BrandLogo>🍽️</BrandLogo>
          <BrandTitle>Samna Salta</BrandTitle>
          <BrandSubtitle>
            {language === 'he' ? 'טעמים ביתיים, חוויה מקוונת' : 'Homestyle flavors, online convenience'}
          </BrandSubtitle>
        </BrandCard>
      </BrandPane>

      <FormPane>
        <Card>
          <LogoRow>
            <LogoGlyph>🍽️</LogoGlyph>
            <div>
              <Title>{content.title}</Title>
              <Subtitle>{content.subtitle}</Subtitle>
            </div>
          </LogoRow>

          {error && <ErrorMessage role="alert">{error}</ErrorMessage>}
          {success && <SuccessMessage role="status">{success}</SuccessMessage>}

          <Form onSubmit={handleSubmit} noValidate>
            <FormGroup>
              <Label htmlFor="email">{content.email}</Label>
              <Input
                id="email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                placeholder={language === 'he' ? 'הכנס את האימייל שלך' : 'Enter your email'}
                aria-invalid={!!error}
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="password">{content.password}</Label>
              <PasswordField>
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  placeholder={language === 'he' ? 'הכנס את הסיסמה שלך' : 'Enter your password'}
                  aria-invalid={!!error}
                />
                <TogglePassword
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? content.hide : content.show}
                >
                  {showPassword ? content.hide : content.show}
                </TogglePassword>
              </PasswordField>
              <ActionsRow>
                <span />
                <SmallLink type="button" onClick={() => alert('Not implemented')}>
                  {content.forgot}
                </SmallLink>
              </ActionsRow>
            </FormGroup>

            <LoginButton type="submit" disabled={loading}>
              {loading ? (
                <LoadingSpinner size="small" text="" />
              ) : (
                content.login
              )}
            </LoginButton>

            <DemoButtonsRow>
              <DemoButton type="button" onClick={handleDemoAdmin} disabled={loading}>
                {content.demoAdmin}
              </DemoButton>
              <DemoButton type="button" onClick={handleDemoCustomer} disabled={loading}>
                {content.demoCustomer}
              </DemoButton>
            </DemoButtonsRow>
          </Form>
        </Card>
      </FormPane>
    </Page>
  );
};

export default LoginPage;
