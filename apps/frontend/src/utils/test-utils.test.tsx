import { createMockStore } from './test-utils';

describe('Test Utils', () => {
  it('should create a test store', () => {
    const store = createMockStore();
    expect(store).toBeDefined();
    expect(store.getState).toBeDefined();
    expect(store.dispatch).toBeDefined();
  });

  it('should have initial state', () => {
    const store = createMockStore();
    const state = store.getState();

    expect(state.auth).toBeDefined();
    expect(state.cart).toBeDefined();
    expect(state.products).toBeDefined();
    expect(state.orders).toBeDefined();
    expect(state.customers).toBeDefined();
    expect(state.analytics).toBeDefined();
    expect(state.language).toBeDefined();
    expect(state.ui).toBeDefined();
  });

  it('should have correct initial language state', () => {
    const store = createMockStore();
    const state = store.getState();

    expect(state.language.currentLanguage).toBe('he');
  });

  it('should have correct initial auth state', () => {
    const store = createMockStore();
    const state = store.getState();

    expect(state.auth.isAuthenticated).toBe(false);
    expect(state.auth.user).toBeNull();
    expect(state.auth.isLoading).toBe(false);
    expect(state.auth.error).toBeNull();
  });
});
