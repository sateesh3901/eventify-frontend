import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import App from './App';
import './index.css';
import ScrollToTop from './components/common/ScrollToTop';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <AuthProvider>
      <ScrollToTop />
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1F3864',
            color: '#fff',
            borderRadius: '8px',
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#4CAF50', secondary: '#fff' } },
          error:   { iconTheme: { primary: '#f44336', secondary: '#fff' } },
        }}
      />
    </AuthProvider>
  </BrowserRouter>
);