import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Wallet, Activity, Users, Shield, Zap, ArrowRight, 
  CheckCircle, Sun, Moon, Phone, Mail, 
  User, ExternalLink, Code, Share2
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import WelcomeModal from './WelcomeModal';

// Premium Instagram Icon with Gradient
const InstagramIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <defs>
      <linearGradient id="instagram-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" style={{ stopColor: '#f09433' }} />
        <stop offset="25%" style={{ stopColor: '#e6683c' }} />
        <stop offset="50%" style={{ stopColor: '#dc2743' }} />
        <stop offset="75%" style={{ stopColor: '#cc2366' }} />
        <stop offset="100%" style={{ stopColor: '#bc1888' }} />
      </linearGradient>
    </defs>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--page-gradient)' }}>
      {/* Welcome Modal for New Users */}
      <WelcomeModal />

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
          <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>SplitEase</span>
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
            style={{ padding: '8px 24px', fontSize: '0.85rem', borderRadius: '14px', fontWeight: 700 }}
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main style={{ flex: 1, position: 'relative', paddingTop: '160px', overflow: 'hidden' }}>
        {/* Dynamic Background Elements */}
        <div className="blob" style={{ 
          position: 'absolute', top: '5%', right: '-5%', width: '45vw', height: '45vw',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
          zIndex: 0, animation: 'pulse 10s infinite alternate'
        }} />
        <div className="blob" style={{ 
          position: 'absolute', bottom: '15%', left: '-10%', width: '35vw', height: '35vw',
          background: 'radial-gradient(circle, rgba(236, 72, 153, 0.12) 0%, transparent 70%)',
          zIndex: 0, animation: 'pulse 8s infinite alternate-reverse'
        }} />

        <div className="main-container" style={{ position: 'relative', zIndex: 10 }}>
          <div className="animate-entrance" style={{ textAlign: 'center', maxWidth: '900px', margin: '0 auto 100px auto' }}>
            <div style={{ 
              display: 'inline-flex', alignItems: 'center', gap: '8px', 
              padding: '8px 20px', background: 'var(--bg-card)', 
              borderRadius: 'var(--radius-full)', border: '1px solid var(--border)', 
              marginBottom: '32px', boxShadow: 'var(--shadow-md)',
              animation: 'bounce 3s infinite'
            }}>
              <Zap size={14} color="var(--warning)" fill="var(--warning)" />
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Split Smart. Live Easy.
              </span>
            </div>
            
            <h1 style={{ fontSize: 'clamp(2.5rem, 8vw, 5.5rem)', fontWeight: 800, lineHeight: 1.05, marginBottom: '28px', letterSpacing: '-0.04em' }}>
              Financial Clarity <br />
              <span className="gradient-text">For Every Circle.</span>
            </h1>
            
            <p style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)', color: 'var(--text-secondary)', marginBottom: '48px', maxWidth: '650px', margin: '0 auto 48px auto', lineHeight: 1.6 }}>
              The premium way to track shared expenses, settle debts, and maintain financial transparency with friends and family.
            </p>

            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => navigate('/login')} className="btn btn-primary card-hover" style={{ padding: '18px 42px', fontSize: '1.1rem', borderRadius: 'var(--radius-lg)', boxShadow: '0 15px 35px var(--accent-glow)' }}>
                Start Free Account <ArrowRight size={20} />
              </button>
              <button onClick={() => navigate('/login')} className="btn glass card-hover" style={{ padding: '18px 42px', fontSize: '1.1rem', borderRadius: 'var(--radius-lg)', color: 'var(--text-primary)' }}>
                Watch Demo
              </button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="animate-entrance" style={{ animationDelay: '0.2s', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '140px' }}>
            {[
              { icon: Zap, title: "Instant Sync", desc: "Real-time updates across all devices powered by our lightning-fast architecture." },
              { icon: Users, title: "Social Hub", desc: "Built-in friend discovery, profile bios, and interactive activity feeds." },
              { icon: Shield, title: "Vault Security", desc: "Military-grade encryption and isolated data buckets for your financial privacy." },
              { icon: Activity, title: "Smart Analytics", desc: "Deep insights into your spending habits with beautiful data visualizations." }
            ].map((feature, idx) => (
              <div key={idx} className="glass card-hover" style={{ padding: '40px 32px', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)' }}>
                <div style={{ 
                  width: '56px', height: '56px', borderRadius: '16px', 
                  background: 'var(--accent-glow)', color: 'var(--accent-1)', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px'
                }}>
                  <feature.icon size={26} />
                </div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '14px' }}>{feature.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.6 }}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Premium Footer with Personal Details */}
      <footer className="glass" style={{ 
        marginTop: 'auto', borderTop: '1px solid var(--border)', 
        padding: '80px 24px 40px 24px', borderRadius: '60px 60px 0 0'
      }}>
        <div className="main-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '60px', marginBottom: '80px' }}>
          {/* Brand Col */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{ width: '36px', height: '36px', background: 'var(--accent-gradient)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                <Wallet size={20} />
              </div>
              <span style={{ fontSize: '1.25rem', fontWeight: 800 }}>SplitEase</span>
            </div>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: '280px' }}>
              Redefining social finance through transparency and world-class design. Build stronger bonds, one split at a time.
            </p>
          </div>

          {/* Developer Col (Detailed Info) */}
          <div style={{ background: 'var(--accent-subtle)', padding: '32px', borderRadius: '24px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)' }}>
            <h4 style={{ fontSize: '0.8rem', fontWeight: 800, marginBottom: '24px', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Lead Architect</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '0.7rem' }}>HK</div>
                <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Hamid Ali Khan (Kalhoro)</span>
              </div>
              <a href="https://instagram.com/hamidi_2005" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)', textDecoration: 'none' }} className="footer-link">
                <InstagramIcon size={20} />
                <span style={{ fontSize: '0.95rem' }}>@hamidi_2005</span>
                <ExternalLink size={14} style={{ opacity: 0.4 }} />
              </a>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)' }}>
                <Phone size={18} color="#25D366" />
                <span style={{ fontSize: '0.95rem' }}>+92 370 9155088</span>
              </div>
              <a href="mailto:hamidkalhoro.in@gmail.com" style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)', textDecoration: 'none' }} className="footer-link">
                <Mail size={18} color="var(--accent-1)" />
                <span style={{ fontSize: '0.95rem' }}>hamidkalhoro.in@gmail.com</span>
              </a>
            </div>
          </div>

          {/* Social Col */}
          <div>
            <h4 style={{ fontSize: '0.8rem', fontWeight: 800, marginBottom: '24px', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Connect</h4>
            <div style={{ display: 'flex', gap: '16px' }}>
              {[Code, Share2].map((Icon, i) => (
                <button key={i} className="icon-btn card-hover" style={{ width: '48px', height: '48px', borderRadius: '14px' }}>
                  <Icon size={20} />
                </button>
              ))}
              <button className="icon-btn card-hover" style={{ width: '48px', height: '48px', borderRadius: '14px' }}>
                <InstagramIcon size={20} />
              </button>
            </div>
          </div>
        </div>

        <div style={{ 
          borderTop: '1px solid var(--border)', paddingTop: '40px', 
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' 
        }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            © 2026 SplitEase. Designed & Developed by <span className="gradient-text" style={{ fontWeight: 800 }}>Hamid Ali Kalhoro</span>.
          </p>
          <div style={{ display: 'flex', gap: '24px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', cursor: 'pointer' }} className="nav-link">Privacy Policy</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', cursor: 'pointer' }} className="nav-link">Terms of Service</span>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes pulse {
          from { transform: scale(1); opacity: 0.8; }
          to { transform: scale(1.1); opacity: 1; }
        }
        .nav-link {
          font-size: 0.9rem;
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
          transform: translateX(5px);
        }
        .footer-link {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .gradient-text {
          background: var(--accent-gradient);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
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
