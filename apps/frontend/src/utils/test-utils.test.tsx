import { testSetup, createTestStore } from './test-utils';

describe('Test Utils', () => {
  it('should create a test store', () => {
    const { store } = testSetup();
    expect(store).toBeDefined();
    expect(store.getState()).toBeDefined();
  });

  it('should have initial state', () => {
    const { store } = createTestStore();
    const state = store.getState();
    
    expect(state.auth).toBeDefined();
    expect(state.language).toBeDefined();
    expect(state.cart).toBeDefined();
    expect(state.products).toBeDefined();
  });

  it('should have correct initial language state', () => {
    const { store } = createTestStore();
    const state = store.getState();
    
    expect(state.language.currentLanguage).toBe('he');
  });

  it('should have correct initial auth state', () => {
    const { store } = createTestStore();
    const state = store.getState();
    
    expect(state.auth.isAuthenticated).toBe(false);
    expect(state.auth.user).toBe(null);
  });
}); 