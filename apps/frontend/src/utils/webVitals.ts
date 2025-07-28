// Minimal web vitals reporting - provides interface without web-vitals dependency
const reportWebVitals = (onPerfEntry?: (metric: any) => void) => {
  // Web vitals reporting is optional and can be implemented later if needed
  // This provides the interface without causing build issues
  if (onPerfEntry && onPerfEntry instanceof Function) {
    // Optional: Add basic performance metrics if needed
    // For now, just provide the interface
  }
};

export default reportWebVitals;
