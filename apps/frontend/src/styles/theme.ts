// Wolt-inspired color theme
export const theme = {
  colors: {
    // Primary colors (Wolt blue)
    primary: '#00C2FF',
    primaryDark: '#0077CC',
    primaryLight: '#00A3E0',
    
    // Secondary colors
    secondary: '#00A3E0',
    secondaryDark: '#005A8B',
    secondaryLight: '#33D1FF',
    
    // Background colors
    background: '#F8F9FA',
    surface: '#FFFFFF',
    
    // Text colors
    textPrimary: '#2F2F2F',
    textSecondary: '#666666',
    textLight: '#888888',
    
    // Status colors
    success: '#28A745',
    warning: '#FFC107',
    error: '#DC3545',
    info: '#17A2B8',
    
    // Border colors
    border: '#E1E5E9',
    borderLight: '#F0F0F0',
    
    // Gradient colors
    gradientStart: '#00C2FF',
    gradientEnd: '#0077CC',
    
    // Hover states
    hover: '#00A3E0',
    hoverDark: '#005A8B',
  },
  
  // Gradients
  gradients: {
    primary: 'linear-gradient(135deg, #00C2FF 0%, #0077CC 100%)',
    secondary: 'linear-gradient(135deg, #00A3E0 0%, #005A8B 100%)',
    background: 'linear-gradient(135deg, #00C2FF 0%, #0077CC 100%)',
  },
  
  // Shadows
  shadows: {
    small: '0 2px 8px rgba(0, 194, 255, 0.1)',
    medium: '0 4px 12px rgba(0, 194, 255, 0.15)',
    large: '0 8px 32px rgba(0, 194, 255, 0.2)',
  },
  
  // Border radius
  borderRadius: {
    small: '6px',
    medium: '8px',
    large: '12px',
  },
  
  // Spacing
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
};

export type Theme = typeof theme;
export default theme; 