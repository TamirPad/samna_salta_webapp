import React, { ReactElement, ReactNode, useState, useEffect } from 'react';
import { render, screen, fireEvent, waitFor } from '../utils/test-utils';
import NetworkStatus from './NetworkStatus';
import { NetworkMonitor } from '../utils/networkUtils';

// Mock the NetworkMonitor
jest.mock('../utils/networkUtils', () => ({
  NetworkMonitor: jest.fn(),
  isOnline: jest.fn(),
}));

const mockNetworkMonitor = NetworkMonitor as jest.MockedClass<
  typeof NetworkMonitor
>;

describe('NetworkStatus', () => {
  let mockAddListener: jest.Mock;
  let mockRemoveListener: jest.Mock;
  let mockGetStatus: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockAddListener = jest.fn();
    mockRemoveListener = jest.fn();
    mockGetStatus = jest.fn();

    mockNetworkMonitor.mockImplementation(
      () =>
        ({
          addListener: mockAddListener,
          removeListener: mockRemoveListener,
          getStatus: mockGetStatus,
          start: jest.fn(),
          stop: jest.fn(),
        }) as any
    );
  });

  describe('Initial Rendering', () => {
    it('should render with online status by default', () => {
      mockGetStatus.mockReturnValue({
        isOnline: true,
        isReconnecting: false,
        lastSeen: new Date(),
      });

      render(<NetworkStatus />);

      expect(screen.getByTestId('network-status')).toBeInTheDocument();
      expect(screen.getByText('Online')).toBeInTheDocument();
      expect(screen.getByTestId('network-status')).toHaveClass(
        'network-status--online'
      );
    });

    it('should render with offline status', () => {
      mockGetStatus.mockReturnValue({
        isOnline: false,
        isReconnecting: false,
        lastSeen: new Date(),
      });

      render(<NetworkStatus />);

      expect(screen.getByText('Offline')).toBeInTheDocument();
      expect(screen.getByTestId('network-status')).toHaveClass(
        'network-status--offline'
      );
    });

    it('should render with reconnecting status', () => {
      mockGetStatus.mockReturnValue({
        isOnline: false,
        isReconnecting: true,
        lastSeen: new Date(),
      });

      render(<NetworkStatus />);

      expect(screen.getByText('Reconnecting...')).toBeInTheDocument();
      expect(screen.getByTestId('network-status')).toHaveClass(
        'network-status--reconnecting'
      );
    });
  });

  describe('Network Status Updates', () => {
    it('should update status when network changes to online', async () => {
      mockGetStatus.mockReturnValue({
        isOnline: false,
        isReconnecting: false,
        lastSeen: new Date(),
      });

      render(<NetworkStatus />);

      expect(screen.getByText('Offline')).toBeInTheDocument();

      // Simulate network status change
      const mockListener = mockAddListener.mock.calls[0][0];
      mockListener({
        isOnline: true,
        isReconnecting: false,
        lastSeen: new Date(),
      });

      await waitFor(() => {
        expect(screen.getByText('Online')).toBeInTheDocument();
      });
    });

    it('should update status when network changes to offline', async () => {
      mockGetStatus.mockReturnValue({
        isOnline: true,
        isReconnecting: false,
        lastSeen: new Date(),
      });

      render(<NetworkStatus />);

      expect(screen.getByText('Online')).toBeInTheDocument();

      // Simulate network status change
      const mockListener = mockAddListener.mock.calls[0][0];
      mockListener({
        isOnline: false,
        isReconnecting: false,
        lastSeen: new Date(),
      });

      await waitFor(() => {
        expect(screen.getByText('Offline')).toBeInTheDocument();
      });
    });

    it('should update status when reconnecting', async () => {
      mockGetStatus.mockReturnValue({
        isOnline: false,
        isReconnecting: false,
        lastSeen: new Date(),
      });

      render(<NetworkStatus />);

      expect(screen.getByText('Offline')).toBeInTheDocument();

      // Simulate reconnecting status
      const mockListener = mockAddListener.mock.calls[0][0];
      mockListener({
        isOnline: false,
        isReconnecting: true,
        lastSeen: new Date(),
      });

      await waitFor(() => {
        expect(screen.getByText('Reconnecting...')).toBeInTheDocument();
      });
    });
  });

  describe('Component Lifecycle', () => {
    it('should add listener on mount', () => {
      render(<NetworkStatus />);

      expect(mockAddListener).toHaveBeenCalledTimes(1);
      expect(typeof mockAddListener.mock.calls[0][0]).toBe('function');
    });

    it('should remove listener on unmount', () => {
      const { unmount } = render(<NetworkStatus />);

      unmount();

      expect(mockRemoveListener).toHaveBeenCalledTimes(1);
    });

    it('should start network monitor on mount', () => {
      const mockStart = jest.fn();
      mockNetworkMonitor.mockImplementation(
        () =>
          ({
            addListener: mockAddListener,
            removeListener: mockRemoveListener,
            getStatus: mockGetStatus,
            start: mockStart,
            stop: jest.fn(),
            status: {
              isOnline: true,
              isReconnecting: false,
              lastSeen: new Date(),
            },
            listeners: new Set(),
            isStarted: false,
            notifyListeners: jest.fn(),
          }) as any
      );

      render(<NetworkStatus />);

      expect(mockStart).toHaveBeenCalledTimes(1);
    });

    it('should stop network monitor on unmount', () => {
      const mockStop = jest.fn();
      mockNetworkMonitor.mockImplementation(
        () =>
          ({
            addListener: mockAddListener,
            removeListener: mockRemoveListener,
            getStatus: mockGetStatus,
            start: jest.fn(),
            stop: mockStop,
          }) as any
      );

      const { unmount } = render(<NetworkStatus />);

      unmount();

      expect(mockStop).toHaveBeenCalledTimes(1);
    });
  });

  describe('User Interactions', () => {
    it('should show tooltip on hover', async () => {
      mockGetStatus.mockReturnValue({
        isOnline: true,
        isReconnecting: false,
        lastSeen: new Date('2023-01-01T12:00:00Z'),
      });

      render(<NetworkStatus />);

      const statusElement = screen.getByTestId('network-status');
      fireEvent.mouseEnter(statusElement);

      await waitFor(() => {
        expect(screen.getByText(/Last seen:/)).toBeInTheDocument();
      });
    });

    it('should hide tooltip on mouse leave', async () => {
      mockGetStatus.mockReturnValue({
        isOnline: true,
        isReconnecting: false,
        lastSeen: new Date('2023-01-01T12:00:00Z'),
      });

      render(<NetworkStatus />);

      const statusElement = screen.getByTestId('network-status');
      fireEvent.mouseEnter(statusElement);

      await waitFor(() => {
        expect(screen.getByText(/Last seen:/)).toBeInTheDocument();
      });

      fireEvent.mouseLeave(statusElement);

      await waitFor(() => {
        expect(screen.queryByText(/Last seen:/)).not.toBeInTheDocument();
      });
    });

    it('should handle click events', () => {
      const mockOnClick = jest.fn();
      mockGetStatus.mockReturnValue({
        isOnline: true,
        isReconnecting: false,
        lastSeen: new Date(),
      });

      render(<NetworkStatus onClick={mockOnClick} />);

      const statusElement = screen.getByTestId('network-status');
      fireEvent.click(statusElement);

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      mockGetStatus.mockReturnValue({
        isOnline: true,
        isReconnecting: false,
        lastSeen: new Date(),
      });

      render(<NetworkStatus />);

      const statusElement = screen.getByTestId('network-status');
      expect(statusElement).toHaveAttribute('role', 'status');
      expect(statusElement).toHaveAttribute('aria-live', 'polite');
    });

    it('should have proper ARIA label for online status', () => {
      mockGetStatus.mockReturnValue({
        isOnline: true,
        isReconnecting: false,
        lastSeen: new Date(),
      });

      render(<NetworkStatus />);

      const statusElement = screen.getByTestId('network-status');
      expect(statusElement).toHaveAttribute(
        'aria-label',
        'Network status: Online'
      );
    });

    it('should have proper ARIA label for offline status', () => {
      mockGetStatus.mockReturnValue({
        isOnline: false,
        isReconnecting: false,
        lastSeen: new Date(),
      });

      render(<NetworkStatus />);

      const statusElement = screen.getByTestId('network-status');
      expect(statusElement).toHaveAttribute(
        'aria-label',
        'Network status: Offline'
      );
    });

    it('should have proper ARIA label for reconnecting status', () => {
      mockGetStatus.mockReturnValue({
        isOnline: false,
        isReconnecting: true,
        lastSeen: new Date(),
      });

      render(<NetworkStatus />);

      const statusElement = screen.getByTestId('network-status');
      expect(statusElement).toHaveAttribute(
        'aria-label',
        'Network status: Reconnecting...'
      );
    });

    it('should be keyboard accessible', () => {
      const mockOnClick = jest.fn();
      mockGetStatus.mockReturnValue({
        isOnline: true,
        isReconnecting: false,
        lastSeen: new Date(),
      });

      render(<NetworkStatus onClick={mockOnClick} />);

      const statusElement = screen.getByTestId('network-status');
      expect(statusElement).toHaveAttribute('tabIndex', '0');

      fireEvent.keyDown(statusElement, { key: 'Enter' });
      expect(mockOnClick).toHaveBeenCalledTimes(1);

      fireEvent.keyDown(statusElement, { key: ' ' });
      expect(mockOnClick).toHaveBeenCalledTimes(2);
    });
  });

  describe('Styling and Visual States', () => {
    it('should apply correct CSS classes for online state', () => {
      mockGetStatus.mockReturnValue({
        isOnline: true,
        isReconnecting: false,
        lastSeen: new Date(),
      });

      render(<NetworkStatus />);

      const statusElement = screen.getByTestId('network-status');
      expect(statusElement).toHaveClass('network-status');
      expect(statusElement).toHaveClass('network-status--online');
      expect(statusElement).not.toHaveClass('network-status--offline');
      expect(statusElement).not.toHaveClass('network-status--reconnecting');
    });

    it('should apply correct CSS classes for offline state', () => {
      mockGetStatus.mockReturnValue({
        isOnline: false,
        isReconnecting: false,
        lastSeen: new Date(),
      });

      render(<NetworkStatus />);

      const statusElement = screen.getByTestId('network-status');
      expect(statusElement).toHaveClass('network-status');
      expect(statusElement).toHaveClass('network-status--offline');
      expect(statusElement).not.toHaveClass('network-status--online');
      expect(statusElement).not.toHaveClass('network-status--reconnecting');
    });

    it('should apply correct CSS classes for reconnecting state', () => {
      mockGetStatus.mockReturnValue({
        isOnline: false,
        isReconnecting: true,
        lastSeen: new Date(),
      });

      render(<NetworkStatus />);

      const statusElement = screen.getByTestId('network-status');
      expect(statusElement).toHaveClass('network-status');
      expect(statusElement).toHaveClass('network-status--reconnecting');
      expect(statusElement).not.toHaveClass('network-status--online');
      expect(statusElement).not.toHaveClass('network-status--offline');
    });

    it('should apply custom className when provided', () => {
      mockGetStatus.mockReturnValue({
        isOnline: true,
        isReconnecting: false,
        lastSeen: new Date(),
      });

      render(<NetworkStatus className='custom-class' />);

      const statusElement = screen.getByTestId('network-status');
      expect(statusElement).toHaveClass('custom-class');
      expect(statusElement).toHaveClass('network-status');
    });
  });

  describe('Edge Cases', () => {
    it('should handle null status gracefully', () => {
      mockGetStatus.mockReturnValue(null);

      render(<NetworkStatus />);

      expect(screen.getByText('Unknown')).toBeInTheDocument();
    });

    it('should handle undefined status gracefully', () => {
      mockGetStatus.mockReturnValue(undefined);

      render(<NetworkStatus />);

      expect(screen.getByText('Unknown')).toBeInTheDocument();
    });

    it('should handle missing isOnline property', () => {
      mockGetStatus.mockReturnValue({
        isReconnecting: false,
        lastSeen: new Date(),
      });

      render(<NetworkStatus />);

      expect(screen.getByText('Unknown')).toBeInTheDocument();
    });

    it('should handle missing isReconnecting property', () => {
      mockGetStatus.mockReturnValue({
        isOnline: false,
        lastSeen: new Date(),
      });

      render(<NetworkStatus />);

      expect(screen.getByText('Offline')).toBeInTheDocument();
    });

    it('should handle null lastSeen', () => {
      mockGetStatus.mockReturnValue({
        isOnline: true,
        isReconnecting: false,
        lastSeen: null,
      });

      render(<NetworkStatus />);

      expect(screen.getByText('Online')).toBeInTheDocument();
    });

    it('should handle undefined lastSeen', () => {
      mockGetStatus.mockReturnValue({
        isOnline: true,
        isReconnecting: false,
        lastSeen: undefined,
      });

      render(<NetworkStatus />);

      expect(screen.getByText('Online')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should not re-render unnecessarily', () => {
      mockGetStatus.mockReturnValue({
        isOnline: true,
        isReconnecting: false,
        lastSeen: new Date(),
      });

      const { rerender } = render(<NetworkStatus />);

      const initialRender = screen.getByTestId('network-status');

      rerender(<NetworkStatus />);

      const reRender = screen.getByTestId('network-status');
      expect(reRender).toBe(initialRender);
    });

    it('should handle rapid status changes efficiently', async () => {
      mockGetStatus.mockReturnValue({
        isOnline: true,
        isReconnecting: false,
        lastSeen: new Date(),
      });

      render(<NetworkStatus />);

      const mockListener = mockAddListener.mock.calls[0][0];

      // Simulate rapid status changes
      for (let i = 0; i < 10; i++) {
        mockListener({
          isOnline: i % 2 === 0,
          isReconnecting: false,
          lastSeen: new Date(),
        });
      }

      await waitFor(() => {
        expect(screen.getByText('Offline')).toBeInTheDocument();
      });
    });
  });
});
