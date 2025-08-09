import 'styled-components';

// Material 3 inspired, mainstream blue palette
export const theme = {
  colors: {
    // Primary (Indigo/Blue blend)
    primary: '#3B82F6',       // Tailwind blue-500
    primaryDark: '#2563EB',   // blue-600
    primaryLight: '#60A5FA',  // blue-400
    
    // Secondary colors
    secondary: '#6366F1',       // indigo-500
    secondaryDark: '#4F46E5',   // indigo-600
    secondaryLight: '#818CF8',  // indigo-400
    
    // Background colors
    background: '#F9FAFB',   // gray-50
    surface: '#FFFFFF',
    
    // Text colors
    textPrimary: '#111827',   // gray-900
    textSecondary: '#4B5563', // gray-600
    textLight: '#6B7280',     // gray-500
    
    // Status colors
    success: '#10B981',  // emerald-500
    warning: '#F59E0B',  // amber-500
    error:   '#EF4444',  // red-500
    info:    '#0EA5E9',  // sky-500
    
    // Border colors
    border: '#E5E7EB',       // gray-200
    borderLight: '#F3F4F6',  // gray-100
    
    // Gradient colors
    gradientStart: '#3B82F6',
    gradientEnd: '#6366F1',
    
    // Hover states
    hover: '#2563EB',
    hoverDark: '#1D4ED8',
  },
  
  // Gradients
  gradients: {
    primary: 'linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)',
    secondary: 'linear-gradient(135deg, #6366F1 0%, #3B82F6 100%)',
    background: 'linear-gradient(135deg, #EFF6FF 0%, #EEF2FF 100%)',
  },
  
  // Shadows
  shadows: {
    small: '0 2px 8px rgba(17, 24, 39, 0.06)',
    medium: '0 4px 12px rgba(17, 24, 39, 0.08)',
    large: '0 8px 32px rgba(17, 24, 39, 0.10)',
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
} as const;

export type Theme = typeof theme;

declare module 'styled-components' {
  export interface DefaultTheme extends Theme {}
}

export default theme; 