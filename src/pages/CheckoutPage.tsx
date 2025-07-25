import React from 'react';
import styled from 'styled-components';

const CheckoutContainer = styled.div`
  padding: 2rem 0;
`;

const CheckoutPage: React.FC = () => {
  return (
    <CheckoutContainer>
      <div className="container">
        <h1>Checkout Page</h1>
        <p>Checkout page coming soon...</p>
      </div>
    </CheckoutContainer>
  );
};

export default CheckoutPage; 