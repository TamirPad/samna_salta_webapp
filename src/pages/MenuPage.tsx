import React from 'react';
import styled from 'styled-components';

const MenuContainer = styled.div`
  padding: 2rem 0;
`;

const MenuPage: React.FC = () => {
  return (
    <MenuContainer>
      <div className="container">
        <h1>Menu Page</h1>
        <p>Menu page coming soon...</p>
      </div>
    </MenuContainer>
  );
};

export default MenuPage; 