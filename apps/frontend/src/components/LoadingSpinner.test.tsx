import { render, screen } from '../utils/test-utils';
import LoadingSpinner from './LoadingSpinner';

describe('LoadingSpinner', () => {
  it('should render with default props', () => {
    render(<LoadingSpinner />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('should render with custom text', () => {
    render(<LoadingSpinner text="Please wait..." />);
    
    expect(screen.getByText('Please wait...')).toBeInTheDocument();
  });



  it('should have proper accessibility attributes', () => {
    render(<LoadingSpinner />);
    
    const container = screen.getByRole('status');
    expect(container).toHaveAttribute('aria-live', 'polite');
  });

  it('should have hidden spinner for screen readers', () => {
    render(<LoadingSpinner />);
    
    const spinner = screen.getByRole('presentation');
    expect(spinner).toHaveAttribute('aria-hidden', 'true');
  });

  it('should render with different text', () => {
    render(
      <LoadingSpinner 
        text="Loading products..." 
      />
    );
    
    expect(screen.getByText('Loading products...')).toBeInTheDocument();
  });

  it('should be memoized', () => {
    const { rerender } = render(<LoadingSpinner />);
    
    // Re-render with same props
    rerender(<LoadingSpinner />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should handle empty text', () => {
    render(<LoadingSpinner text="" />);
    
    const container = screen.getByRole('status');
    expect(container).toBeInTheDocument();
  });



  it('should render with long text', () => {
    const longText = 'This is a very long loading message that should still render properly';
    render(<LoadingSpinner text={longText} />);
    
    expect(screen.getByText(longText)).toBeInTheDocument();
  });

  it('should render with special characters', () => {
    const specialText = 'Loading... 🍞 סמנה סלטה';
    render(<LoadingSpinner text={specialText} />);
    
    expect(screen.getByText(specialText)).toBeInTheDocument();
  });
}); 