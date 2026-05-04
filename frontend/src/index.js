import React from 'react';
import ReactDOM from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { AppRouter } from './navigation/AppRouter';
import './styles/globals.css';
import './styles/variables.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <AppRouter />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'var(--surface)',
            color: 'var(--text)',
            border: '1px solid var(--border)',
            fontFamily: 'var(--font-body)',
            fontSize: '13px',
          },
          success: { iconTheme: { primary: 'var(--green)', secondary: 'var(--bg)' } },
          error:   { iconTheme: { primary: 'var(--red)',   secondary: 'var(--bg)' } },
        }}
      />
    </AuthProvider>
  </React.StrictMode>
);