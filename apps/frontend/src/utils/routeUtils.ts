// Route utility functions

// Save route state to session storage
export const saveRouteState = (
  pathname: string,
  search?: string,
  hash?: string,
): void => {
  try {
    sessionStorage.setItem(
      "samna-salta-route-state",
      JSON.stringify({
        pathname,
        search,
        hash,
        timestamp: Date.now(),
      }),
    );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn("Failed to save route state:", error);
  }
};

// Handle page refresh
export const handlePageRefresh = (): void => {
  try {
    const savedState = sessionStorage.getItem("samna-salta-route-state");
    if (savedState) {
      const { pathname, state } = JSON.parse(savedState);
      // You can use this to restore state if needed
      // eslint-disable-next-line no-console
      console.log("Restoring route state:", { pathname, state });
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn("Failed to handle page refresh:", error);
  }
};

// Check if page was refreshed
export const wasPageRefreshed = (): boolean => {
  try {
    return sessionStorage.getItem("samna-salta-refresh-handled") === null;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn("Failed to check page refresh:", error);
    return false;
  }
};

// Clear navigation error
export const clearNavigationError = (): void => {
  try {
    sessionStorage.removeItem("samna-salta-navigation-error");
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn("Failed to clear navigation error:", error);
  }
};
