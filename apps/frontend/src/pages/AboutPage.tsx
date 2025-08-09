import React from 'react';
import styled from 'styled-components';
import { useAppSelector } from '../hooks/redux';
import { selectLanguage } from '../features/language/languageSlice';

const Container = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem 1rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 1rem;
`;

const Paragraph = styled.p`
  color: #4b5563;
  line-height: 1.7;
  margin-bottom: 1rem;
`;

const AboutPage: React.FC = () => {
  const language = useAppSelector(selectLanguage);
  return (
    <Container>
      <Title>{language === 'he' ? 'אודות' : 'About'}</Title>
      <Paragraph>
        {language === 'he'
          ? 'סמנה וסלתה היא מסעדה משפחתית עם אהבה עמוקה למטבח התימני. אנו מגישים מנות אותנטיות עם מרכיבים טריים ואיכותיים.'
          : 'Samna Salta is a family-owned restaurant with a deep love for Yemenite cuisine. We serve authentic dishes made with fresh, high-quality ingredients.'}
      </Paragraph>
      <Paragraph>
        {language === 'he'
          ? 'המטרה שלנו היא להביא אליכם את הטעמים המסורתיים באווירה נעימה וחמה.'
          : 'Our mission is to bring you traditional flavors in a warm, welcoming atmosphere.'}
      </Paragraph>
    </Container>
  );
};

export default AboutPage;


