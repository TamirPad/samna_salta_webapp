import React from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../hooks/redux';
import { selectLanguage } from '../features/language/languageSlice';
import styled from 'styled-components';

const HomeContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
`;

const Hero = styled.section`
  background: ${({ theme }) => theme.gradients.primary};
  color: white;
  padding: 4rem 2rem;
  text-align: center;
`;

const HeroContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const HeroTitle = styled.h1`
  font-size: 3rem;
  margin-bottom: 1rem;
  font-weight: 700;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 1.2rem;
  margin-bottom: 2rem;
  opacity: 0.9;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const CTAButton = styled(Link)`
  display: inline-block;
  background: white;
  color: ${({ theme }) => theme.colors.primary};
  padding: 1rem 2rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  font-size: 1.1rem;
  transition: all 0.3s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const MainContent = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: 4rem 2rem;
`;

const Section = styled.section`
  margin-bottom: 4rem;
`;

const SectionTitle = styled.h2`
  text-align: center;
  color: #2c3e50;
  font-size: 2.5rem;
  margin-bottom: 2rem;
  font-weight: 600;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
`;

const FeatureCard = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: transform 0.3s;
  
  &:hover {
    transform: translateY(-4px);
  }
`;

const FeatureIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
`;

const FeatureTitle = styled.h3`
  color: ${({ theme }) => theme.colors.primary};
  font-size: 1.5rem;
  margin-bottom: 1rem;
  font-weight: 600;
`;

const FeatureDescription = styled.p`
  color: #666;
  line-height: 1.6;
`;

const MenuPreview = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

const MenuButton = styled(Link)`
  display: inline-block;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  padding: 1rem 2rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  margin-top: 1rem;
  transition: background-color 0.3s;
  
  &:hover {
    background: ${({ theme }) => theme.colors.primaryDark};
  }
`;

const ContactSection = styled.div`
  background: #2c3e50;
  color: white;
  padding: 3rem 2rem;
  text-align: center;
`;

const ContactContent = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const ContactTitle = styled.h2`
  font-size: 2rem;
  margin-bottom: 1rem;
`;

const ContactInfo = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  margin: 2rem 0;
`;

const ContactItem = styled.div`
  text-align: center;
  
  h3 {
    color: ${({ theme }) => theme.colors.primary};
    margin-bottom: 0.5rem;
  }
  
  p {
    color: #bdc3c7;
  }
`;

const HomePage: React.FC = () => {
  const language = useAppSelector(selectLanguage);

  const getContent = () => {
    if (language === 'he') {
      return {
        hero: {
          title: 'ברוכים הבאים לסמנה וסלתה',
          subtitle: 'גלה את הטעמים המסורתיים של המטבח התימני',
          cta: 'צפה בתפריט'
        },
        features: {
          title: 'למה לבחור בנו?',
          items: [
            {
              icon: '🍽️',
              title: 'מטבח מסורתי',
              description: 'מנות אותנטיות מהמטבח התימני המסורתי'
            },
            {
              icon: '🌿',
              title: 'מרכיבים טריים',
              description: 'אנו משתמשים במרכיבים הטריים והאיכותיים ביותר'
            },
            {
              icon: '🚚',
              title: 'משלוח מהיר',
              description: 'משלוח מהיר ואמין לכל מקום בעיר'
            }
          ]
        },
        menu: {
          title: 'תפריט מגוון',
          description: 'גלה את המנות המסורתיות שלנו',
          button: 'צפה בתפריט המלא'
        },
        contact: {
          title: 'צור קשר',
          address: 'רחוב הרצל 123, תל אביב',
          phone: '+972-3-123-4567',
          hours: 'ראשון - חמישי: 11:00 - 22:00'
        }
      };
    } else {
      return {
        hero: {
          title: 'Welcome to Samna Salta',
          subtitle: 'Discover the traditional flavors of Yemenite cuisine',
          cta: 'View Menu'
        },
        features: {
          title: 'Why Choose Us?',
          items: [
            {
              icon: '🍽️',
              title: 'Traditional Cuisine',
              description: 'Authentic dishes from traditional Yemenite kitchen'
            },
            {
              icon: '🌿',
              title: 'Fresh Ingredients',
              description: 'We use only the freshest and highest quality ingredients'
            },
            {
              icon: '🚚',
              title: 'Fast Delivery',
              description: 'Fast and reliable delivery anywhere in the city'
            }
          ]
        },
        menu: {
          title: 'Diverse Menu',
          description: 'Discover our traditional dishes',
          button: 'View Full Menu'
        },
        contact: {
          title: 'Contact Us',
          address: '123 Herzl Street, Tel Aviv',
          phone: '+972-3-123-4567',
          hours: 'Sunday - Thursday: 11:00 - 22:00'
        }
      };
    }
  };

  const content = getContent();

  return (
    <HomeContainer>
      <Hero>
        <HeroContent>
          <HeroTitle>{content.hero.title}</HeroTitle>
          <HeroSubtitle>{content.hero.subtitle}</HeroSubtitle>
          <CTAButton to="/menu">{content.hero.cta}</CTAButton>
        </HeroContent>
      </Hero>

      <MainContent>
        <Section>
          <SectionTitle>{content.features.title}</SectionTitle>
          <FeaturesGrid>
            {content.features.items.map((feature, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <FeatureCard key={`feature-${index}`}>
                <FeatureIcon>{feature.icon}</FeatureIcon>
                <FeatureTitle>{feature.title}</FeatureTitle>
                <FeatureDescription>{feature.description}</FeatureDescription>
              </FeatureCard>
            ))}
          </FeaturesGrid>
        </Section>

        <Section>
          <MenuPreview>
            <SectionTitle>{content.menu.title}</SectionTitle>
            <p>{content.menu.description}</p>
            <MenuButton to="/menu">{content.menu.button}</MenuButton>
          </MenuPreview>
        </Section>
      </MainContent>

      <ContactSection>
        <ContactContent>
          <ContactTitle>{content.contact.title}</ContactTitle>
          <ContactInfo>
            <ContactItem>
              <h3>📍 {language === 'he' ? 'כתובת' : 'Address'}</h3>
              <p>{content.contact.address}</p>
            </ContactItem>
            <ContactItem>
              <h3>📞 {language === 'he' ? 'טלפון' : 'Phone'}</h3>
              <p>{content.contact.phone}</p>
            </ContactItem>
            <ContactItem>
              <h3>🕒 {language === 'he' ? 'שעות פעילות' : 'Hours'}</h3>
              <p>{content.contact.hours}</p>
            </ContactItem>
          </ContactInfo>
        </ContactContent>
      </ContactSection>
    </HomeContainer>
  );
};

export default HomePage;
