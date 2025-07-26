import React from 'react';
import styled from 'styled-components';

const AnalyticsContainer = styled.div`
  padding: 2rem 0;
`;

const AdminAnalytics: React.FC = () => {
  return (
    <AnalyticsContainer>
      <div className="container">
        <h1>Admin Analytics</h1>
        <p>Admin analytics page coming soon...</p>
      </div>
    </AnalyticsContainer>
  );
};

export default AdminAnalytics; 