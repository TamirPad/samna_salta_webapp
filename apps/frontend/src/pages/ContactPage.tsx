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

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1rem;
`;

const Card = styled.div`
  background: #fff;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
`;

const ContactPage: React.FC = () => {
  const language = useAppSelector(selectLanguage);
  return (
    <Container>
      <Title>{language === 'he' ? 'צור קשר' : 'Contact'}</Title>
      <Grid>
        <Card>📍 123 Herzl St, Tel Aviv</Card>
        <Card>📞 +972-3-123-4567</Card>
        <Card>✉️ info@sammasalta.co.il</Card>
      </Grid>
    </Container>
  );
};

export default ContactPage;


