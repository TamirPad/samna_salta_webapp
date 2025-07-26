import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Heebo:wght@300;400;500;600;700&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Hebrew:wght@300;400;500;600;700&display=swap');

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    font-size: 16px;
    scroll-behavior: smooth;
    /* iPhone optimization */
    -webkit-text-size-adjust: 100%;
    -webkit-tap-highlight-color: transparent;
  }

  body {
    font-family: 'Inter', 'Heebo', 'Noto Sans Hebrew', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: #FFF8DC;
    color: #2F2F2F;
    line-height: 1.6;
    direction: ltr;
    /* iPhone optimization */
    -webkit-overflow-scrolling: touch;
    overscroll-behavior: none;
    position: relative;
  }

  /* RTL Support */
  [dir="rtl"] {
    direction: rtl;
    text-align: right;

    body {
      font-family: 'Heebo', 'Noto Sans Hebrew', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
        'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
    }
  }

  /* Typography */
  h1, h2, h3, h4, h5, h6 {
    font-weight: 600;
    line-height: 1.2;
    margin-bottom: 1rem;
    color: #2F2F2F;
  }

  h1 {
    font-size: 2.5rem;
    @media (max-width: 768px) {
      font-size: 2rem;
    }
  }

  h2 {
    font-size: 2rem;
    @media (max-width: 768px) {
      font-size: 1.75rem;
    }
  }

  h3 {
    font-size: 1.5rem;
    @media (max-width: 768px) {
      font-size: 1.25rem;
    }
  }

  h4 {
    font-size: 1.25rem;
    @media (max-width: 768px) {
      font-size: 1.1rem;
    }
  }

  h5 {
    font-size: 1.1rem;
    @media (max-width: 768px) {
      font-size: 1rem;
    }
  }

  h6 {
    font-size: 1rem;
    @media (max-width: 768px) {
      font-size: 0.9rem;
    }
  }

  p {
    margin-bottom: 1rem;
    line-height: 1.6;
  }

  a {
    color: #8B4513;
    text-decoration: none;
    transition: color 0.3s ease;

    &:hover {
      color: #D2691E;
    }
  }

  /* Layout */
  .App {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .main-content {
    flex: 1;
    padding: 2rem 0;

    @media (max-width: 768px) {
      padding: 1rem 0;
    }
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;

    @media (max-width: 768px) {
      padding: 0 0.5rem;
    }

    /* iPhone optimization */
    @media (max-width: 428px) {
      padding: 0 1rem;
    }

    @media (max-width: 375px) {
      padding: 0 0.75rem;
    }

    @media (max-width: 320px) {
      padding: 0 0.5rem;
    }
  }

  /* Buttons */
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 500;
    text-decoration: none;
    cursor: pointer;
    transition: all 0.3s ease;
    min-height: 44px;
    /* iPhone optimization - minimum touch target size */
    min-width: 44px;
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    /* iPhone optimization */
    @media (max-width: 428px) {
      padding: 0.875rem 1.25rem;
      font-size: 1rem;
      min-height: 48px;
    }

    @media (max-width: 375px) {
      padding: 0.75rem 1rem;
      font-size: 0.95rem;
      min-height: 44px;
    }
  }

  .btn-primary {
    background-color: #8B4513;
    color: white;

    &:hover:not(:disabled) {
      background-color: #D2691E;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(139, 69, 19, 0.3);
    }
  }

  .btn-secondary {
    background-color: #D2691E;
    color: white;

    &:hover:not(:disabled) {
      background-color: #CD853F;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(210, 105, 30, 0.3);
    }
  }

  .btn-outline {
    background-color: transparent;
    color: #8B4513;
    border: 2px solid #8B4513;

    &:hover:not(:disabled) {
      background-color: #8B4513;
      color: white;
      transform: translateY(-2px);
    }
  }

  .btn-small {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
    min-height: 36px;
  }

  .btn-large {
    padding: 1rem 2rem;
    font-size: 1.125rem;
    min-height: 52px;
  }

  /* Cards */
  .card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    padding: 1.5rem;
    transition: all 0.3s ease;

    &:hover {
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      transform: translateY(-2px);
    }
  }

  /* Forms */
  .form-group {
    margin-bottom: 1.5rem;
  }

  .form-label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #2F2F2F;
  }

  .form-input {
    width: 100%;
    padding: 0.75rem;
    border: 2px solid #E5E5E5;
    border-radius: 8px;
    font-size: 1rem;
    transition: border-color 0.3s ease;
    /* iPhone optimization */
    -webkit-appearance: none;
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;

    &:focus {
      outline: none;
      border-color: #8B4513;
      box-shadow: 0 0 0 3px rgba(139, 69, 19, 0.1);
    }

    &::placeholder {
      color: #999;
    }

    /* iPhone optimization */
    @media (max-width: 428px) {
      padding: 0.875rem;
      font-size: 16px; /* Prevents zoom on iOS */
      min-height: 48px;
    }

    @media (max-width: 375px) {
      padding: 0.75rem;
      font-size: 16px;
      min-height: 44px;
    }
  }

  .form-textarea {
    min-height: 100px;
    resize: vertical;
  }

  .form-select {
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
    background-position: right 0.5rem center;
    background-repeat: no-repeat;
    background-size: 1.5em 1.5em;
    padding-right: 2.5rem;
  }

  /* Grid System */
  .grid {
    display: grid;
    gap: 1.5rem;
  }

  .grid-2 {
    grid-template-columns: repeat(2, 1fr);
    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  }

  .grid-3 {
    grid-template-columns: repeat(3, 1fr);
    @media (max-width: 1024px) {
      grid-template-columns: repeat(2, 1fr);
    }
    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  }

  .grid-4 {
    grid-template-columns: repeat(4, 1fr);
    @media (max-width: 1024px) {
      grid-template-columns: repeat(2, 1fr);
    }
    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  }

  /* Utilities */
  .text-center {
    text-align: center;
  }

  .text-left {
    text-align: left;
  }

  .text-right {
    text-align: right;
  }

  .mb-1 { margin-bottom: 0.25rem; }
  .mb-2 { margin-bottom: 0.5rem; }
  .mb-3 { margin-bottom: 1rem; }
  .mb-4 { margin-bottom: 1.5rem; }
  .mb-5 { margin-bottom: 3rem; }

  .mt-1 { margin-top: 0.25rem; }
  .mt-2 { margin-top: 0.5rem; }
  .mt-3 { margin-top: 1rem; }
  .mt-4 { margin-top: 1.5rem; }
  .mt-5 { margin-top: 3rem; }

  .p-1 { padding: 0.25rem; }
  .p-2 { padding: 0.5rem; }
  .p-3 { padding: 1rem; }
  .p-4 { padding: 1.5rem; }
  .p-5 { padding: 3rem; }

  .d-none { display: none; }
  .d-block { display: block; }
  .d-flex { display: flex; }
  .d-grid { display: grid; }

  .justify-center { justify-content: center; }
  .justify-between { justify-content: space-between; }
  .justify-end { justify-content: flex-end; }

  .align-center { align-items: center; }
  .align-start { align-items: flex-start; }
  .align-end { align-items: flex-end; }

  .flex-column { flex-direction: column; }
  .flex-row { flex-direction: row; }

  /* Loading States */
  .loading {
    display: inline-block;
    width: 20px;
    height: 20px;
    border: 3px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: #fff;
    animation: spin 1s ease-in-out infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  /* Animations */
  .fade-in {
    animation: fadeIn 0.5s ease-in;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .slide-up {
    animation: slideUp 0.3s ease-out;
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .pulse {
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0% {
      opacity: 1;
    }
    50% {
      opacity: 0.7;
    }
    100% {
      opacity: 1;
    }
  }

  /* Responsive Images */
  img {
    max-width: 100%;
    height: auto;
  }

  /* Focus Styles for Accessibility */
  *:focus {
    outline: 2px solid #8B4513;
    outline-offset: 2px;
  }

  /* Skip Link for Accessibility */
  .skip-link {
    position: absolute;
    top: -40px;
    left: 6px;
    background: #8B4513;
    color: white;
    padding: 8px;
    text-decoration: none;
    border-radius: 4px;
    z-index: 1000;

    &:focus {
      top: 6px;
    }
  }

  /* Print Styles */
  @media print {
    .no-print {
      display: none !important;
    }

    body {
      background: white !important;
      color: black !important;
    }

    .card {
      box-shadow: none !important;
      border: 1px solid #ccc !important;
    }
  }

  /* iPhone Specific Optimizations */
  
  /* Safe Area Support for iPhone X and newer */
  @supports (padding: max(0px)) {
    .container {
      padding-left: max(1rem, env(safe-area-inset-left));
      padding-right: max(1rem, env(safe-area-inset-right));
    }
    
    .main-content {
      padding-top: max(2rem, env(safe-area-inset-top));
      padding-bottom: max(2rem, env(safe-area-inset-bottom));
    }
  }

  /* iPhone Notch Support */
  @media (max-width: 428px) {
    .App {
      padding-top: env(safe-area-inset-top);
      padding-bottom: env(safe-area-inset-bottom);
    }
  }

  /* iPhone Touch Optimizations */
  @media (max-width: 428px) {
    /* Larger touch targets for iPhone */
    button, a, input, select, textarea {
      min-height: 44px;
      min-width: 44px;
    }
    
    /* Prevent text selection on buttons */
    button {
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
    }
    
    /* Smooth scrolling for iPhone */
    * {
      -webkit-overflow-scrolling: touch;
    }
  }

  /* iPhone Landscape Optimizations */
  @media (max-width: 428px) and (orientation: landscape) {
    .main-content {
      padding: 1rem 0;
    }
    
    .container {
      padding: 0 0.5rem;
    }
  }

  /* iPhone SE and smaller screens */
  @media (max-width: 375px) {
    h1 { font-size: 1.75rem; }
    h2 { font-size: 1.5rem; }
    h3 { font-size: 1.25rem; }
    h4 { font-size: 1.1rem; }
    h5 { font-size: 1rem; }
    h6 { font-size: 0.9rem; }
    
    .card {
      padding: 1rem;
    }
  }

  /* iPhone 5/SE (320px) */
  @media (max-width: 320px) {
    h1 { font-size: 1.5rem; }
    h2 { font-size: 1.25rem; }
    h3 { font-size: 1.1rem; }
    h4 { font-size: 1rem; }
    h5 { font-size: 0.9rem; }
    h6 { font-size: 0.85rem; }
    
    .btn {
      padding: 0.625rem 0.875rem;
      font-size: 0.9rem;
    }
    
    .form-input {
      padding: 0.625rem;
      font-size: 16px;
    }
  }
`; 