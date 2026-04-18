import { type ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { FriendsProvider } from './contexts/FriendsContext';
import { NotificationsProvider } from './contexts/NotificationsContext';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import './index.css';

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Auth />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <DataProvider>
        <NotificationsProvider>
          <FriendsProvider>
            <Router>
              <AppRoutes />
              <Toaster
                position="bottom-center"
                toastOptions={{
                  style: {
                    background: 'var(--bg-card)',
                    color: 'var(--text-main)',
                    border: '1px solid var(--border)',
                  },
                }}
              />
            </Router>
          </FriendsProvider>
        </NotificationsProvider>
      </DataProvider>
    </AuthProvider>
  );
};

export default App;
