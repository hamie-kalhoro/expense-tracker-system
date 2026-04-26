import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase/config';
import {
  Wallet, Activity, Users, Shield, Zap, ArrowRight,
  CheckCircle, Sun, Moon, Phone, Mail,
  User, ExternalLink, Code, Share2, Star
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import WelcomeModal from './WelcomeModal';
import DemoVideoModal from './DemoVideoModal';
import SplitEaseLogo from './SplitEaseLogo';


const LinkedinIcon = ({ size = 20, color = 'currentColor' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const GithubIcon = ({ size = 20, color = 'currentColor' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

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

  const [stats, setStats] = useState({
    users: 0,
    rating: 0,
    expenses: 0
  });
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [showFreeBanner, setShowFreeBanner] = useState(false);
  const [recentReviews, setRecentReviews] = useState<any[]>([]);


  useEffect(() => {
    async function fetchStats() {
      try {
        const { data, error } = await supabase.rpc('get_platform_stats');

        if (data && data.length > 0 && !error) {
          const stats = data[0];
          setStats({
            users: Number(stats.total_users),
            rating: Number(stats.avg_rating),
            expenses: Number(stats.total_expenses)
          });
        }
        
        // Fetch real user reviews that have text
        const { data: reviewData } = await supabase
          .from('reviews')
          .select('id, rating, suggestion, created_at, user:users(username, display_name)')
          .not('suggestion', 'is', null)
          .neq('suggestion', '')
          .order('created_at', { ascending: false })
          .limit(3);
          
        if (reviewData) {
          setRecentReviews(reviewData);
        }
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
    }
    fetchStats();
  }, []);

  const formatNumber = (num: number, isCurrency: boolean) => {
    if (num >= 1000000) return `${isCurrency ? '$' : ''}${(num / 1000000).toFixed(1)}M+`;
    if (num >= 1000) return `${isCurrency ? '$' : ''}${(num / 1000).toFixed(1)}K+`;
    return `${isCurrency ? '$' : ''}${num.toString()}`;
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Animated Premium Background */}
      <div className="animated-mesh-bg" />
      <div className="mesh-glow" />
      
      {/* Welcome Modal for New Users */}
      <WelcomeModal />

      {/* Demo Video Walkthrough */}
      <DemoVideoModal isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />


      {/* Premium Navigation Bar */}
      <nav className="glass" style={{
        position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)',
        width: 'calc(100% - 32px)', maxWidth: '1200px', height: '70px',
        borderRadius: 'var(--radius-lg)', zIndex: 100, display: 'flex',
        alignItems: 'center', justifyContent: 'space-between', padding: '0 24px',
        boxShadow: 'var(--shadow-lg)'
      }}>
        <SplitEaseLogo size={38} />

        <div className="nav-tabs-desktop" style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <span className="nav-link" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>Features</span>
          <span className="nav-link" onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}>About</span>
          <span className="nav-link" onClick={() => {
            setShowFreeBanner(true);
            setTimeout(() => setShowFreeBanner(false), 2000);
          }}>Pricing</span>
        </div>

        <div className="theme-toggle-wrapper">
          <button
            onClick={() => navigate('/login')}
            className="btn btn-primary"
            style={{ padding: '8px 24px', fontSize: '0.85rem', borderRadius: '14px', fontWeight: 700 }}
          >
            Get Started
          </button>
          <button onClick={toggleTheme} className="icon-btn theme-spin" style={{ borderRadius: '12px', width: '40px', height: '40px' }}>
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </div>
      </nav>

      {/* Dynamic "Free For All" Banner */}
      {showFreeBanner && (
        <div style={{
          position: 'fixed', top: '110px', left: '50%', transform: 'translateX(-50%)',
          zIndex: 1000, pointerEvents: 'none', width: 'auto', minWidth: '320px'
        }}>
          <div className="glass" style={{
            padding: '16px 28px', borderRadius: 'var(--radius-lg)',
            background: theme === 'dark' ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            color: 'var(--text-primary)',
            display: 'flex', alignItems: 'center', gap: '16px',
            boxShadow: 'var(--shadow-xl)',
            border: '2px solid var(--accent-1)',
            backdropFilter: 'blur(16px)',
            animation: 'slideDown 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
          }}>
            <div style={{ 
              background: 'var(--accent-gradient)', 
              padding: '10px', 
              borderRadius: '12px',
              boxShadow: '0 4px 12px var(--accent-glow)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Zap size={20} color="white" fill="white" />
            </div>
            <div>
              <p style={{ margin: 0, fontWeight: 800, fontSize: '1rem', letterSpacing: '0.02em', color: 'var(--text-primary)' }}>100% Free For Everyone</p>
              <p style={{ margin: 0, fontSize: '0.75rem', opacity: 0.8, fontWeight: 600, color: 'var(--text-secondary)' }}>No hidden fees. No premium tiers. Just SplitEase.</p>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <main style={{ flex: 1, position: 'relative', paddingTop: 'clamp(100px, 12vh, 160px)', overflow: 'hidden' }}>
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
          <div className="animate-entrance" style={{ textAlign: 'center', maxWidth: '900px', margin: '0 auto 80px auto' }}>
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
              <button onClick={() => setIsDemoOpen(true)} className="btn glass card-hover" style={{ padding: '18px 42px', fontSize: '1.1rem', borderRadius: 'var(--radius-lg)', color: 'var(--text-primary)' }}>
                Watch Demo
              </button>

            </div>
          </div>

          {/* Features Grid */}
          <div id="features" className="animate-entrance" style={{ animationDelay: '0.2s', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '140px' }}>
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

          {/* Social Proof / Stats Concept */}
          <div className="glass animate-entrance stats-container" style={{
            animationDelay: '0.4s', borderRadius: 'var(--radius-xl)',
            marginBottom: '140px',
            border: '1px solid var(--border)', background: 'var(--bg-elevated)'
          }}>
            <div className="stat-item" style={{ textAlign: 'center' }}>
              <div className="stat-number gradient-text" style={{ fontWeight: 900, lineHeight: 1 }}>
                {formatNumber(stats.users, false)}
              </div>
              <p className="stat-label">Active Users</p>
            </div>

            <div className="stats-divider" style={{ background: 'var(--border)' }} />

            <div className="stat-item" style={{ textAlign: 'center' }}>
              <div className="stat-number" style={{ fontWeight: 900, color: 'var(--warning)', lineHeight: 1 }}>
                {stats.rating > 0 ? stats.rating.toFixed(1) : '0.0'}
              </div>
              <p className="stat-label">Average Rating</p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginTop: '8px' }}>
                {[1, 2, 3, 4, 5].map(i => <Star key={i} size={16} fill={i <= Math.round(stats.rating) ? "var(--warning)" : "transparent"} color="var(--warning)" />)}
              </div>
            </div>

            <div className="stats-divider" style={{ background: 'var(--border)' }} />

            <div className="stat-item" style={{ textAlign: 'center' }}>
              <div className="stat-number" style={{ fontWeight: 900, color: 'var(--success)', lineHeight: 1 }}>
                {formatNumber(stats.expenses, true)}
              </div>
              <p className="stat-label">Expenses Split</p>
            </div>
          </div>

          {/* Live User Reviews Section */}
          {recentReviews.length > 0 && (
            <div className="animate-entrance" style={{ animationDelay: '0.6s', width: '100%', maxWidth: '1200px', margin: '0 auto 140px auto' }}>
              <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  padding: '6px 16px', background: 'var(--bg-card)',
                  borderRadius: 'var(--radius-full)', border: '1px solid var(--border)',
                  marginBottom: '16px'
                }}>
                  <Star size={12} color="var(--warning)" fill="var(--warning)" />
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    Real Feedback
                  </span>
                </div>
                <h3 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 800, marginBottom: '16px' }}>Loved by Friends Everywhere</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>See what our community is saying about SplitEase.</p>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
                {recentReviews.map(review => (
                  <div key={review.id} className="glass card-hover" style={{ padding: '32px', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div className="avatar" style={{ width: '44px', height: '44px', background: 'var(--accent-gradient)', color: 'white', fontWeight: 800, fontSize: '1.1rem' }}>
                          {review.user?.display_name?.[0]?.toUpperCase() || review.user?.username?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p style={{ margin: 0, fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>{review.user?.display_name || review.user?.username}</p>
                          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>@{review.user?.username}</p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '2px', background: 'var(--bg-elevated)', padding: '6px 10px', borderRadius: 'var(--radius-full)' }}>
                        {[1, 2, 3, 4, 5].map(i => <Star key={i} size={12} fill={i <= review.rating ? "var(--warning)" : "transparent"} color="var(--warning)" />)}
                      </div>
                    </div>
                    <p style={{ margin: 0, fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.6, fontStyle: 'italic' }}>
                      "{review.suggestion}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Premium Footer with Personal Details */}
      <footer id="about" className="glass" style={{
        marginTop: 'auto', borderTop: '1px solid var(--border)',
        padding: '80px 24px 40px 24px', borderRadius: '60px 60px 0 0'
      }}>
        <div className="main-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '60px', marginBottom: '80px' }}>
          {/* Brand Col */}
          <div>
            <div style={{ marginBottom: '24px' }}>
              <SplitEaseLogo size={36} />
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
                <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Hamid Ali Kalhoro</span>
              </div>
              <a href="https://www.instagram.com/hamidi_2oo5/" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)', textDecoration: 'none' }} className="footer-link">
                <InstagramIcon size={20} />
                <span style={{ fontSize: '0.95rem' }}>@hamidi_2oo5</span>
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
              <a href="https://github.com/hamie-kalhoro" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)', textDecoration: 'none' }} className="footer-link">
                <GithubIcon size={18} color="var(--text-secondary)" />
                <span style={{ fontSize: '0.95rem' }}>github.com/hamie-kalhoro</span>
                <ExternalLink size={14} style={{ opacity: 0.4 }} />
              </a>
              <a href="https://www.linkedin.com/in/hamid-ali-a46426275/" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)', textDecoration: 'none' }} className="footer-link">
                <LinkedinIcon size={18} color="#0077b5" />
                <span style={{ fontSize: '0.95rem' }}>Hamid Ali</span>
                <ExternalLink size={14} style={{ opacity: 0.4 }} />
              </a>
            </div>
          </div>

          {/* Social Col */}
          <div>
            <h4 style={{ fontSize: '0.8rem', fontWeight: 800, marginBottom: '24px', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Connect</h4>
            <div style={{ display: 'flex', gap: '16px' }}>
              <a href="https://github.com/hamie-kalhoro" target="_blank" rel="noopener noreferrer" className="icon-btn card-hover" style={{ width: '48px', height: '48px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'inherit', textDecoration: 'none' }}>
                <GithubIcon size={20} />
              </a>
              <a href="https://www.linkedin.com/in/hamid-ali-a46426275/" target="_blank" rel="noopener noreferrer" className="icon-btn card-hover" style={{ width: '48px', height: '48px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'inherit', textDecoration: 'none' }}>
                <LinkedinIcon size={20} />
              </a>
              <a href="https://www.instagram.com/hamidi_2oo5/" target="_blank" rel="noopener noreferrer" className="icon-btn card-hover" style={{ width: '48px', height: '48px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'inherit', textDecoration: 'none' }}>
                <InstagramIcon size={20} />
              </a>
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
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
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
        .stats-container {
          padding: 40px 24px;
          display: flex;
          flex-wrap: wrap;
          gap: 40px;
          justify-content: space-around;
          align-items: center;
        }
        .stat-number { font-size: 3.5rem; }
        .stat-label { margin: 8px 0 0; font-weight: 700; color: var(--text-secondary); }
        .stats-divider { width: 1px; height: 60px; }

        @media (max-width: 768px) {
          .nav-tabs-desktop {
            display: none !important;
          }
          .stats-container {
            flex-direction: column;
            padding: 32px 20px;
            gap: 24px;
          }
          .stats-divider {
            width: 80px;
            height: 1px;
          }
          .stat-number { font-size: 2.8rem; }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
