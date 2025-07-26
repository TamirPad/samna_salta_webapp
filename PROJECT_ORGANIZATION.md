# Project Organization Guide

## Overview
This guide explains the organization and structure of the Samna Salta webapp monorepo, along with best practices for maintaining code quality and organization.

## Project Structure

```
samna_salta_webapp/
├── apps/                          # Application packages
│   ├── frontend/                  # React frontend application
│   │   ├── src/
│   │   │   ├── components/        # Reusable UI components
│   │   │   ├── features/          # Feature-based Redux slices
│   │   │   ├── hooks/             # Custom React hooks
│   │   │   ├── pages/             # Page components
│   │   │   ├── store/             # Redux store configuration
│   │   │   ├── styles/            # Global styles and themes
│   │   │   ├── types/             # TypeScript type definitions
│   │   │   └── utils/             # Utility functions
│   │   ├── public/                # Static assets
│   │   └── tests/                 # Test files
│   └── backend/                   # Node.js backend API
│       ├── src/
│       │   ├── config/            # Configuration files
│       │   ├── database/          # Database setup and migrations
│       │   ├── middleware/        # Express middleware
│       │   ├── routes/            # API route handlers
│       │   └── utils/             # Utility functions
│       └── tests/                 # Test files
├── packages/                      # Shared packages
│   └── common/                    # Shared utilities and types
│       ├── src/
│       │   ├── constants/         # Shared constants
│       │   ├── types/             # Shared TypeScript types
│       │   └── utils/             # Shared utility functions
├── docs/                          # Documentation
├── scripts/                       # Build and deployment scripts
└── config/                        # Configuration files
```

## File Naming Conventions

### Components
- **React Components**: PascalCase (e.g., `UserProfile.tsx`)
- **Component Files**: Same as component name (e.g., `UserProfile.tsx`)
- **Index Files**: `index.tsx` for component exports

