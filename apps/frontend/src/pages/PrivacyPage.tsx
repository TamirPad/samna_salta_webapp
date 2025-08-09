import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem 1rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 1rem;
`;

const P = styled.p`
  color: #4b5563;
  line-height: 1.7;
`;

const PrivacyPage: React.FC = () => (
  <Container>
    <Title>Privacy Policy</Title>
    <P>
      We respect your privacy. We only use your data to provide and improve our
      services. We never sell your personal information.
    </P>
  </Container>
);

export default PrivacyPage;


