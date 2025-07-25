import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../../hooks/redux';
import { selectLanguage } from '../../features/language/languageSlice';

const FooterContainer = styled.footer`
  background: linear-gradient(135deg, #2F2F2F 0%, #4A4A4A 100%);
  color: white;
  padding: 3rem 0 1rem;
  margin-top: auto;
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;

  @media (max-width: 768px) {
    padding: 0 0.5rem;
  }
`;

const FooterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

const FooterSection = styled.div`
  h3 {
    color: #D2691E;
    margin-bottom: 1rem;
    font-size: 1.25rem;
  }

  p {
    line-height: 1.6;
    margin-bottom: 1rem;
    color: #CCC;
  }
`;

const FooterLinks = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  a {
    color: #CCC;
    text-decoration: none;
    transition: color 0.3s ease;

    &:hover {
      color: #D2691E;
    }
  }
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;

  a {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    color: white;
    text-decoration: none;
    transition: all 0.3s ease;

    &:hover {
      background: #D2691E;
      transform: translateY(-2px);
    }
  }
`;

const ContactInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  .contact-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #CCC;

    .icon {
      color: #D2691E;
      font-size: 1.2rem;
    }
  }
`;

const FooterBottom = styled.div`
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 1rem;
  text-align: center;
  color: #999;
  font-size: 0.9rem;

  a {
    color: #D2691E;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const Footer: React.FC = () => {
  const language = useAppSelector(selectLanguage);

  const currentYear = new Date().getFullYear();

  const translations = {
    he: {
      about: 'אודות',
      aboutText: 'סמנה סלטה - המאפייה הטובה ביותר בעיר עם מגוון רחב של לחמים טריים ומתוקים.',
      quickLinks: 'קישורים מהירים',
      contact: 'צור קשר',
      address: 'רחוב הראשי 123, תל אביב',
      phone: '+972-3-123-4567',
      email: 'info@sammasalta.co.il',
      hours: 'א-ה: 7:00-22:00, ו: 7:00-15:00',
      followUs: 'עקבו אחרינו',
      allRightsReserved: 'כל הזכויות שמורות',
      privacyPolicy: 'מדיניות פרטיות',
      termsOfService: 'תנאי שימוש',
    },
    en: {
      about: 'About',
      aboutText: 'Samna Salta - The best bakery in town with a wide variety of fresh breads and pastries.',
      quickLinks: 'Quick Links',
      contact: 'Contact',
      address: '123 Main Street, Tel Aviv',
      phone: '+972-3-123-4567',
      email: 'info@sammasalta.co.il',
      hours: 'Sun-Thu: 7:00-22:00, Fri: 7:00-15:00',
      followUs: 'Follow Us',
      allRightsReserved: 'All rights reserved',
      privacyPolicy: 'Privacy Policy',
      termsOfService: 'Terms of Service',
    }
  };

  const t = translations[language as keyof typeof translations];

  return (
    <FooterContainer>
      <FooterContent>
        <FooterGrid>
          <FooterSection>
            <h3>🍞 {language === 'he' ? 'סמנה סלטה' : 'Samna Salta'}</h3>
            <p>{t.aboutText}</p>
            <SocialLinks>
              <a href="https://facebook.com/samnasalta" target="_blank" rel="noopener noreferrer" aria-label="Facebook">📘</a>
              <a href="https://instagram.com/samnasalta" target="_blank" rel="noopener noreferrer" aria-label="Instagram">📷</a>
              <a href="https://twitter.com/samnasalta" target="_blank" rel="noopener noreferrer" aria-label="Twitter">🐦</a>
              <a href="https://wa.me/97231234567" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">📱</a>
            </SocialLinks>
          </FooterSection>

          <FooterSection>
            <h3>{t.quickLinks}</h3>
            <FooterLinks>
              <Link to="/">{language === 'he' ? 'בית' : 'Home'}</Link>
              <Link to="/menu">{language === 'he' ? 'תפריט' : 'Menu'}</Link>
              <Link to="/cart">{language === 'he' ? 'עגלה' : 'Cart'}</Link>
              <Link to="/order/123">{language === 'he' ? 'מעקב הזמנה' : 'Track Order'}</Link>
            </FooterLinks>
          </FooterSection>

          <FooterSection>
            <h3>{t.contact}</h3>
            <ContactInfo>
              <div className="contact-item">
                <span className="icon">📍</span>
                <span>{t.address}</span>
              </div>
              <div className="contact-item">
                <span className="icon">📞</span>
                <span>{t.phone}</span>
              </div>
              <div className="contact-item">
                <span className="icon">✉️</span>
                <span>{t.email}</span>
              </div>
              <div className="contact-item">
                <span className="icon">🕒</span>
                <span>{t.hours}</span>
              </div>
            </ContactInfo>
          </FooterSection>
        </FooterGrid>

        <FooterBottom>
          <p>
            © {currentYear} {language === 'he' ? 'סמנה סלטה' : 'Samna Salta'}. {t.allRightsReserved}
          </p>
          <p>
            <Link to="/privacy">{t.privacyPolicy}</Link> | <Link to="/terms">{t.termsOfService}</Link>
          </p>
        </FooterBottom>
      </FooterContent>
    </FooterContainer>
  );
};

export default Footer; 