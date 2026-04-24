import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, Activity, Users, Shield, Zap, ArrowRight, CheckCircle, Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  return (
    <div style={{ minHeight: '100vh', overflow: 'hidden', position: 'relative' }}>
      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        className="glass"
        style={{
          position: 'absolute', top: '24px', right: '24px',
          borderRadius: 'var(--radius-md)', padding: '12px',
          cursor: 'pointer', color: 'var(--text-primary)',
          zIndex: 50, display: 'flex', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
      </button>

      {/* Decorative Blobs are handled by App.tsx bg-animation, but we can add an extra hero blob */}
      <div className="blob" style={{ 
        position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)',
        width: '60vw', height: '60vw', maxWidth: '800px', maxHeight: '800px',
        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
        opacity: 0.8, zIndex: 0
      }} />

      <div className="main-container" style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: '15vh' }}>
        
        {/* Hero Section */}
        <div className="animate-entrance" style={{ textAlign: 'center', maxWidth: '800px', marginBottom: '80px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'var(--bg-card)', borderRadius: 'var(--radius-full)', border: '1px solid var(--border)', marginBottom: '32px', boxShadow: 'var(--shadow-sm)' }}>
            <span className="badge badge-accent" style={{ padding: '4px 10px' }}>v2.0 Live</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Welcome to the future of expense tracking</span>
          </div>
          
          <h1 style={{ fontSize: 'clamp(3rem, 8vw, 5.5rem)', fontWeight: 800, lineHeight: 1.1, marginBottom: '24px', letterSpacing: '-0.02em' }}>
            Split expenses with <br />
            <span className="gradient-text">Zero Friction.</span>
          </h1>
          
          <p style={{ fontSize: 'clamp(1.1rem, 3vw, 1.3rem)', color: 'var(--text-secondary)', marginBottom: '48px', maxWidth: '600px', margin: '0 auto 48px auto', lineHeight: 1.6 }}>
            The most beautiful and intelligent way to track shared expenses, settle debts, and manage group finances securely.
          </p>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button 
              onClick={() => navigate('/login')}
              className="btn btn-primary card-hover" 
              style={{ padding: '16px 36px', fontSize: '1.1rem', borderRadius: 'var(--radius-lg)' }}
            >
              Get Started <ArrowRight size={20} />
            </button>
            <button 
              onClick={() => navigate('/login')}
              className="btn glass card-hover" 
              style={{ padding: '16px 36px', fontSize: '1.1rem', borderRadius: 'var(--radius-lg)', color: 'var(--text-primary)' }}
            >
              Sign In
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="animate-entrance" style={{ animationDelay: '0.2s', width: '100%', maxWidth: '1200px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', paddingBottom: '80px' }}>
          {[
            { icon: Zap, title: "Lightning Fast", desc: "Real-time synchronization across all your devices using Supabase edge architecture." },
            { icon: Users, title: "Social First", desc: "Find friends, send requests, and manage group expenses effortlessly." },
            { icon: Shield, title: "Bank-Grade Security", desc: "Your financial data is protected with enterprise-level Row Level Security." },
            { icon: Activity, title: "Smart Analytics", desc: "Visualize your spending habits with interactive charts and dynamic insights." },
            { icon: Wallet, title: "Easy Settlements", desc: "Know exactly who owes who, minimizing awkward conversations." },
            { icon: CheckCircle, title: "Premium Design", desc: "A sleek, modern interface with glassmorphism and beautiful dark mode support." }
          ].map((feature, idx) => (
            <div key={idx} className="glass card-hover" style={{ padding: '32px', borderRadius: 'var(--radius-xl)', display: 'flex', flexDirection: 'column', gap: '16px', border: '1px solid var(--border)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-lg)', background: 'var(--accent-glow)', color: 'var(--accent-1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <feature.icon size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{feature.title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.5 }}>
                {feature.desc}
              </p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default LandingPage;
