import React from 'react';
import styled from 'styled-components';

const OrdersContainer = styled.div`
  padding: 2rem 0;
`;

const AdminOrders: React.FC = () => {
  return (
    <OrdersContainer>
      <div className="container">
        <h1>Admin Orders</h1>
        <p>Admin orders page coming soon...</p>
      </div>
    </OrdersContainer>
  );
};

export default AdminOrders; 