### Utilities and Hooks
- **Utility Functions**: camelCase (e.g., `formatCurrency.ts`)
- **Custom Hooks**: camelCase with `use` prefix (e.g., `useLocalStorage.ts`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_ENDPOINTS.ts`)

### Pages and Routes
- **Page Components**: PascalCase (e.g., `HomePage.tsx`)
- **Route Files**: kebab-case (e.g., `user-profile.tsx`)

### Backend Files
- **Route Handlers**: camelCase (e.g., `userRoutes.js`)
- **Middleware**: camelCase (e.g., `authMiddleware.js`)
- **Database Models**: PascalCase (e.g., `User.js`)

## Code Organization Best Practices

### 1. Component Structure
```typescript
// Component file structure
import React from 'react';
import { ComponentProps } from './types';

// Types and interfaces
interface ComponentProps {
  // Props definition
}

// Component definition
export const Component: React.FC<ComponentProps> = ({ prop1, prop2 }) => {
  // Component logic
  return (
    // JSX
  );
};

// Export
export default Component;
```

### 2. Feature Organization
Organize code by features rather than types:
```
features/
├── auth/
│   ├── authSlice.ts
│   ├── authApi.ts
│   └── authTypes.ts
├── products/
│   ├── productsSlice.ts
│   ├── productsApi.ts
│   └── productsTypes.ts
└── orders/
    ├── ordersSlice.ts
    ├── ordersApi.ts
    └── ordersTypes.ts
```

### 3. Import Organization
```typescript
// 1. React and external libraries
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

// 2. Internal components
import { Button } from '@/components/Button';
import { Header } from '@/components/layout/Header';

// 3. Hooks and utilities
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { formatCurrency } from '@/utils/format';

// 4. Types
import { User } from '@/types/user';

// 5. Styles
import { Container, Title } from './styles';
```

## Code Quality Standards

### 1. TypeScript
- Use strict TypeScript configuration
- Define proper interfaces for all props and state
- Avoid `any` type - use proper typing
- Use union types for better type safety

### 2. React Best Practices
- Use functional components with hooks
- Implement proper error boundaries
- Use React.memo for performance optimization
- Follow the rules of hooks

### 3. State Management
- Use Redux Toolkit for global state
- Keep local state in components when possible
- Use proper action creators and reducers
- Implement proper error handling

### 4. Testing
- Write unit tests for utilities and hooks
- Write integration tests for components
- Use proper test naming conventions
- Maintain good test coverage

## File Size Guidelines

### Components
- **Small Components**: < 100 lines
- **Medium Components**: 100-300 lines
- **Large Components**: > 300 lines (consider breaking down)

### Files
- **Utility Files**: < 200 lines
- **Page Components**: < 500 lines
- **API Routes**: < 300 lines

## Performance Considerations

### 1. Code Splitting
- Use React.lazy for route-based code splitting
- Implement dynamic imports for large components
- Use webpack bundle analyzer to monitor bundle size

### 2. Optimization
- Use React.memo for expensive components
- Implement proper memoization with useMemo and useCallback
- Optimize images and assets
- Use proper caching strategies

### 3. Bundle Size
- Monitor bundle size regularly
- Remove unused dependencies
- Use tree shaking effectively
- Implement proper code splitting

## Documentation Standards

### 1. Code Comments
```typescript
/**
 * Formats a currency value for display
 * @param amount - The amount to format
 * @param currency - The currency code (default: 'ILS')
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number, currency = 'ILS'): string => {
  // Implementation
};
```

### 2. README Files
- Maintain README files for each package
- Include setup instructions
- Document API endpoints
- Provide usage examples

### 3. API Documentation
- Document all API endpoints
- Include request/response examples
- Document error codes and messages
- Keep documentation up to date

## Git Workflow

### 1. Branch Naming
- `feature/feature-name` - New features
- `bugfix/bug-description` - Bug fixes
- `hotfix/urgent-fix` - Critical fixes
- `refactor/component-name` - Code refactoring

### 2. Commit Messages
- Use conventional commit format
- Write descriptive commit messages
- Reference issue numbers when applicable

### 3. Pull Requests
- Include proper description
- Add screenshots for UI changes
- Request reviews from team members
- Ensure all tests pass

## Maintenance Tasks

### Daily
- Review and address TODO comments
- Check for console.log statements
- Monitor build and test status
- Review error logs

### Weekly
- Update dependencies
- Review code coverage
- Analyze bundle size
- Clean up unused code

### Monthly
- Audit security vulnerabilities
- Review performance metrics
- Update documentation
- Plan technical debt reduction

## Tools and Scripts

### Available Scripts
```bash
# Development
npm run dev              # Start development servers
npm run build            # Build all packages
npm run test             # Run all tests
npm run lint             # Run linting
npm run type-check       # Run TypeScript checks

# Cleanup
npm run cleanup          # Run cleanup script
npm run cleanup:full     # Full cleanup including node_modules

# Maintenance
npm run audit            # Security audit
npm run outdated         # Check outdated packages
npm run update           # Update packages
```

### Code Quality Tools
- **ESLint**: Code linting and style enforcement
- **Prettier**: Code formatting
- **TypeScript**: Type checking
- **Jest**: Testing framework
- **Husky**: Git hooks for pre-commit checks

## Troubleshooting

### Common Issues
1. **Build Failures**: Check TypeScript errors and missing dependencies
2. **Test Failures**: Review test environment and mock setup
3. **Performance Issues**: Use React DevTools and bundle analyzer
4. **Type Errors**: Ensure proper TypeScript configuration

### Getting Help
- Check existing documentation
- Review similar issues in the codebase
- Consult team members
- Create detailed issue reports

## Conclusion

Following these organization guidelines will help maintain a clean, scalable, and maintainable codebase. Regular reviews and updates to these standards ensure the project continues to meet quality requirements as it grows. 