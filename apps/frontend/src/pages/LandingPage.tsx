import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';
import { useAppSelector } from '../hooks/redux';
import { selectLanguage } from '../features/language/languageSlice';

const float = keyframes`
  0% { transform: translateY(0px) translateX(0px) scale(1); opacity: 0.9; }
  50% { transform: translateY(-12px) translateX(6px) scale(1.03); opacity: 1; }
  100% { transform: translateY(0px) translateX(0px) scale(1); opacity: 0.9; }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.02); }
  100% { transform: scale(1); }
`;

const Page = styled.div`
  min-height: 100vh;
  width: 100%;
  display: grid;
  place-items: center;
  background: ${({ theme }) => theme.gradients.background};
  position: relative;
  overflow: hidden;
`;

const Decorative = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;

  .blob {
    position: absolute;
    filter: blur(48px);
    opacity: 0.35;
    animation: ${float} 9s ease-in-out infinite;
    border-radius: 999px;
  }

  .b1 { width: 380px; height: 380px; background: ${({ theme }) => theme.colors.gradientStart}; top: -80px; left: -80px; }
  .b2 { width: 320px; height: 320px; background: ${({ theme }) => theme.colors.secondary}; bottom: -100px; right: -60px; animation-delay: 1.3s; }
  .b3 { width: 240px; height: 240px; background: ${({ theme }) => theme.colors.primaryLight}; top: 40%; left: -60px; animation-delay: 0.6s; }

  @media (max-width: 768px) {
    .b1 { width: 260px; height: 260px; }
    .b2 { width: 220px; height: 220px; }
    .b3 { width: 180px; height: 180px; }
  }
`;

const Card = styled(motion.div)`
  width: 100%;
  max-width: 960px;
  margin: 0 auto;
  padding: 2.25rem 1.5rem;
  border-radius: ${({ theme }) => theme.borderRadius.large};
  background: ${({ theme }) => theme.colors.surface};
  box-shadow: ${({ theme }) => theme.shadows.large};
  text-align: center;
  display: grid;
  gap: 1rem;

  @media (min-width: 768px) {
    padding: 3rem 2.5rem;
    gap: 1.25rem;
  }
`;

const LogoRow = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
`;

const LogoMark = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  background: ${({ theme }) => theme.gradients.primary};
  color: #fff;
  font-size: 1.25rem;
  animation: ${pulse} 3.2s ease-in-out infinite;

  @media (max-width: 480px) {
    width: 40px;
    height: 40px;
    font-size: 1.1rem;
  }
`;

const Brand = styled.span`
  font-weight: 800;
  font-size: 1.25rem;
  letter-spacing: 0.2px;
  color: ${({ theme }) => theme.colors.textPrimary};

  @media (max-width: 480px) {
    font-size: 1.1rem;
  }
`;

const Title = styled(motion.h1)`
  margin: 0.25rem 0 0.5rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 2.25rem;
  line-height: 1.2;

  @media (max-width: 768px) {
    font-size: 1.9rem;
  }

  @media (max-width: 375px) {
    font-size: 1.75rem;
  }
`;

const Subtitle = styled(motion.p)`
  color: ${({ theme }) => theme.colors.textSecondary};
  max-width: 56ch;
  margin: 0 auto 0.5rem;
`;

const CTA = styled(motion(Link))`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.875rem 1.25rem;
  border-radius: 999px;
  text-decoration: none;
  font-weight: 700;
  font-size: 1rem;
  color: #fff;
  background: ${({ theme }) => theme.gradients.primary};
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.25);
  will-change: transform;

  &:hover { filter: brightness(1.02); }

  @media (max-width: 480px) {
    padding: 0.875rem 1.1rem;
  }
`;

const Helper = styled(motion.button)`
  margin-top: 0.25rem;
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.colors.textLight};
  font-size: 0.95rem;
  text-decoration: underline;
  cursor: pointer;
`;

const LandingPage: React.FC = () => {
  const language = useAppSelector(selectLanguage);
  const navigate = useNavigate();

  const content = language === 'he'
    ? {
        brand: 'סמנה וסלתה',
        title: 'טעמים ביתיים. חוויה מודרנית.',
        subtitle: 'הצטרפו אלינו למסע של טעמים אותנטיים ותפריט נגיש בכל מכשיר.',
        cta: 'כניסה',
        helper: 'אין לך חשבון? הירשם',
      }
    : {
        brand: 'Samna Salta',
        title: 'Homestyle flavors. Modern experience.',
        subtitle: 'Join us for authentic taste with a seamless menu on any device.',
        cta: 'Enter',
        helper: "Don't have an account? Register",
      };

  return (
    <Page>
      <Decorative aria-hidden>
        <div className="blob b1" />
        <div className="blob b2" />
        <div className="blob b3" />
      </Decorative>

      <Card
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <LogoRow>
          <LogoMark aria-hidden>🍽️</LogoMark>
          <Brand>{content.brand}</Brand>
        </LogoRow>

        <Title
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {content.title}
        </Title>

        <Subtitle
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {content.subtitle}
        </Subtitle>

        <CTA
          to="/login"
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.98 }}
          aria-label={content.cta}
        >
          {content.cta} →
        </CTA>

        <Helper
          type="button"
          onClick={() => navigate('/register')}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
        >
          {content.helper}
        </Helper>
      </Card>
    </Page>
  );
};

export default LandingPage;


