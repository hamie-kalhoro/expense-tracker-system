import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Wallet, LogIn } from 'lucide-react';

const Login: React.FC = () => {
  const { signInWithGoogle, isMockMode } = useAuth();

  return (
    <div className="flex-center" style={{ minHeight: '100vh', padding: '24px' }}>
      <div className="glass-card animate-fade-in login-glow" style={{ maxWidth: '400px', width: '100%', textAlign: 'center', padding: '40px 24px' }}>
        <div className="flex-center" style={{ marginBottom: '24px' }}>
          <div style={{ 
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
            padding: '16px',
            borderRadius: '20px',
            boxShadow: '0 8px 24px rgba(59, 130, 246, 0.4)'
          }}>
            <Wallet size={40} color="white" />
          </div>
        </div>
        
        <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>SplitEase</h1>
        <p style={{ marginBottom: '32px' }}>Track and equalize shared expenses with friends seamlessly.</p>
        
        {isMockMode && (
          <div style={{ 
            background: 'rgba(239, 68, 68, 0.1)', 
            border: '1px solid var(--danger)',
            color: '#fca5a5',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '24px',
            fontSize: '0.85rem'
          }}>
            Running in preview mode (Firebase not configured). You can log in with a mock account.
          </div>
        )}

        <button 
          className="btn btn-primary" 
          onClick={signInWithGoogle}
          style={{ width: '100%', padding: '14px' }}
        >
          <LogIn size={20} />
          Sign in with Google
        </button>
      </div>
    </div>
  );
};

export default Login;
