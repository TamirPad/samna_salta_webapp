// Route utilities for handling refresh issues and navigation

export interface RouteState {
  pathname: string;
  search: string;
  hash: string;
  timestamp: number;
}

// Save current route to session storage
export const saveRouteState = (
  pathname: string,
  search = '',
  hash = ''
): void => {
  try {
    const routeState: RouteState = {
      pathname,
      search,
      hash,
      timestamp: Date.now(),
    };
    sessionStorage.setItem('samna-salta-route', JSON.stringify(routeState));
  } catch (error) {
    console.warn('Failed to save route state:', error);
  }
};

// Get saved route state
export const getRouteState = (): RouteState | null => {
  try {
    const saved = sessionStorage.getItem('samna-salta-route');
    if (saved) {
      const routeState: RouteState = JSON.parse(saved);
      // Only use saved route if it's less than 30 minutes old
      if (Date.now() - routeState.timestamp < 30 * 60 * 1000) {
        return routeState;
      }
    }
  } catch (error) {
    console.warn('Failed to get route state:', error);
  }
  return null;
};

// Clear saved route state
export const clearRouteState = (): void => {
  try {
    sessionStorage.removeItem('samna-salta-route');
  } catch (error) {
    console.warn('Failed to clear route state:', error);
  }
};

// Check if current route is valid
export const isValidRoute = (pathname: string): boolean => {
  const validRoutes = [
    '/',
    '/home',
    '/menu',
    '/cart',
    '/checkout',
    '/login',
    '/admin',
    '/admin/orders',
    '/admin/products',
    '/admin/customers',
    '/admin/analytics',
  ];

  // Check exact matches
  if (validRoutes.includes(pathname)) {
    return true;
  }

  // Check dynamic routes
  if (pathname.startsWith('/order/')) {
    return true;
  }

  return false;
};

// Handle page refresh
export const handlePageRefresh = (): void => {
  // Clear any stale data that might cause issues
  try {
    // Clear non-essential session storage
    const keysToKeep = ['samna-salta-route', 'persist:root'];
    const keysToRemove = Object.keys(sessionStorage).filter(
      key => !keysToKeep.includes(key)
    );

    keysToRemove.forEach(key => {
      sessionStorage.removeItem(key);
    });
  } catch (error) {
    console.warn('Failed to clean up session storage:', error);
  }
};

// Detect if page was refreshed
export const wasPageRefreshed = (): boolean => {
  return window.performance.navigation.type === 1;
};

// Handle navigation errors
export const handleNavigationError = (error: Error, pathname: string): void => {
  console.error('Navigation error:', error);

  // Save the failed route for debugging
  try {
    const errorInfo = {
      pathname,
      error: error.message,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
    };
    sessionStorage.setItem(
      'samna-salta-navigation-error',
      JSON.stringify(errorInfo)
    );
  } catch (e) {
    console.warn('Failed to save navigation error:', e);
  }
};

// Get navigation error info
export const getNavigationError = (): unknown => {
  try {
    const saved = sessionStorage.getItem('samna-salta-navigation-error');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.warn('Failed to get navigation error:', error);
  }
  return null;
};

// Clear navigation error
export const clearNavigationError = (): void => {
  try {
    sessionStorage.removeItem('samna-salta-navigation-error');
  } catch (error) {
    console.warn('Failed to clear navigation error:', error);
  }
};

// Check if app is ready for navigation
export const isAppReady = (): boolean => {
  // Check if Redux store is hydrated
  try {
    const persistedState = localStorage.getItem('persist:root');
    if (!persistedState) {
      return false;
    }

    const parsed = JSON.parse(persistedState);
    return !!parsed.auth && !!parsed.language;
  } catch (error) {
    console.warn('Failed to check app readiness:', error);
    return false;
  }
};

// Wait for app to be ready
export const waitForAppReady = (timeout = 5000): Promise<boolean> => {
  return new Promise(resolve => {
    const startTime = Date.now();

    const checkReady = () => {
      if (isAppReady()) {
        resolve(true);
        return;
      }

      if (Date.now() - startTime > timeout) {
        resolve(false);
        return;
      }

      setTimeout(checkReady, 100);
    };

    checkReady();
  });
};
