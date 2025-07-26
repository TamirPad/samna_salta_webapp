import React, { Suspense, lazy, useMemo, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary';
import NetworkStatus from './components/NetworkStatus';
import { useAppSelector } from './hooks/redux';
import { selectLanguage } from './features/language/languageSlice';
import { 
  saveRouteState, 
  handlePageRefresh, 
  wasPageRefreshed,
  clearNavigationError 
} from './utils/routeUtils';

// Lazy load pages with explicit chunk names for better webpack handling
const HomePage = lazy(() => import('./pages/HomePage'));
const MenuPage = lazy(() => import('./pages/MenuPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const OrderTrackingPage = lazy(() => import('./pages/OrderTrackingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const Orders = lazy(() => import('./pages/admin/Orders'));
const Products = lazy(() => import('./pages/admin/Products'));
const Customers = lazy(() => import('./pages/admin/Customers'));
const Analytics = lazy(() => import('./pages/admin/Analytics'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// Types
interface AnimatedRouteProps {
  children: React.ReactNode;
}

// Animated Route Wrapper Component
const AnimatedRoute: React.FC<AnimatedRouteProps> = React.memo(({ children }): JSX.Element => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
  >
    {children}
  </motion.div>
));

AnimatedRoute.displayName = 'AnimatedRoute';

// Error Fallback Component for Chunk Loading Errors
const ChunkErrorFallback: React.FC = () => (
  <div style={{ 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    justifyContent: 'center', 
    height: '50vh',
    textAlign: 'center',
    padding: '2rem'
  }}>
    <h2>Loading Error</h2>
    <p>There was an issue loading this page. Please refresh the page and try again.</p>
    <button 
      onClick={(): void => window.location.reload()} 
      style={{
        padding: '0.5rem 1rem',
        backgroundColor: '#8B4513',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        marginTop: '1rem'
      }}
    >
      Refresh Page
    </button>
  </div>
);

// Scroll to top component
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

// Route persistence component
const RoutePersistence: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    // Save current route state
    saveRouteState(location.pathname, location.search, location.hash);
    
    // Clear any navigation errors when successfully navigating
    clearNavigationError();
  }, [location]);

  useEffect(() => {
    // Handle page refresh
    if (wasPageRefreshed()) {
      handlePageRefresh();
    }
  }, []);

  return null;
};

const App: React.FC = (): JSX.Element => {
  const language = useAppSelector(selectLanguage);

  // Memoized route rendering
  const routeElements = useMemo((): JSX.Element[] => 
    [
      { path: '/', component: LoginPage },
      { path: '/home', component: HomePage },
      { path: '/menu', component: MenuPage },
      { path: '/cart', component: CartPage },
      { path: '/checkout', component: CheckoutPage },
      { path: '/order/:orderId', component: OrderTrackingPage },
      { path: '/login', component: LoginPage },
      { path: '/admin', component: Dashboard },
      { path: '/admin/orders', component: Orders },
      { path: '/admin/products', component: Products },
      { path: '/admin/customers', component: Customers },
      { path: '/admin/analytics', component: Analytics },
    ].map((route): JSX.Element => {
      const Component = route.component;
      
      return (
        <Route
          key={route.path}
          path={route.path}
          element={
            <ErrorBoundary fallback={<ChunkErrorFallback />}>
              <AnimatedRoute>
                <Component />
              </AnimatedRoute>
            </ErrorBoundary>
          }
        />
      );
    }), []
  );

  // Memoized 404 route
  const notFoundRoute = useMemo((): JSX.Element => (
    <Route path="*" element={<NotFoundPage />} />
  ), []);

  const location = useLocation();
  const isLoginPage = location.pathname === '/' || location.pathname === '/login';

  return (
    <ErrorBoundary>
      <div className="App" dir={language === 'he' ? 'rtl' : 'ltr'}>
        <ScrollToTop />
        <RoutePersistence />
        <NetworkStatus />
        {!isLoginPage && <Header />}
        <main className="main-content">
          <Suspense fallback={<LoadingSpinner />}>
            <AnimatePresence mode="wait">
              <Routes>
                {routeElements}
                {notFoundRoute}
              </Routes>
            </AnimatePresence>
          </Suspense>
        </main>
        {!isLoginPage && <Footer />}
      </div>
    </ErrorBoundary>
  );
};

export default React.memo(App); 