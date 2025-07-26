import React, { memo } from 'react';
import styled, { keyframes } from 'styled-components';

// Animation keyframes
const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

// Styled Components
const SpinnerContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  padding: 2rem;
  width: 100%;

  @media (max-width: 768px) {
    min-height: 150px;
    padding: 1.5rem;
  }
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #8B4513;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
  margin-bottom: 1rem;
  will-change: transform;

  @media (max-width: 768px) {
    width: 32px;
    height: 32px;
    border-width: 3px;
  }
`;

const LoadingText = styled.div`
  color: #666;
  font-size: 1rem;
  font-weight: 500;
  text-align: center;
  animation: ${pulse} 2s ease-in-out infinite;
  will-change: opacity;

  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

const SpinnerWrapper = styled.div`
  position: relative;
  display: inline-block;
`;

const SpinnerScreenReader = styled.div`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;

// Types
interface LoadingSpinnerProps {
  text?: string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'overlay' | 'inline';
  ariaLabel?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  text = 'Loading...', 
  // size = 'medium',
  // variant = 'default',
  ariaLabel
}) => {
  // Memoized aria label
  const screenReaderText = ariaLabel || text;

  return (
    <SpinnerContainer role="status" aria-live="polite">
      <SpinnerWrapper>
        <Spinner 
          aria-hidden="true"
          role="presentation"
        />
        <SpinnerScreenReader>
          {screenReaderText}
        </SpinnerScreenReader>
      </SpinnerWrapper>
      <LoadingText aria-hidden="true">
        {text}
      </LoadingText>
    </SpinnerContainer>
  );
};

export default memo(LoadingSpinner); 