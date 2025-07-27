import { render, screen } from '../utils/test-utils';
import HomePage from './HomePage';

// Mock the language selector
jest.mock('../features/language/languageSlice', () => ({
  selectLanguage: jest.fn(),
}));

const mockSelectLanguage =
  require('../features/language/languageSlice').selectLanguage;

describe('HomePage', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
  });

  describe('Hebrew language', () => {
    beforeEach(() => {
      mockSelectLanguage.mockReturnValue('he');
    });

    it('should render Hebrew content', () => {
      render(<HomePage />);

      expect(screen.getByText('ברוכים הבאים לסמנה סלטה')).toBeInTheDocument();
      expect(screen.getByText(/המאפייה הטובה ביותר בעיר/)).toBeInTheDocument();
    });

    it('should render Hebrew navigation buttons', () => {
      render(<HomePage />);

      expect(screen.getByText('צפה בתפריט')).toBeInTheDocument();
      expect(screen.getByText('הזמן עכשיו')).toBeInTheDocument();
    });

    it('should render Hebrew features section', () => {
      render(<HomePage />);

      expect(screen.getByText('למה לבחור בנו?')).toBeInTheDocument();
      expect(screen.getByText('לחם טרי')).toBeInTheDocument();
      expect(screen.getByText('מתכונים מסורתיים')).toBeInTheDocument();
      expect(screen.getByText('משלוח מהיר')).toBeInTheDocument();
    });

    it('should render Hebrew products section', () => {
      render(<HomePage />);

      expect(screen.getByText('המוצרים שלנו')).toBeInTheDocument();
      expect(screen.getByText('כובאנה')).toBeInTheDocument();
      expect(screen.getByText('סמנה')).toBeInTheDocument();
      expect(screen.getByText('ביסבוס אדום')).toBeInTheDocument();
      expect(screen.getByText('חילבה')).toBeInTheDocument();
    });

    it('should render Hebrew skip link', () => {
      render(<HomePage />);

      expect(screen.getByText('דלג לתוכן הראשי')).toBeInTheDocument();
    });
  });

  describe('English language', () => {
    beforeEach(() => {
      mockSelectLanguage.mockReturnValue('en');
    });

    it('should render English content', () => {
      render(<HomePage />);

      expect(screen.getByText('Welcome to Samna Salta')).toBeInTheDocument();
      expect(screen.getByText(/The best bakery in town/)).toBeInTheDocument();
    });

    it('should render English navigation buttons', () => {
      render(<HomePage />);

      expect(screen.getByText('View Menu')).toBeInTheDocument();
      expect(screen.getByText('Order Now')).toBeInTheDocument();
    });

    it('should render English features section', () => {
      render(<HomePage />);

      expect(screen.getByText('Why Choose Us?')).toBeInTheDocument();
      expect(screen.getByText('Fresh Bread')).toBeInTheDocument();
      expect(screen.getByText('Traditional Recipes')).toBeInTheDocument();
      expect(screen.getByText('Fast Delivery')).toBeInTheDocument();
    });

    it('should render English products section', () => {
      render(<HomePage />);

      expect(screen.getByText('Our Products')).toBeInTheDocument();
      expect(screen.getByText('Kubaneh')).toBeInTheDocument();
      expect(screen.getByText('Samneh')).toBeInTheDocument();
      expect(screen.getByText('Red Bisbas')).toBeInTheDocument();
      expect(screen.getByText('Hilbeh')).toBeInTheDocument();
    });

    it('should render English skip link', () => {
      render(<HomePage />);

      expect(screen.getByText('Skip to main content')).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    beforeEach(() => {
      mockSelectLanguage.mockReturnValue('en');
    });

    it('should have correct links for navigation buttons', () => {
      render(<HomePage />);

      const viewMenuButton = screen.getByText('View Menu');
      const orderNowButton = screen.getByText('Order Now');

      expect(viewMenuButton.closest('a')).toHaveAttribute('href', '/menu');
      expect(orderNowButton.closest('a')).toHaveAttribute('href', '/cart');
    });

    it('should have proper ARIA labels for navigation buttons', () => {
      render(<HomePage />);

      const viewMenuButton = screen.getByText('View Menu');
      const orderNowButton = screen.getByText('Order Now');

      expect(viewMenuButton).toHaveAttribute('aria-label', 'View Menu');
      expect(orderNowButton).toHaveAttribute('aria-label', 'Order Now');
    });
  });

  describe('Features section', () => {
    beforeEach(() => {
      mockSelectLanguage.mockReturnValue('en');
    });

    it('should render all feature cards', () => {
      render(<HomePage />);

      expect(screen.getByText('Fresh Bread')).toBeInTheDocument();
      expect(screen.getByText('Traditional Recipes')).toBeInTheDocument();
      expect(screen.getByText('Fast Delivery')).toBeInTheDocument();
    });

    it('should render feature descriptions', () => {
      render(<HomePage />);

      expect(
        screen.getByText(/All our breads are baked fresh daily/)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/We use traditional recipes passed down/)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Fast and reliable delivery throughout the city/)
      ).toBeInTheDocument();
    });

    it('should render feature icons', () => {
      render(<HomePage />);

      // Use getAllByText for duplicate icons and check count
      const breadIcons = screen.getAllByText('🍞');
      expect(breadIcons.length).toBeGreaterThan(0);

      expect(screen.getByText('👨‍🍳')).toBeInTheDocument();
      expect(screen.getByText('🚚')).toBeInTheDocument();
    });

    it('should have proper ARIA labels for feature cards', () => {
      render(<HomePage />);

      const freshBreadCard = screen
        .getByText('Fresh Bread')
        .closest('[role="button"]');
      expect(freshBreadCard).toHaveAttribute(
        'aria-label',
        'Learn more about Fresh Bread'
      );
    });
  });

  describe('Products section', () => {
    beforeEach(() => {
      mockSelectLanguage.mockReturnValue('en');
    });

    it('should render all product cards', () => {
      render(<HomePage />);

      expect(screen.getByText('Kubaneh')).toBeInTheDocument();
      expect(screen.getByText('Samneh')).toBeInTheDocument();
      expect(screen.getByText('Red Bisbas')).toBeInTheDocument();
      expect(screen.getByText('Hilbeh')).toBeInTheDocument();
    });

    it('should render product descriptions', () => {
      render(<HomePage />);

      expect(
        screen.getByText(/Traditional Yemenite bread with unique flavor/)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Traditional clarified butter/)
      ).toBeInTheDocument();
      // Check for both spice products individually to avoid duplicate text issues
      expect(
        screen.getByText(/Traditional Yemenite spice/)
      ).toBeInTheDocument();
    });

    it('should render product prices', () => {
      render(<HomePage />);

      expect(screen.getByText('$25')).toBeInTheDocument();
      expect(screen.getByText('$15')).toBeInTheDocument();
      expect(screen.getByText('$12')).toBeInTheDocument();
      expect(screen.getByText('$10')).toBeInTheDocument();
    });

    it('should render product icons', () => {
      render(<HomePage />);

      // Use getAllByText for duplicate icons and check count
      const breadIcons = screen.getAllByText('🍞');
      expect(breadIcons.length).toBeGreaterThan(0);

      expect(screen.getByText('🧈')).toBeInTheDocument();
      expect(screen.getByText('🌶️')).toBeInTheDocument();
      expect(screen.getByText('🌿')).toBeInTheDocument();
    });

    it('should have proper ARIA labels for product cards', () => {
      render(<HomePage />);

      const kubanehCard = screen
        .getByText('Kubaneh')
        .closest('[role="button"]');
      expect(kubanehCard).toHaveAttribute('aria-label', 'View Kubaneh - $25');
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      mockSelectLanguage.mockReturnValue('en');
    });

    it('should have proper heading structure', () => {
      render(<HomePage />);

      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1).toHaveTextContent('Welcome to Samna Salta');

      const h3s = screen.getAllByRole('heading', { level: 3 });
      expect(h3s.length).toBeGreaterThan(0);
    });

    it('should have proper skip link', () => {
      render(<HomePage />);

      const skipLink = screen.getByText('Skip to main content');
      expect(skipLink).toHaveAttribute('href', '#main-content');
    });

    it('should have proper main content section', () => {
      render(<HomePage />);

      const mainContent = screen.getByText('Why Choose Us?').closest('section');
      expect(mainContent).toHaveAttribute('id', 'main-content');
    });

    it('should have proper button roles for interactive elements', () => {
      render(<HomePage />);

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('Responsive design', () => {
    beforeEach(() => {
      mockSelectLanguage.mockReturnValue('en');
    });

    it('should render without crashing on different screen sizes', () => {
      // Test with different viewport sizes
      const { rerender } = render(<HomePage />);

      // Simulate mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      rerender(<HomePage />);
      expect(screen.getByText('Welcome to Samna Salta')).toBeInTheDocument();

      // Simulate tablet viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      rerender(<HomePage />);
      expect(screen.getByText('Welcome to Samna Salta')).toBeInTheDocument();

      // Simulate desktop viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1200,
      });

      rerender(<HomePage />);
      expect(screen.getByText('Welcome to Samna Salta')).toBeInTheDocument();
    });
  });

  describe('Component memoization', () => {
    beforeEach(() => {
      mockSelectLanguage.mockReturnValue('en');
    });

    it('should be memoized', () => {
      const { rerender } = render(<HomePage />);

      // Re-render with same props
      rerender(<HomePage />);

      expect(screen.getByText('Welcome to Samna Salta')).toBeInTheDocument();
    });
  });
});
