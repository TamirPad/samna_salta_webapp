import React from 'react';
import styled from 'styled-components';

const DashboardContainer = styled.div`
  padding: 2rem 0;
`;

const AdminDashboard: React.FC = () => {
  return (
    <DashboardContainer>
      <div className="container">
        <h1>Admin Dashboard</h1>
        <p>Admin dashboard coming soon...</p>
      </div>
    </DashboardContainer>
  );
};

export default AdminDashboard; 