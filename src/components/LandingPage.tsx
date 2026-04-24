import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Wallet, Activity, Users, Shield, Zap, ArrowRight, 
  CheckCircle, Sun, Moon, Instagram, Phone, Mail, 
  User, Github, Twitter, ExternalLink
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--page-gradient)' }}>
      {/* Premium Navigation Bar */}
      <nav className="glass" style={{ 
        position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)',
        width: 'calc(100% - 32px)', maxWidth: '1200px', height: '70px',
        borderRadius: 'var(--radius-lg)', zIndex: 100, display: 'flex',
        alignItems: 'center', justifyContent: 'space-between', padding: '0 24px',
        boxShadow: 'var(--shadow-lg)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ 
            width: '38px', height: '38px', background: 'var(--accent-gradient)',
            borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
          }}>
            <Wallet size={20} />
          </div>
          <span style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>SplitEase</span>
        </div>

        <div className="nav-tabs-desktop" style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <span className="nav-link">Features</span>
          <span className="nav-link">About</span>
          <span className="nav-link">Pricing</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={toggleTheme} className="icon-btn" style={{ borderRadius: '12px', width: '40px', height: '40px' }}>
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <button 
            onClick={() => navigate('/login')}
            className="btn btn-primary" 
            style={{ padding: '8px 20px', fontSize: '0.85rem', borderRadius: '12px' }}
          >
            Sign In
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main style={{ flex: 1, position: 'relative', paddingTop: '160px', overflow: 'hidden' }}>
        {/* Dynamic Background Elements */}
        <div className="blob" style={{ 
          position: 'absolute', top: '5%', right: '-5%', width: '45vw', height: '45vw',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, transparent 70%)',
          zIndex: 0
        }} />
        <div className="blob" style={{ 
          position: 'absolute', bottom: '15%', left: '-10%', width: '35vw', height: '35vw',
          background: 'radial-gradient(circle, rgba(236, 72, 153, 0.1) 0%, transparent 70%)',
          zIndex: 0
        }} />

        <div className="main-container" style={{ position: 'relative', zIndex: 10 }}>
          <div className="animate-entrance" style={{ textAlign: 'center', maxWidth: '850px', margin: '0 auto 100px auto' }}>
            <div style={{ 
              display: 'inline-flex', alignItems: 'center', gap: '8px', 
              padding: '8px 16px', background: 'var(--bg-card)', 
              borderRadius: 'var(--radius-full)', border: '1px solid var(--border)', 
              marginBottom: '32px', boxShadow: 'var(--shadow-md)',
              animation: 'bounce 3s infinite'
            }}>
              <Zap size={14} color="var(--warning)" fill="var(--warning)" />
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                The Next Generation of Tracking
              </span>
            </div>
            
            <h1 style={{ fontSize: 'clamp(2.8rem, 8vw, 5.5rem)', fontWeight: 800, lineHeight: 1.05, marginBottom: '24px', letterSpacing: '-0.04em' }}>
              Financial Clarity <br />
              <span className="gradient-text">Redefined for Groups.</span>
            </h1>
            
            <p style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)', color: 'var(--text-secondary)', marginBottom: '48px', maxWidth: '600px', margin: '0 auto 48px auto', lineHeight: 1.6 }}>
              Seamlessly split bills, track debts, and manage shared finances with a professional interface designed for speed and beauty.
            </p>

            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => navigate('/login')} className="btn btn-primary card-hover" style={{ padding: '16px 36px', fontSize: '1rem', borderRadius: 'var(--radius-lg)', boxShadow: '0 10px 25px rgba(99, 102, 241, 0.4)' }}>
                Start Free Account <ArrowRight size={18} />
              </button>
              <button onClick={() => navigate('/login')} className="btn glass card-hover" style={{ padding: '16px 36px', fontSize: '1rem', borderRadius: 'var(--radius-lg)', color: 'var(--text-primary)' }}>
                Watch Demo
              </button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="animate-entrance" style={{ animationDelay: '0.2s', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '120px' }}>
            {[
              { icon: Zap, title: "Edge Performance", desc: "Global data synchronization in milliseconds using Supabase's high-speed architecture." },
              { icon: Users, title: "Social Connect", desc: "A first-class social experience with friend requests and shared activity feeds." },
              { icon: Shield, title: "Privacy First", desc: "Your data is encrypted and protected by robust Row Level Security policies." },
              { icon: Activity, title: "Data Insights", desc: "Beautifully rendered charts and analytics to understand your group spending." }
            ].map((feature, idx) => (
              <div key={idx} className="glass card-hover" style={{ padding: '32px', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)' }}>
                <div style={{ 
                  width: '50px', height: '50px', borderRadius: '14px', 
                  background: 'var(--accent-glow)', color: 'var(--accent-1)', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px'
                }}>
                  <feature.icon size={24} />
                </div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '12px' }}>{feature.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Premium Footer with Personal Details */}
      <footer className="glass" style={{ 
        marginTop: 'auto', borderTop: '1px solid var(--border)', 
        padding: '60px 24px 40px 24px', borderRadius: '40px 40px 0 0'
      }}>
        <div className="main-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '48px', marginBottom: '60px' }}>
          {/* Brand Col */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <div style={{ width: '32px', height: '32px', background: 'var(--accent-gradient)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                <Wallet size={18} />
              </div>
              <span style={{ fontSize: '1.1rem', fontWeight: 800 }}>SplitEase</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: '240px' }}>
              Empowering friendship through financial transparency. Built for the modern social world.
            </p>
          </div>

          {/* Developer Col (Detailed Info) */}
          <div style={{ background: 'var(--accent-subtle)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '20px', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Developer Info</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)' }}>
                <User size={16} color="var(--accent-1)" />
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Hamid Ali Khan (Kalhoro)</span>
              </div>
              <a href="https://instagram.com/hamidi_2005" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)', textDecoration: 'none' }} className="footer-link">
                <Instagram size={16} color="#E4405F" />
                <span style={{ fontSize: '0.9rem' }}>@hamidi_2005</span>
                <ExternalLink size={12} style={{ opacity: 0.5 }} />
              </a>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)' }}>
                <Phone size={16} color="#25D366" />
                <span style={{ fontSize: '0.9rem' }}>+92 370 9155088</span>
              </div>
              <a href="mailto:hamidkalhoro.in@gmail.com" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)', textDecoration: 'none' }} className="footer-link">
                <Mail size={16} color="var(--accent-1)" />
                <span style={{ fontSize: '0.9rem' }}>hamidkalhoro.in@gmail.com</span>
              </a>
            </div>
          </div>

          {/* Social Col */}
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '20px', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Socials</h4>
            <div style={{ display: 'flex', gap: '12px' }}>
              {[Github, Twitter, Instagram].map((Icon, i) => (
                <button key={i} className="icon-btn" style={{ width: '42px', height: '42px', borderRadius: '12px' }}>
                  <Icon size={18} />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ 
          borderTop: '1px solid var(--border)', paddingTop: '32px', 
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' 
        }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            © 2026 SplitEase. Designed & Crafted by <span style={{ color: 'var(--accent-1)', fontWeight: 700 }}>Hamid Ali Kalhoro</span>.
          </p>
          <div style={{ display: 'flex', gap: '20px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', cursor: 'pointer' }}>Privacy</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', cursor: 'pointer' }}>Terms</span>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .nav-link {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s;
        }
        .nav-link:hover {
          color: var(--accent-1);
        }
        .footer-link:hover {
          color: var(--accent-1) !important;
          transform: translateX(3px);
        }
        .footer-link {
          transition: all 0.2s;
        }
        @media (max-width: 768px) {
          .nav-tabs-desktop {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
