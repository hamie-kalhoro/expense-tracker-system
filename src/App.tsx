import { type ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { FriendsProvider } from './contexts/FriendsContext';
import { NotificationsProvider } from './contexts/NotificationsContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import UserProfile from './components/UserProfile';
import './index.css';

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span className="spinner"></span></div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span className="spinner"></span></div>;
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/profile" replace /> : <Auth />} />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={user ? <Navigate to="/profile" replace /> : <Navigate to="/login" replace />} />
    </Routes>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationsProvider>
          <DataProvider>
            <FriendsProvider>
              <Router>
                <div className="bg-animation">
                  <div className="bg-blob blob-1"></div>
                  <div className="bg-blob blob-2"></div>
                  <div className="bg-blob blob-3"></div>
                </div>
                <AppRoutes />
                <Toaster
                  position="bottom-center"
                  toastOptions={{
                    style: {
                      background: 'var(--bg-elevated)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border)',
                      fontFamily: "'Inter', sans-serif",
                    },
                    success: {
                      iconTheme: {
                        primary: 'var(--success)',
                        secondary: '#fff',
                      },
                    },
                    error: {
                      iconTheme: {
                        primary: 'var(--error)',
                        secondary: '#fff',
                      },
                    },
                  }}
                />
              </Router>
            </FriendsProvider>
          </DataProvider>
        </NotificationsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
