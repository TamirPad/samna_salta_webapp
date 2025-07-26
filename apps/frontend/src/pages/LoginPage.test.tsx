import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import LoginPage from './LoginPage';

// Mock react-router-dom
const mockNavigate = jest.fn();
const mockLocation = {
  pathname: '/login',
  search: '',
  hash: '',
  state: null,
};

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => mockLocation,
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('LoginPage', () => {
  let store: any;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        auth: authReducer,
      },
    });
    
    jest.clearAllMocks();
    localStorageMock.setItem.mockClear();
    mockNavigate.mockClear();
  });

  const renderLoginPage = () => {
    return render(
      <Provider store={store}>
        <LoginPage />
      </Provider>
    );
  };

  describe('Rendering', () => {
    it('should render login form', () => {
      renderLoginPage();
      
      expect(screen.getByText('Samna Salta Admin')).toBeInTheDocument();
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
    });

    it('should render demo credentials section', () => {
      renderLoginPage();
      
      expect(screen.getByText('Demo Credentials:')).toBeInTheDocument();
      expect(screen.getByText('Email: admin@example.com')).toBeInTheDocument();
      expect(screen.getByText('Password: admin123')).toBeInTheDocument();
    });

    it('should render demo login button', () => {
      renderLoginPage();
      
      expect(screen.getByRole('button', { name: 'Use Demo Credentials' })).toBeInTheDocument();
    });

    it('should have proper form structure', () => {
      renderLoginPage();
      
      const form = screen.getByRole('form');
      expect(form).toBeInTheDocument();
      
      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Password');
      
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(emailInput).toHaveAttribute('required');
      expect(passwordInput).toHaveAttribute('required');
    });
  });

  describe('Form interactions', () => {
    it('should update email input value', () => {
      renderLoginPage();
      
      const emailInput = screen.getByLabelText('Email');
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      
      expect(emailInput).toHaveValue('test@example.com');
    });

    it('should update password input value', () => {
      renderLoginPage();
      
      const passwordInput = screen.getByLabelText('Password');
      fireEvent.change(passwordInput, { target: { value: 'testpassword' } });
      
      expect(passwordInput).toHaveValue('testpassword');
    });

    it('should handle demo login button click', () => {
      renderLoginPage();
      
      const demoButton = screen.getByRole('button', { name: 'Use Demo Credentials' });
      fireEvent.click(demoButton);
      
      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Password');
      
      expect(emailInput).toHaveValue('admin@example.com');
      expect(passwordInput).toHaveValue('admin123');
    });
  });

  describe('Form submission', () => {
    it('should show loading state during submission', async () => {
      renderLoginPage();
      
      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: 'Login' });
      
      fireEvent.change(emailInput, { target: { value: 'admin@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'admin123' } });
      fireEvent.click(submitButton);
      
      expect(submitButton).toBeDisabled();
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should handle successful login with correct credentials', async () => {
      renderLoginPage();
      
      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: 'Login' });
      
      fireEvent.change(emailInput, { target: { value: 'admin@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'admin123' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'demo-token-123');
      });
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith('user', expect.any(String));
      expect(mockNavigate).toHaveBeenCalledWith('/admin', { replace: true });
    });

    it('should handle failed login with incorrect credentials', async () => {
      renderLoginPage();
      
      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: 'Login' });
      
      fireEvent.change(emailInput, { target: { value: 'wrong@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Invalid email or password')).toBeInTheDocument();
      });
      
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should handle empty form submission', async () => {
      renderLoginPage();
      
      const submitButton = screen.getByRole('button', { name: 'Login' });
      fireEvent.click(submitButton);
      
      // Form validation should prevent submission
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should handle form submission with only email', async () => {
      renderLoginPage();
      
      const emailInput = screen.getByLabelText('Email');
      const submitButton = screen.getByRole('button', { name: 'Login' });
      
      fireEvent.change(emailInput, { target: { value: 'admin@example.com' } });
      fireEvent.click(submitButton);
      
      // Form validation should prevent submission
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('Error handling', () => {
    it('should display error message for invalid credentials', async () => {
      renderLoginPage();
      
      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: 'Login' });
      
      fireEvent.change(emailInput, { target: { value: 'wrong@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Invalid email or password')).toBeInTheDocument();
      });
    });

    it('should clear error message on new submission', async () => {
      renderLoginPage();
      
      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: 'Login' });
      
      // First submission with wrong credentials
      fireEvent.change(emailInput, { target: { value: 'wrong@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Invalid email or password')).toBeInTheDocument();
      });
      
      // Second submission with correct credentials
      fireEvent.change(emailInput, { target: { value: 'admin@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'admin123' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.queryByText('Invalid email or password')).not.toBeInTheDocument();
      });
    });
  });

  describe('Redux integration', () => {
    it('should dispatch login actions on successful login', async () => {
      renderLoginPage();
      
      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: 'Login' });
      
      fireEvent.change(emailInput, { target: { value: 'admin@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'admin123' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        const state = store.getState();
        expect(state.auth.isAuthenticated).toBe(true);
      });
      
      const state = store.getState();
      expect(state.auth.user).toEqual({
        id: '1',
        name: 'Admin User',
        email: 'admin@example.com',
        phone: '+972-50-123-4567',
        isAdmin: true,
      });
    });

    it('should dispatch error action on failed login', async () => {
      renderLoginPage();
      
      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: 'Login' });
      
      fireEvent.change(emailInput, { target: { value: 'wrong@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        const state = store.getState();
        expect(state.auth.isAuthenticated).toBe(false);
      });
      
      const state = store.getState();
      expect(state.auth.error).toBe('Invalid email or password');
    });
  });

  describe('Navigation', () => {
    it('should navigate to admin dashboard on successful login', async () => {
      renderLoginPage();
      
      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: 'Login' });
      
      fireEvent.change(emailInput, { target: { value: 'admin@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'admin123' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/admin', { replace: true });
      });
    });

    it('should navigate to intended destination if provided', async () => {
      // Mock location with intended destination
      const mockLocationWithState = {
        ...mockLocation,
        state: { from: { pathname: '/admin/products' } },
      };
      
      jest.doMock('react-router-dom', () => ({
        ...jest.requireActual('react-router-dom'),
        useNavigate: () => mockNavigate,
        useLocation: () => mockLocationWithState,
      }));
      
      renderLoginPage();
      
      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: 'Login' });
      
      fireEvent.change(emailInput, { target: { value: 'admin@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'admin123' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/admin/products', { replace: true });
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper form labels', () => {
      renderLoginPage();
      
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
    });

    it('should have proper button types', () => {
      renderLoginPage();
      
      const submitButton = screen.getByRole('button', { name: 'Login' });
      const demoButton = screen.getByRole('button', { name: 'Use Demo Credentials' });
      
      expect(submitButton).toHaveAttribute('type', 'submit');
      expect(demoButton).toHaveAttribute('type', 'button');
    });

    it('should have proper input types', () => {
      renderLoginPage();
      
      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Password');
      
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(passwordInput).toHaveAttribute('type', 'password');
    });
  });
}); 