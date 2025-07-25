import React from 'react';
import styled from 'styled-components';

const CustomersContainer = styled.div`
  padding: 2rem 0;
`;

const AdminCustomers: React.FC = () => {
  return (
    <CustomersContainer>
      <div className="container">
        <h1>Admin Customers</h1>
        <p>Admin customers page coming soon...</p>
      </div>
    </CustomersContainer>
  );
};

export default AdminCustomers; 