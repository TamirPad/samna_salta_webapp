import React from 'react';
import styled from 'styled-components';
import { useAppSelector } from '../../hooks/redux';
import { selectLanguage } from '../../features/language/languageSlice';

const FooterContainer = styled.footer`
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  color: white;
  padding: 2rem 0 1rem;
  margin-top: auto;
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
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
    color: #ecf0f1;
    margin-bottom: 1rem;
    font-size: 1.1rem;
    font-weight: 600;
  }
  
  p {
    color: #bdc3c7;
    line-height: 1.6;
    margin-bottom: 0.5rem;
  }
  
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  
  li {
    margin-bottom: 0.5rem;
  }
  
  a {
    color: #bdc3c7;
    text-decoration: none;
    transition: color 0.2s;
    
    &:hover {
      color: #ecf0f1;
    }
  }
`;

const ContactInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  color: #bdc3c7;
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const SocialLink = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  color: white;
  text-decoration: none;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
  }
`;

const FooterBottom = styled.div`
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 1rem;
  text-align: center;
  color: #95a5a6;
  font-size: 0.9rem;
`;

const Footer: React.FC = () => {
  const language = useAppSelector(selectLanguage);

  const currentYear = new Date().getFullYear();

  const getContent = () => {
    if (language === 'he') {
      return {
        about: {
          title: 'אודות',
          description: 'סמנה סלטה - מסעדה מסורתית לתימנית עם טעמים אותנטיים ומנות מסורתיות.',
          address: 'רחוב הרצל 123, תל אביב',
          phone: '+972-3-123-4567',
          email: 'info@sammasalta.co.il'
        },
        hours: {
          title: 'שעות פעילות',
          sunday: 'ראשון - חמישי: 11:00 - 22:00',
          friday: 'שישי: 11:00 - 15:00',
          saturday: 'שבת: סגור'
        },
        links: {
          title: 'קישורים מהירים',
          menu: 'תפריט',
          about: 'אודות',
          contact: 'צור קשר',
          privacy: 'מדיניות פרטיות',
          terms: 'תנאי שימוש'
        },
        copyright: `© ${currentYear} סמנה סלטה. כל הזכויות שמורות.`
      };
    } else {
      return {
        about: {
          title: 'About',
          description: 'Samna Salta - Traditional Yemenite restaurant with authentic flavors and traditional dishes.',
          address: '123 Herzl Street, Tel Aviv',
          phone: '+972-3-123-4567',
          email: 'info@sammasalta.co.il'
        },
        hours: {
          title: 'Opening Hours',
          sunday: 'Sunday - Thursday: 11:00 - 22:00',
          friday: 'Friday: 11:00 - 15:00',
          saturday: 'Saturday: Closed'
        },
        links: {
          title: 'Quick Links',
          menu: 'Menu',
          about: 'About',
          contact: 'Contact',
          privacy: 'Privacy Policy',
          terms: 'Terms of Service'
        },
        copyright: `© ${currentYear} Samna Salta. All rights reserved.`
      };
    }
  };

  const content = getContent();

  return (
    <FooterContainer>
      <FooterContent>
        <FooterGrid>
          <FooterSection>
            <h3>{content.about.title}</h3>
            <p>{content.about.description}</p>
            <ContactInfo>
              📍 {content.about.address}
            </ContactInfo>
            <ContactInfo>
              📞 {content.about.phone}
            </ContactInfo>
            <ContactInfo>
              ✉️ {content.about.email}
            </ContactInfo>
            <SocialLinks>
              <SocialLink href="#" aria-label="Facebook">
                📘
              </SocialLink>
              <SocialLink href="#" aria-label="Instagram">
                📷
              </SocialLink>
              <SocialLink href="#" aria-label="WhatsApp">
                💬
              </SocialLink>
            </SocialLinks>
          </FooterSection>

          <FooterSection>
            <h3>{content.hours.title}</h3>
            <p>{content.hours.sunday}</p>
            <p>{content.hours.friday}</p>
            <p>{content.hours.saturday}</p>
          </FooterSection>

          <FooterSection>
            <h3>{content.links.title}</h3>
            <ul>
              <li><a href="/menu">{content.links.menu}</a></li>
              <li><a href="/about">{content.links.about}</a></li>
              <li><a href="/contact">{content.links.contact}</a></li>
              <li><a href="/privacy">{content.links.privacy}</a></li>
              <li><a href="/terms">{content.links.terms}</a></li>
            </ul>
          </FooterSection>
        </FooterGrid>

        <FooterBottom>
          {content.copyright}
        </FooterBottom>
      </FooterContent>
    </FooterContainer>
  );
};

export default Footer;
