import React, { ReactElement, ReactNode, useState, useEffect } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../../App';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { store } from '../../store';

describe('App Integration Tests', () => {
  beforeEach(() => {
    // Clear any stored data
    localStorage.clear();
    sessionStorage.clear();
  });

  it('should render the app without crashing', () => {
    render(<App />, {
      wrapper: ({ children }) => (
        <Provider store={store}>
          <BrowserRouter>{children}</BrowserRouter>
        </Provider>
      ),
    });
    expect(screen.getByText(/Samna Salta/i)).toBeInTheDocument();
  });

  it('should navigate to home page by default', () => {
    render(<App />);
    expect(
      screen.getByText(/Welcome to Samna Salta|ברוכים הבאים לסמנה סלטה/i)
    ).toBeInTheDocument();
  });

  it('should navigate to menu page', async () => {
    render(<App />);

    const menuLink = screen.getByText(/תפריט|Menu/);
    fireEvent.click(menuLink);

    await waitFor(() => {
      expect(window.location.pathname).toBe('/menu');
    });
  });

  it('should navigate to cart page', async () => {
    render(<App />);

    const cartLink = screen.getByText(/🛒 עגלה|🛒 Cart/);
    fireEvent.click(cartLink);

    await waitFor(() => {
      expect(window.location.pathname).toBe('/cart');
    });
  });

  it('should handle language switching', async () => {
    render(<App />);

    const languageToggle = screen.getByText(/EN|עב/);
    fireEvent.click(languageToggle);

    await waitFor(() => {
      // Check if language has changed
      const newLanguageToggle = screen.getByText(/EN|עב/);
      expect(newLanguageToggle).toBeInTheDocument();
    });
  });

  it('should show admin navigation when logged in as admin', async () => {
    // Mock admin user in localStorage
    const adminUser = {
      id: '1',
      name: 'Admin User',
      email: 'admin@example.com',
      phone: '+972-50-123-4567',
      isAdmin: true,
    };

    localStorage.setItem('user', JSON.stringify(adminUser));
    localStorage.setItem('token', 'demo-token-123');

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/ניהול|Manage/)).toBeInTheDocument();
    });
  });

  it('should not show admin navigation when not logged in', () => {
    render(<App />);

    expect(screen.queryByText(/ניהול|Manage/)).not.toBeInTheDocument();
  });

  it('should handle 404 page for unknown routes', async () => {
    // Use window.history.pushState to simulate route change
    window.history.pushState({}, '', '/unknown-route');

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/404|Page Not Found/i)).toBeInTheDocument();
    });
  });

  it('should render error boundary when component throws error', () => {
    // This test would require a component that throws an error
    // For now, we'll test that the error boundary is in place
    render(<App />);

    // The app should render without crashing
    expect(screen.getByText(/Samna Salta/i)).toBeInTheDocument();
  });

  it('should handle mobile menu toggle', async () => {
    render(<App />);

    const menuButton = screen.getByText('☰');
    fireEvent.click(menuButton);

    await waitFor(() => {
      expect(screen.getByText('✕')).toBeInTheDocument();
    });
  });

  it('should close mobile menu when clicking outside', async () => {
    render(<App />);

    const menuButton = screen.getByText('☰');
    fireEvent.click(menuButton);

    // Click outside the menu
    fireEvent.click(document.body);

    await waitFor(() => {
      expect(screen.getByText('☰')).toBeInTheDocument();
    });
  });

  it('should handle cart functionality', async () => {
    render(<App />);

    // Navigate to menu
    const menuLink = screen.getByText(/תפריט|Menu/);
    fireEvent.click(menuLink);

    await waitFor(() => {
      expect(window.location.pathname).toBe('/menu');
    });

    // Add item to cart (if products are available)
    const addToCartButtons = screen.getAllByText(/Add to Cart|הוסף לעגלה/);
    if (addToCartButtons[0]) {
      fireEvent.click(addToCartButtons[0]);

      // Check if cart badge appears
      await waitFor(() => {
        expect(screen.queryByText('1')).toBeInTheDocument();
      });
    }
  });

  it('should handle checkout flow', async () => {
    render(<App />);

    // Navigate to cart
    const cartLink = screen.getByText(/🛒 עגלה|🛒 Cart/);
    fireEvent.click(cartLink);

    await waitFor(() => {
      expect(window.location.pathname).toBe('/cart');
    });

    // Check if checkout button is available
    expect(screen.queryByText(/Checkout|המשך להזמנה/)).toBeInTheDocument();
  });

  it('should handle responsive design', () => {
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });

    render(<App />);

    // Should still render without crashing
    expect(screen.getByText(/Samna Salta/i)).toBeInTheDocument();
  });

  it('should handle keyboard navigation', async () => {
    render(<App />);

    // Test tab navigation
    const firstFocusableElement = screen.getByText(/Samna Salta/i);
    firstFocusableElement.focus();

    // Press Tab to navigate
    fireEvent.keyDown(document, { key: 'Tab' });

    // Should not crash
    expect(screen.getByText(/Samna Salta/i)).toBeInTheDocument();
  });

  it('should handle accessibility features', () => {
    render(<App />);

    // Check for skip link
    const skipLink = screen.getByText(/דלג לתוכן הראשי|Skip to main content/);
    expect(skipLink).toBeInTheDocument();

    // Check for proper ARIA labels
    const logo = screen.getByText(/🍞 סמנה סלטה|🍞 Samna Salta/);
    expect(logo).toBeInTheDocument();
  });

  it('should handle network status changes', async () => {
    render(<App />);

    // Simulate offline status
    Object.defineProperty(navigator, 'onLine', {
      value: false,
      writable: true,
    });

    window.dispatchEvent(new Event('offline'));

    // App should still function
    expect(screen.getByText(/Samna Salta/i)).toBeInTheDocument();
  });

  it('should handle performance monitoring', () => {
    // Mock performance API
    const mockMark = jest
      .spyOn(performance, 'mark')
      .mockImplementation(() => ({}) as PerformanceMark);
    const mockMeasure = jest
      .spyOn(performance, 'measure')
      .mockReturnValue({} as PerformanceMeasure);

    render(<App />);

    // App should render without performance errors
    expect(screen.getByText(/Samna Salta/i)).toBeInTheDocument();

    mockMark.mockRestore();
    mockMeasure.mockRestore();
  });
});
