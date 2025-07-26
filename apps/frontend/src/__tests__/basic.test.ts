import { render, screen } from '../utils/test-utils';

describe('Basic Test Setup', () => {
  it('should have working test utilities', () => {
    expect(render).toBeDefined();
    expect(screen).toBeDefined();
  });

  it('should have working jest-dom matchers', () => {
    const element = document.createElement('div');
    element.textContent = 'Test Content';
    document.body.appendChild(element);
    
    expect(element).toBeInTheDocument();
    expect(element).toHaveTextContent('Test Content');
    
    document.body.removeChild(element);
  });

  it('should have working Redux store', () => {
    const { store } = require('../utils/test-utils').testSetup();
    expect(store).toBeDefined();
    expect(store.getState).toBeDefined();
    expect(typeof store.getState()).toBe('object');
  });
}); 