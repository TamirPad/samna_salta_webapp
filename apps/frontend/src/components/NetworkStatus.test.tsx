import { render, screen, act } from '@testing-library/react';
import NetworkStatus from './NetworkStatus';

describe('NetworkStatus', () => {
  beforeEach(() => {
    // Mock navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    });
  });

  afterEach(() => {
    // Clean up event listeners
    window.dispatchEvent(new Event('online'));
  });

  it('should not render when online', () => {
    render(<NetworkStatus />);
    
    expect(screen.queryByText(/You're currently offline/)).not.toBeInTheDocument();
  });

  it('should render offline message when going offline', () => {
    render(<NetworkStatus />);
    
    // Simulate going offline
    act(() => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      });
      window.dispatchEvent(new Event('offline'));
    });
    
    expect(screen.getByText(/You're currently offline/)).toBeInTheDocument();
    expect(screen.getByText(/Some features may not work properly/)).toBeInTheDocument();
  });

  it('should hide offline message when going back online', () => {
    render(<NetworkStatus />);
    
    // Simulate going offline
    act(() => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      });
      window.dispatchEvent(new Event('offline'));
    });
    
    expect(screen.getByText(/You're currently offline/)).toBeInTheDocument();
    
    // Simulate going back online
    act(() => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true,
      });
      window.dispatchEvent(new Event('online'));
    });
    
    expect(screen.queryByText(/You're currently offline/)).not.toBeInTheDocument();
  });

  it('should render with correct styling', () => {
    render(<NetworkStatus />);
    
    // Simulate going offline
    act(() => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      });
      window.dispatchEvent(new Event('offline'));
    });
    
    const offlineMessage = screen.getByText(/You're currently offline/);
    expect(offlineMessage).toBeInTheDocument();
    
    // Check if the message is in a fixed position container
    const container = offlineMessage.closest('div');
    expect(container).toHaveStyle({
      position: 'fixed',
      top: '0',
      left: '0',
      right: '0',
      background: '#ff6b6b',
      color: 'white',
    });
  });

  it('should include WiFi off icon', () => {
    render(<NetworkStatus />);
    
    // Simulate going offline
    act(() => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      });
      window.dispatchEvent(new Event('offline'));
    });
    
    // The WifiOff icon should be present
    const icon = document.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('should handle multiple online/offline transitions', () => {
    render(<NetworkStatus />);
    
    // Simulate going offline
    act(() => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      });
      window.dispatchEvent(new Event('offline'));
    });
    
    expect(screen.getByText(/You're currently offline/)).toBeInTheDocument();
    
    // Simulate going back online
    act(() => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true,
      });
      window.dispatchEvent(new Event('online'));
    });
    
    expect(screen.queryByText(/You're currently offline/)).not.toBeInTheDocument();
    
    // Simulate going offline again
    act(() => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      });
      window.dispatchEvent(new Event('offline'));
    });
    
    expect(screen.getByText(/You're currently offline/)).toBeInTheDocument();
  });

  it('should clean up event listeners on unmount', () => {
    const { unmount } = render(<NetworkStatus />);
    
    // Spy on removeEventListener
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
    
    unmount();
    
    expect(removeEventListenerSpy).toHaveBeenCalledWith('online', expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith('offline', expect.any(Function));
  });

  it('should have high z-index for visibility', () => {
    render(<NetworkStatus />);
    
    // Simulate going offline
    act(() => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      });
      window.dispatchEvent(new Event('offline'));
    });
    
    const container = screen.getByText(/You're currently offline/).closest('div');
    expect(container).toHaveStyle({
      zIndex: '9999',
    });
  });

  it('should be positioned at the top of the screen', () => {
    render(<NetworkStatus />);
    
    // Simulate going offline
    act(() => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      });
      window.dispatchEvent(new Event('offline'));
    });
    
    const container = screen.getByText(/You're currently offline/).closest('div');
    expect(container).toHaveStyle({
      position: 'fixed',
      top: '0',
    });
  });
}); 