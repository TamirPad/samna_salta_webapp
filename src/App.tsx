import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
// import { iPhoneOptimizations } from './components/iPhoneOptimizations';

import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import MenuPage from './pages/MenuPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import AdminDashboard from './pages/admin/Dashboard';
import AdminOrders from './pages/admin/Orders';
import AdminProducts from './pages/admin/Products';
import AdminCustomers from './pages/admin/Customers';
import AdminAnalytics from './pages/admin/Analytics';
import NotFoundPage from './pages/NotFoundPage';

import { useAppSelector } from './hooks/redux';
import { selectLanguage } from './features/language/languageSlice';

const App: React.FC = () => {
  const language = useAppSelector(selectLanguage);

  return (
    <div className="App" dir={language === 'he' ? 'rtl' : 'ltr'}>
      <Header />
      <main className="main-content">
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <HomePage />
              </motion.div>
            } />
            <Route path="/menu" element={
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <MenuPage />
              </motion.div>
            } />
            <Route path="/cart" element={
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <CartPage />
              </motion.div>
            } />
            <Route path="/checkout" element={
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <CheckoutPage />
              </motion.div>
            } />
            <Route path="/order/:orderId" element={
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <OrderTrackingPage />
              </motion.div>
            } />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
            <Route path="/admin/products" element={<AdminProducts />} />
            <Route path="/admin/customers" element={<AdminCustomers />} />
            <Route path="/admin/analytics" element={<AdminAnalytics />} />

            {/* 404 Page */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
};

export default App; 