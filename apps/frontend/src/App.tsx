import React, { Suspense, lazy, useMemo } from 'react';
import { Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary';
import NetworkStatus from './components/NetworkStatus';
import { useAppSelector } from './hooks/redux';
import { selectLanguage } from './features/language/languageSlice';

// Lazy load HomePage with explicit chunk name
const HomePage = lazy(() => retry(() => import(/* webpackChunkName: "home" */ './pages/HomePage')));

// Retry mechanism for lazy loading
const retry = <T,>(fn: () => Promise<T>, retriesLeft = 3, interval = 1000): Promise<T> => {
  return new Promise((resolve, reject) => {
    fn()
      .then(resolve)
      .catch((error) => {
        setTimeout(() => {
          if (retriesLeft === 1) {
            reject(error);
            return;
          }
          retry(fn, retriesLeft - 1, interval).then(resolve, reject);
        }, interval);
      });
  });
};

// Lazy load pages with explicit chunk names for better webpack handling
const MenuPage = lazy(() => retry(() => import(/* webpackChunkName: "menu" */ './pages/MenuPage')));
const CartPage = lazy(() => retry(() => import(/* webpackChunkName: "cart" */ './pages/CartPage')));
const CheckoutPage = lazy(() => retry(() => import(/* webpackChunkName: "checkout" */ './pages/CheckoutPage')));
const OrderTrackingPage = lazy(() => retry(() => import(/* webpackChunkName: "order-tracking" */ './pages/OrderTrackingPage')));
const LoginPage = lazy(() => retry(() => import(/* webpackChunkName: "login" */ './pages/LoginPage')));
const Dashboard = lazy(() => retry(() => import(/* webpackChunkName: "admin-dashboard" */ './pages/admin/Dashboard')));
const Orders = lazy(() => retry(() => import(/* webpackChunkName: "admin-orders" */ './pages/admin/Orders')));
const Products = lazy(() => retry(() => import(/* webpackChunkName: "admin-products" */ './pages/admin/Products')));
const Customers = lazy(() => retry(() => import(/* webpackChunkName: "admin-customers" */ './pages/admin/Customers')));
const Analytics = lazy(() => retry(() => import(/* webpackChunkName: "admin-analytics" */ './pages/admin/Analytics')));
const NotFoundPage = lazy(() => retry(() => import(/* webpackChunkName: "not-found" */ './pages/NotFoundPage')));

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

const App: React.FC = (): JSX.Element => {
  const language = useAppSelector(selectLanguage);

  // Memoized route rendering
  const routeElements = useMemo((): JSX.Element[] => 
    [
      { path: '/', component: HomePage },
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
            <AnimatedRoute>
              <Component />
            </AnimatedRoute>
          }
        />
      );
    }), []
  );

  // Memoized 404 route
  const notFoundRoute = useMemo((): JSX.Element => (
    <Route path="*" element={<NotFoundPage />} />
  ), []);

  return (
    <ErrorBoundary>
      <div className="App" dir={language === 'he' ? 'rtl' : 'ltr'}>
        <NetworkStatus />
        <Header />
        <main className="main-content">
          <Suspense fallback={<LoadingSpinner />}>
            <ErrorBoundary fallback={<ChunkErrorFallback />}>
              <AnimatePresence mode="wait">
                <Routes>
                  {routeElements}
                  {notFoundRoute}
                </Routes>
              </AnimatePresence>
            </ErrorBoundary>
          </Suspense>
        </main>
        <Footer />
      </div>
    </ErrorBoundary>
  );
};

export default React.memo(App); 