import React from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../hooks/redux';
import { selectLanguage } from '../features/language/languageSlice';
import styled from 'styled-components';

const NotFoundContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 2rem;
`;

const NotFoundCard = styled.div`
  background: white;
  padding: 3rem;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 500px;
  width: 100%;
`;

const NotFoundIcon = styled.div`
  font-size: 6rem;
  margin-bottom: 1rem;
`;

const NotFoundTitle = styled.h1`
  color: #2c3e50;
  font-size: 2.5rem;
  margin-bottom: 1rem;
  font-weight: 700;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const NotFoundMessage = styled.p`
  color: #666;
  font-size: 1.1rem;
  margin-bottom: 2rem;
  line-height: 1.6;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
  }
`;

const Button = styled(Link)`
  display: inline-block;
  padding: 0.875rem 1.5rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s;
  
  &.primary {
    background: ${({ theme }) => theme.colors.primary};
    color: white;
    
    &:hover {
      background: ${({ theme }) => theme.colors.primaryDark};
      transform: translateY(-2px);
    }
  }
  
  &.secondary {
    background: transparent;
    color: ${({ theme }) => theme.colors.primary};
    border: 2px solid ${({ theme }) => theme.colors.primary};
    
    &:hover {
      background: ${({ theme }) => theme.colors.primary};
      color: white;
    }
  }
`;

const NotFoundPage: React.FC = () => {
  const language = useAppSelector(selectLanguage);

  const getContent = () => {
    if (language === 'he') {
      return {
        title: '404 - דף לא נמצא',
        message: 'הדף שחיפשת לא קיים. ייתכן שהקישור שבור או שהדף הוסר.',
        homeButton: 'חזור לדף הבית',
        menuButton: 'צפה בתפריט',
        backButton: 'חזור אחורה'
      };
    } else {
      return {
        title: '404 - Page Not Found',
        message: 'The page you are looking for does not exist. The link might be broken or the page has been removed.',
        homeButton: 'Go to Home',
        menuButton: 'View Menu',
        backButton: 'Go Back'
      };
    }
  };

  const content = getContent();

  return (
    <NotFoundContainer>
      <NotFoundCard>
        <NotFoundIcon>😕</NotFoundIcon>
        <NotFoundTitle>{content.title}</NotFoundTitle>
        <NotFoundMessage>{content.message}</NotFoundMessage>
        
        <ActionButtons>
          <Button to="/home" className="primary">
            {content.homeButton}
          </Button>
          <Button to="/menu" className="secondary">
            {content.menuButton}
          </Button>
          <Button to="#" className="secondary" onClick={() => window.history.back()}>
            {content.backButton}
          </Button>
        </ActionButtons>
      </NotFoundCard>
    </NotFoundContainer>
  );
};

export default NotFoundPage;
