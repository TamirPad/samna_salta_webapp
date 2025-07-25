import React from 'react';
import styled from 'styled-components';

const ProductsContainer = styled.div`
  padding: 2rem 0;
`;

const AdminProducts: React.FC = () => {
  return (
    <ProductsContainer>
      <div className="container">
        <h1>Admin Products</h1>
        <p>Admin products page coming soon...</p>
      </div>
    </ProductsContainer>
  );
};

export default AdminProducts; 