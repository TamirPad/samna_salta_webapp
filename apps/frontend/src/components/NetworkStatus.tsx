import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

interface NetworkStatusProps {
  showOfflineMessage?: boolean;
  showOnlineMessage?: boolean;
  autoHide?: boolean;
  hideDelay?: number;
}

const StatusContainer = styled.div<{ isOnline: boolean; isVisible: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10000;
  padding: 0.75rem 1rem;
  text-align: center;
  font-weight: 500;
  transition: all 0.3s ease;
  transform: translateY(${({ isVisible }) => isVisible ? '0' : '-100%'});
  
  ${({ isOnline }) => isOnline ? `
    background: #d4edda;
    color: #155724;
    border-bottom: 1px solid #c3e6cb;
  ` : `
    background: #f8d7da;
    color: #721c24;
    border-bottom: 1px solid #f5c6cb;
  `}
`;

const StatusMessage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.9rem;
`;

const StatusIcon = styled.span`
  font-size: 1rem;
`;

const NetworkStatus: React.FC<NetworkStatusProps> = ({
  showOfflineMessage = true,
  showOnlineMessage = false,
  autoHide = true,
  hideDelay = 3000
}) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isVisible, setIsVisible] = useState(false);
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (showOnlineMessage) {
        setShowMessage(true);
        setIsVisible(true);
        if (autoHide) {
          setTimeout(() => setIsVisible(false), hideDelay);
        }
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      if (showOfflineMessage) {
        setShowMessage(true);
        setIsVisible(true);
      }
    };

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [showOfflineMessage, showOnlineMessage, autoHide, hideDelay]);

  // Don't render if no message should be shown
  if (!showMessage) {
    return null;
  }

  const getStatusMessage = () => {
    if (isOnline) {
      return {
        icon: '✅',
        text: 'You are back online'
      };
    } else {
      return {
        icon: '❌',
        text: 'You are offline. Please check your internet connection.'
      };
    }
  };

  const status = getStatusMessage();

  return (
    <StatusContainer isOnline={isOnline} isVisible={isVisible}>
      <StatusMessage>
        <StatusIcon>{status.icon}</StatusIcon>
        {status.text}
      </StatusMessage>
    </StatusContainer>
  );
};

export default NetworkStatus;
