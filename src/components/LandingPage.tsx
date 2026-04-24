import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Wallet, Activity, Users, Shield, Zap, ArrowRight, 
  CheckCircle, Sun, Moon, Instagram, Phone, Mail, 
  User, Github, Twitter
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const navItemStyle = {
    fontSize: '0.9rem',
    fontWeight: 600,
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    transition: 'color 0.2s',
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Premium Navigation Bar */}
      <nav className="glass" style={{ 
        position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)',
        width: 'calc(100% - 40px)', maxWidth: '1200px', height: '70px',
        borderRadius: 'var(--radius-lg)', zIndex: 100, display: 'flex',
        alignItems: 'center', justifyContent: 'space-between', padding: '0 32px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            width: '40px', height: '40px', background: 'var(--accent-gradient)',
            borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
          }}>
            <Wallet size={22} />
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em' }}>SplitEase</span>
        </div>

        <div className="nav-tabs" style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <span style={navItemStyle} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-1)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}>Features</span>
          <span style={navItemStyle} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-1)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}>Solutions</span>
          <span style={navItemStyle} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-1)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}>About</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={toggleTheme} className="icon-btn" style={{ borderRadius: 'var(--radius-md)', width: '42px', height: '42px' }}>
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <button 
            onClick={() => navigate('/login')}
            className="btn btn-primary" 
            style={{ padding: '10px 24px', fontSize: '0.85rem' }}
          >
            Launch App
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main style={{ flex: 1, position: 'relative', paddingTop: '160px' }}>
        {/* Background Blobs */}
        <div className="blob" style={{ 
          position: 'absolute', top: '10%', right: '5%', width: '40vw', height: '40vw',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 70%)',
          zIndex: 0
        }} />
        <div className="blob" style={{ 
          position: 'absolute', bottom: '20%', left: '-5%', width: '30vw', height: '30vw',
          background: 'radial-gradient(circle, rgba(236, 72, 153, 0.08) 0%, transparent 70%)',
          zIndex: 0
        }} />

        <div className="main-container" style={{ position: 'relative', zIndex: 10 }}>
          <div className="animate-entrance" style={{ textAlign: 'center', maxWidth: '900px', margin: '0 auto 120px auto' }}>
            <div style={{ 
              display: 'inline-flex', alignItems: 'center', gap: '10px', 
              padding: '10px 20px', background: 'var(--bg-card)', 
              borderRadius: 'var(--radius-full)', border: '1px solid var(--border)', 
              marginBottom: '40px', boxShadow: 'var(--shadow-md)',
              animation: 'bounce 3s infinite'
            }}>
              <Zap size={16} color="var(--warning)" fill="var(--warning)" />
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.02em' }}>
                EXPERIENCE THE NEW GOLD STANDARD
              </span>
            </div>
            
            <h1 style={{ fontSize: 'clamp(3.5rem, 9vw, 6rem)', fontWeight: 800, lineHeight: 1, marginBottom: '32px', letterSpacing: '-0.04em' }}>
              Effortless Splitting <br />
              <span className="gradient-text">Beautifully Solved.</span>
            </h1>
            
            <p style={{ fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)', color: 'var(--text-secondary)', marginBottom: '56px', maxWidth: '650px', margin: '0 auto 56px auto', lineHeight: 1.6, opacity: 0.9 }}>
              Track shared expenses with friends, manage group debts, and visualize your financial growth in one stunning, secure platform.
            </p>

            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => navigate('/login')} className="btn btn-primary card-hover" style={{ padding: '18px 42px', fontSize: '1.1rem', borderRadius: 'var(--radius-lg)' }}>
                Get Started Free <ArrowRight size={20} />
              </button>
              <button onClick={() => navigate('/login')} className="btn glass card-hover" style={{ padding: '18px 42px', fontSize: '1.1rem', borderRadius: 'var(--radius-lg)', color: 'var(--text-primary)' }}>
                View Demo
              </button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="animate-entrance" style={{ animationDelay: '0.2s', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '32px', marginBottom: '140px' }}>
            {[
              { icon: Zap, title: "Lightning Sync", desc: "Real-time updates across all platforms powered by high-performance edge database architecture." },
              { icon: Users, title: "Social Graph", desc: "Intuitive friend discovery and group management designed for modern social circles." },
              { icon: Shield, title: "Ironclad Security", desc: "Enterprise-grade encryption and Row Level Security ensures your data stays your data." },
              { icon: Activity, title: "Visual Analytics", desc: "Deep financial insights delivered through beautiful, interactive charts and summaries." }
            ].map((feature, idx) => (
              <div key={idx} className="glass card-hover" style={{ padding: '40px', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)' }}>
                <div style={{ 
                  width: '56px', height: '56px', borderRadius: '16px', 
                  background: 'var(--accent-glow)', color: 'var(--accent-1)', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px'
                }}>
                  <feature.icon size={28} />
                </div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '16px' }}>{feature.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.6 }}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Premium Footer with Personal Details */}
      <footer className="glass" style={{ 
        marginTop: 'auto', borderTop: '1px solid var(--border)', 
        padding: '80px 40px 40px 40px', borderRadius: '40px 40px 0 0'
      }}>
        <div className="main-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '60px', marginBottom: '80px' }}>
          {/* Brand Col */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{ width: '36px', height: '36px', background: 'var(--accent-gradient)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                <Wallet size={20} />
              </div>
              <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>SplitEase</span>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: '240px' }}>
              Redefining financial clarity for friends and families across the globe. Built with passion and precision.
            </p>
          </div>

          {/* Developer Col (Detailed Info) */}
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '24px', color: 'var(--text-primary)' }}>Developer</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)' }}>
                <User size={18} color="var(--accent-1)" />
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{`Hamid Ali Khan (Kalhoro)`}</span>
              </div>
              <a href="https://instagram.com/hamidi_2005" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)', transition: 'color 0.2s' }}>
                <Instagram size={18} color="#E4405F" />
                <span style={{ fontSize: '0.9rem' }}>@hamidi_2005</span>
              </a>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)' }}>
                <Phone size={18} color="#25D366" />
                <span style={{ fontSize: '0.9rem' }}>+92 370 9155088</span>
              </div>
              <a href="mailto:hamidkalhoro.in@gmail.com" style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)', transition: 'color 0.2s' }}>
                <Mail size={18} color="var(--accent-1)" />
                <span style={{ fontSize: '0.9rem' }}>hamidkalhoro.in@gmail.com</span>
              </a>
            </div>
          </div>

          {/* Social Col */}
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '24px', color: 'var(--text-primary)' }}>Connect</h4>
            <div style={{ display: 'flex', gap: '16px' }}>
              {[Github, Twitter, Instagram].map((Icon, i) => (
                <button key={i} className="icon-btn" style={{ width: '44px', height: '44px', borderRadius: '14px' }}>
                  <Icon size={20} />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ 
          borderTop: '1px solid var(--border)', paddingTop: '40px', 
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' 
        }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            © 2026 SplitEase. All rights reserved. Designed by <span style={{ color: 'var(--accent-1)', fontWeight: 600 }}>Hamid Ali Kalhoro</span>.
          </p>
          <div style={{ display: 'flex', gap: '24px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', cursor: 'pointer' }}>Privacy Policy</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', cursor: 'pointer' }}>Terms of Use</span>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
