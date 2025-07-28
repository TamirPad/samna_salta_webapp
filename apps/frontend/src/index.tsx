import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { PersistGate } from 'redux-persist/integration/react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import App from './App';
import { store, persistor } from './store';
import { GlobalStyles } from './styles/GlobalStyles';
import reportWebVitals from './utils/webVitals';

// Register service worker for offline support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then(registration => {
        console.log('✅ Service Worker registered successfully:', registration);
      })
      .catch(registrationError => {
        console.warn('⚠️ Service Worker registration failed:', registrationError);
        console.log('💡 This is normal if the service worker has syntax errors');
        console.log('💡 The app will still work without offline support');
      });
  });
}

// Initialize performance monitoring
reportWebVitals();

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <BrowserRouter
          future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
        >
          <GlobalStyles />
          <App />
          <ToastContainer
            position='top-right'
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme='light'
          />
        </BrowserRouter>
      </PersistGate>
    </Provider>
  </React.StrictMode>
);
