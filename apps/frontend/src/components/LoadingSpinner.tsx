import React from 'react';
import styled, { keyframes } from 'styled-components';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  text?: string;
  fullScreen?: boolean;
}

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const SpinnerContainer = styled.div<{ $fullScreen: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  ${({ $fullScreen }) => $fullScreen && `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(255, 255, 255, 0.9);
    z-index: 9999;
  `}
`;

const Spinner = styled.div<{ $size: string; $color: string }>`
  width: ${({ $size }) => {
    switch ($size) {
      case 'small': return '20px';
      case 'large': return '60px';
      default: return '40px';
    }
  }};
  height: ${({ $size }) => {
    switch ($size) {
      case 'small': return '20px';
      case 'large': return '60px';
      default: return '40px';
    }
  }};
  border: 3px solid rgba(59, 130, 246, 0.15);
  border-top: 3px solid ${({ $color }) => $color};
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
  margin-bottom: ${({ $size }) => $size === 'small' ? '8px' : '16px'};
`;

const LoadingText = styled.p<{ $size: string }>`
  margin: 0;
  color: #666;
  font-size: ${({ $size }) => $size === 'small' ? '12px' : '14px'};
  text-align: center;
`;

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  color = '#3B82F6',
  text,
  fullScreen = false
}) => {
  return (
    <SpinnerContainer $fullScreen={fullScreen}>
      <Spinner $size={size} $color={color} />
      {text && <LoadingText $size={size}>{text}</LoadingText>}
    </SpinnerContainer>
  );
};

export default LoadingSpinner;
