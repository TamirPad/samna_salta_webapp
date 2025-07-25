import React from 'react';
import styled from 'styled-components';

const CartContainer = styled.div`
  padding: 2rem 0;
`;

const CartPage: React.FC = () => {
  return (
    <CartContainer>
      <div className="container">
        <h1>Cart Page</h1>
        <p>Cart page coming soon...</p>
      </div>
    </CartContainer>
  );
};

export default CartPage; 