import React, { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

interface NetworkStatusProps {
  onClick?: () => void;
  className?: string;
}

const NetworkStatus: React.FC<NetworkStatusProps> = ({
  onClick,
  className,
}): JSX.Element | null => {
  const [showOffline, setShowOffline] = useState<boolean>(false);

  useEffect((): (() => void) => {
    const handleOnline = (): void => {
      setShowOffline(false);
    };

    const handleOffline = (): void => {
      setShowOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return (): void => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showOffline) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        background: '#ff6b6b',
        color: 'white',
        padding: '0.5rem',
        textAlign: 'center',
        zIndex: 9999,
        fontSize: '0.875rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
      }}
      onClick={onClick}
      className={className}
      data-testid='network-status'
      tabIndex={onClick ? 0 : undefined}
    >
      <WifiOff size={16} />
      You&apos;re currently offline. Some features may not work properly.
    </div>
  );
};

export default NetworkStatus;
