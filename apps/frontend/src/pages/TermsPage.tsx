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

const TermsPage: React.FC = () => (
  <Container>
    <Title>Terms of Service</Title>
    <P>
      By using our service you agree to our standard terms including acceptable
      use, disclaimers, and limitations of liability.
    </P>
  </Container>
);

export default TermsPage;


