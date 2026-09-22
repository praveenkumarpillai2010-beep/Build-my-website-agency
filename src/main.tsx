import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { AdminNotificationProvider } from './context/AdminNotificationContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <AdminNotificationProvider>
        <App />
      </AdminNotificationProvider>
    </AuthProvider>
  </StrictMode>,
);

