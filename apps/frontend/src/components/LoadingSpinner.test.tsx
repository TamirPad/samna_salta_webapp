import React, { ReactElement, ReactNode, useState, useEffect } from 'react';
import { render, screen } from '../utils/test-utils';
import LoadingSpinner from './LoadingSpinner';

describe('LoadingSpinner', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Default Rendering', () => {
    it('should render with default props', () => {
      render(<LoadingSpinner />);

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should have correct default styling classes', () => {
      render(<LoadingSpinner />);

      const spinner = screen.getByTestId('loading-spinner');
      expect(spinner).toHaveClass('loading-spinner');
      expect(spinner).toHaveClass('loading-spinner--default');
    });
  });

  describe('Size Variants', () => {
    it('should render small size correctly', () => {
      render(<LoadingSpinner size='small' />);

      const spinner = screen.getByTestId('loading-spinner');
      expect(spinner).toHaveClass('loading-spinner--small');
      expect(spinner).not.toHaveClass('loading-spinner--large');
    });

    it('should render large size correctly', () => {
      render(<LoadingSpinner size='large' />);

      const spinner = screen.getByTestId('loading-spinner');
      expect(spinner).toHaveClass('loading-spinner--large');
      expect(spinner).not.toHaveClass('loading-spinner--small');
    });

    it('should render default size when no size prop provided', () => {
      render(<LoadingSpinner />);

      const spinner = screen.getByTestId('loading-spinner');
      expect(spinner).toHaveClass('loading-spinner--default');
    });

    it('should handle invalid size prop gracefully', () => {
      render(<LoadingSpinner size={'invalid' as any} />);

      const spinner = screen.getByTestId('loading-spinner');
      expect(spinner).toHaveClass('loading-spinner--default');
    });
  });

  describe('Text Customization', () => {
    it('should render custom loading text', () => {
      render(<LoadingSpinner text='Please wait...' />);

      expect(screen.getByText('Please wait...')).toBeInTheDocument();
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    it('should render empty text when text prop is empty string', () => {
      render(<LoadingSpinner text='' />);

      const textElement = screen.getByText('');
      expect(textElement).toBeInTheDocument();
    });

    it('should render default text when text prop is not provided', () => {
      render(<LoadingSpinner />);

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should handle long text content', () => {
      const longText =
        'This is a very long loading text that should be handled properly by the component';
      render(<LoadingSpinner text={longText} />);

      expect(screen.getByText(longText)).toBeInTheDocument();
    });

    it('should handle special characters in text', () => {
      const specialText = 'Loading... 🚀 ⚡ 🔄';
      render(<LoadingSpinner text={specialText} />);

      expect(screen.getByText(specialText)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<LoadingSpinner />);

      const spinner = screen.getByTestId('loading-spinner');
      expect(spinner).toHaveAttribute('role', 'status');
      expect(spinner).toHaveAttribute('aria-live', 'polite');
    });

    it('should have proper ARIA label', () => {
      render(<LoadingSpinner text='Custom loading text' />);

      const spinner = screen.getByTestId('loading-spinner');
      expect(spinner).toHaveAttribute('aria-label', 'Custom loading text');
    });

    it('should have default ARIA label when no text provided', () => {
      render(<LoadingSpinner />);

      const spinner = screen.getByTestId('loading-spinner');
      expect(spinner).toHaveAttribute('aria-label', 'Loading...');
    });

    it('should be focusable for keyboard navigation', () => {
      render(<LoadingSpinner />);

      const spinner = screen.getByTestId('loading-spinner');
      expect(spinner).toHaveAttribute('tabIndex', '0');
    });
  });

  describe('Styling and Animation', () => {
    it('should have animation classes', () => {
      render(<LoadingSpinner />);

      const spinner = screen.getByTestId('loading-spinner');
      expect(spinner).toHaveClass('loading-spinner__animation');
    });

    it('should have proper container structure', () => {
      render(<LoadingSpinner />);

      const container = screen.getByTestId('loading-spinner');
      const text = screen.getByText('Loading...');

      expect(container).toContainElement(text);
    });

    it('should apply custom className when provided', () => {
      render(<LoadingSpinner className='custom-class' />);

      const spinner = screen.getByTestId('loading-spinner');
      expect(spinner).toHaveClass('custom-class');
      expect(spinner).toHaveClass('loading-spinner');
    });

    it('should handle multiple custom classes', () => {
      render(<LoadingSpinner className='class1 class2 class3' />);

      const spinner = screen.getByTestId('loading-spinner');
      expect(spinner).toHaveClass('class1');
      expect(spinner).toHaveClass('class2');
      expect(spinner).toHaveClass('class3');
    });
  });

  describe('Edge Cases', () => {
    it('should handle null text prop', () => {
      render(<LoadingSpinner text={null as any} />);

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should handle undefined text prop', () => {
      render(<LoadingSpinner text={undefined as any} />);

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should handle null size prop', () => {
      render(<LoadingSpinner size={null as any} />);

      const spinner = screen.getByTestId('loading-spinner');
      expect(spinner).toHaveClass('loading-spinner--default');
    });

    it('should handle undefined size prop', () => {
      render(<LoadingSpinner size={undefined as any} />);

      const spinner = screen.getByTestId('loading-spinner');
      expect(spinner).toHaveClass('loading-spinner--default');
    });

    it('should handle null className prop', () => {
      render(<LoadingSpinner className={null as any} />);

      const spinner = screen.getByTestId('loading-spinner');
      expect(spinner).toHaveClass('loading-spinner');
      expect(spinner).toHaveClass('loading-spinner--default');
    });

    it('should handle undefined className prop', () => {
      render(<LoadingSpinner className={undefined as any} />);

      const spinner = screen.getByTestId('loading-spinner');
      expect(spinner).toHaveClass('loading-spinner');
      expect(spinner).toHaveClass('loading-spinner--default');
    });
  });

  describe('Integration Tests', () => {
    it('should work within a form context', () => {
      render(
        <form>
          <LoadingSpinner text='Submitting form...' />
          <button type='submit'>Submit</button>
        </form>
      );

      expect(screen.getByText('Submitting form...')).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should work within a modal context', () => {
      render(
        <div role='dialog' aria-modal='true'>
          <LoadingSpinner text='Processing...' />
        </div>
      );

      expect(screen.getByText('Processing...')).toBeInTheDocument();
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should work with multiple instances', () => {
      render(
        <div>
          <LoadingSpinner text='Loading data...' />
          <LoadingSpinner text='Processing...' size='small' />
          <LoadingSpinner text='Saving...' size='large' />
        </div>
      );

      expect(screen.getByText('Loading data...')).toBeInTheDocument();
      expect(screen.getByText('Processing...')).toBeInTheDocument();
      expect(screen.getByText('Saving...')).toBeInTheDocument();

      const spinners = screen.getAllByTestId('loading-spinner');
      expect(spinners).toHaveLength(3);
    });
  });

  describe('Performance', () => {
    it('should render quickly without performance issues', () => {
      const startTime = performance.now();

      render(<LoadingSpinner />);

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      expect(renderTime).toBeLessThan(100); // Should render in less than 100ms
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('should handle rapid re-renders', () => {
      const { rerender } = render(<LoadingSpinner text='Initial' />);

      expect(screen.getByText('Initial')).toBeInTheDocument();

      rerender(<LoadingSpinner text='Updated' />);
      expect(screen.getByText('Updated')).toBeInTheDocument();

      rerender(<LoadingSpinner text='Final' size='large' />);
      expect(screen.getByText('Final')).toBeInTheDocument();
    });
  });
});
