import React, { ReactElement, ReactNode, useState, useEffect } from 'react';
import { render, screen, fireEvent, waitFor } from '../../utils/test-utils';
import { mockAuthState } from '../../utils/test-utils';
import Header from './Header';

describe('Header', () => {
  const defaultState = {
    auth: {
      ...mockAuthState.auth,
      user: { id: 1, email: 'test@example.com', name: 'Test User', isAdmin: true, phone: '+1234567890' },
    },
    language: { currentLanguage: 'he' },
    cart: { items: [] },
  };

  beforeEach(() => {
    // Mock window.matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: query.includes('max-width: 768px'),
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
  });

  it('should render logo and navigation', () => {
    render(<Header />, { preloadedState: defaultState });

    expect(screen.getByText('🍞 סמנה סלטה')).toBeInTheDocument();
    expect(screen.getByText('בית')).toBeInTheDocument();
    expect(screen.getByText('תפריט')).toBeInTheDocument();
  });

  it('should render admin navigation when user is admin', () => {
    render(<Header />, { preloadedState: defaultState });

    expect(screen.getByText('ניהול')).toBeInTheDocument();
    expect(screen.getByText('הזמנות')).toBeInTheDocument();
    expect(screen.getByText('ניתוח')).toBeInTheDocument();
  });

  it('should not render admin navigation when user is not admin', () => {
    const nonAdminState = {
      ...defaultState,
      auth: {
        ...mockAuthState.auth,
        user: { id: 1, email: 'test@example.com', name: 'Test User', isAdmin: false, phone: '+1234567890' },
      },
    };

    render(<Header />, { preloadedState: nonAdminState });

    expect(screen.queryByText('ניהול')).not.toBeInTheDocument();
    expect(screen.queryByText('הזמנות')).not.toBeInTheDocument();
    expect(screen.queryByText('ניתוח')).not.toBeInTheDocument();
  });

  it('should render logout button when user is admin', () => {
    render(<Header />, { preloadedState: defaultState });

    expect(screen.getByText('התנתק')).toBeInTheDocument();
  });

  it('should handle language toggle', async () => {
    render(<Header />, { preloadedState: defaultState });

    const languageToggle = screen.getByText('EN');
    fireEvent.click(languageToggle);

    await waitFor(() => {
      expect(screen.getByText('עב')).toBeInTheDocument();
    });
  });

  it('should render cart button', () => {
    render(<Header />, { preloadedState: defaultState });

    expect(screen.getByText('🛒 עגלה')).toBeInTheDocument();
  });

  it('should show cart badge when items are in cart', () => {
    const stateWithCartItems = {
      ...defaultState,
      cart: {
        items: [
          {
            id: '1',
            name: 'Test',
            price: 10,
            quantity: 2,
            image: '',
            category: '',
          },
        ],
      },
    };

    render(<Header />, { preloadedState: stateWithCartItems });

    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('should handle logout', async () => {
    const { store } = render(<Header />, { preloadedState: defaultState });

    const logoutButton = screen.getByText('התנתק');
    fireEvent.click(logoutButton);

    await waitFor(() => {
      const state = store.getState();
      expect(state.auth.isAuthenticated).toBe(false);
    });
  });

  it('should render mobile menu button', () => {
    render(<Header />, { preloadedState: defaultState });

    expect(screen.getByText('☰')).toBeInTheDocument();
  });

  it('should toggle mobile menu when button is clicked', () => {
    render(<Header />, { preloadedState: defaultState });

    const menuButton = screen.getByText('☰');
    fireEvent.click(menuButton);

    expect(screen.getByText('✕')).toBeInTheDocument();
  });

  it('should close mobile menu when route changes', async () => {
    render(<Header />, { preloadedState: defaultState });

    const menuButton = screen.getByText('☰');
    fireEvent.click(menuButton);

    // Navigate to a different route
    const homeLinks = screen.getAllByText('בית');
    const homeLink = homeLinks[0]; // Get the first occurrence

    if (homeLink) {
      fireEvent.click(homeLink);
    }

    await waitFor(() => {
      expect(screen.getByText('☰')).toBeInTheDocument();
    });
  });

  it('should handle escape key to close mobile menu', () => {
    render(<Header />, { preloadedState: defaultState });

    const menuButton = screen.getByText('☰');
    fireEvent.click(menuButton);

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(screen.getByText('☰')).toBeInTheDocument();
  });

  it('should render navigation links with correct active state', () => {
    render(<Header />, { preloadedState: defaultState, route: '/menu' });

    const menuLink = screen.getByText('תפריט');
    expect(menuLink).toHaveAttribute('aria-current', 'page');
  });

  it('should render skip link for accessibility', () => {
    render(<Header />, { preloadedState: defaultState });

    expect(screen.getByText('דלג לתוכן הראשי')).toBeInTheDocument();
  });

  it('should render proper ARIA labels', () => {
    render(<Header />, { preloadedState: defaultState });

    expect(screen.getByLabelText('סמנה סלטה - דף הבית')).toBeInTheDocument();
    expect(screen.getByLabelText('עגלת קניות')).toBeInTheDocument();
    expect(screen.getByLabelText('תפריט ניווט')).toBeInTheDocument();
  });
});
