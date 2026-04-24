import React, { useState, useEffect } from 'react';
import {
  X, Wallet, Users, Shield, Zap, TrendingUp,
  Heart, ArrowRight, CheckCircle, Sparkles, Target, Lightbulb
} from 'lucide-react';

const WELCOME_KEY = 'splitease_welcome_seen';

const WelcomeModal: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem(WELCOME_KEY);
    if (!seen) {
      // Small delay to let the page render first
      const timer = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      localStorage.setItem(WELCOME_KEY, 'true');
      setVisible(false);
    }, 400);
  };

  const slides = [
    {
      icon: Target,
      badge: 'THE PROBLEM',
      badgeColor: 'var(--error)',
      badgeBg: 'var(--error-bg)',
      title: 'Splitting Expenses is Broken',
      description: "We've all been there — a group dinner, a shared trip, or monthly rent. Someone pays, promises are made, but tracking who owes what quickly becomes messy. Spreadsheets get lost, texts get forgotten, and friendships get awkward.",
      highlights: [
        { icon: '😤', text: 'Awkward money conversations between friends' },
        { icon: '📱', text: 'Lost track of who paid what & when' },
        { icon: '💸', text: 'Unresolved debts damaging relationships' },
        { icon: '📊', text: 'No clear overview of shared spending' },
      ]
    },
    {
      icon: Lightbulb,
      badge: 'THE VISION',
      badgeColor: 'var(--warning)',
      badgeBg: 'var(--warning-bg)',
      title: 'Why I Built SplitEase',
      description: "As a university student, I constantly struggled with managing shared expenses among friends — hostel bills, food, outings. I realized there wasn't a tool that was both beautiful and truly easy to use. So I built one.",
      highlights: [
        { icon: '🎓', text: 'Born from real student life frustrations' },
        { icon: '🤝', text: 'Designed to preserve friendships, not strain them' },
        { icon: '✨', text: 'Premium design meets zero-complexity' },
        { icon: '🌍', text: 'Free for everyone, everywhere' },
      ]
    },
    {
      icon: Sparkles,
      badge: 'THE BENEFITS',
      badgeColor: 'var(--success)',
      badgeBg: 'var(--success-bg)',
      title: 'What Makes Us Different',
      description: "SplitEase isn't just another expense tracker — it's a financial harmony tool. From instant sync to smart settlements, every feature is designed to eliminate money stress from your social life.",
      highlights: [
        { icon: '⚡', text: 'Real-time sync across all your devices' },
        { icon: '🧠', text: 'Smart settlement algorithm minimizes transfers' },
        { icon: '👥', text: 'Built-in social hub with friends & profiles' },
        { icon: '🔒', text: 'Bank-grade security for your financial data' },
      ]
    }
  ];

  if (!visible) return null;

  const slide = slides[currentSlide];
  const isLastSlide = currentSlide === slides.length - 1;

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'var(--bg-overlay)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 9999, padding: '20px',
        backdropFilter: 'blur(12px)',
        animation: isExiting ? 'welcomeFadeOut 0.4s ease-out forwards' : 'fadeIn 0.5s ease-out',
      }}
    >
      <div
        className="glass"
        style={{
          maxWidth: '580px', width: '100%',
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          boxShadow: '0 40px 100px rgba(0,0,0,0.25), 0 0 0 1px var(--border)',
          animation: isExiting ? 'welcomeSlideOut 0.4s ease-out forwards' : 'welcomeSlideIn 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
          position: 'relative',
        }}
      >
        {/* Decorative Gradient Header */}
        <div style={{
          background: 'var(--accent-gradient)',
          padding: '32px 32px 48px',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Floating decorative orbs */}
          <div style={{
            position: 'absolute', top: '-20px', right: '-20px',
            width: '120px', height: '120px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)', filter: 'blur(1px)',
          }} />
          <div style={{
            position: 'absolute', bottom: '-30px', left: '20%',
            width: '80px', height: '80px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)',
          }} />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '14px',
                background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Wallet size={22} color="white" />
              </div>
              <div>
                <h3 style={{ color: 'white', fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>Welcome to SplitEase</h3>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem', margin: 0, fontWeight: 600 }}>Your Financial Harmony Platform</p>
              </div>
            </div>
            <button
              id="welcome-close-btn"
              onClick={handleClose}
              style={{
                background: 'rgba(255,255,255,0.15)', border: 'none',
                borderRadius: '10px', width: '36px', height: '36px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'white', transition: 'all 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.25)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
            >
              <X size={18} />
            </button>
          </div>

          {/* Slide Indicator Dots */}
          <div style={{
            display: 'flex', gap: '8px', justifyContent: 'center',
            marginTop: '24px', position: 'relative', zIndex: 2,
          }}>
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                style={{
                  width: currentSlide === i ? '28px' : '8px',
                  height: '8px',
                  borderRadius: '4px',
                  background: currentSlide === i ? 'white' : 'rgba(255,255,255,0.35)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              />
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div style={{ padding: '32px', maxHeight: '40vh', overflowY: 'auto', scrollbarWidth: 'none' }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '6px 14px', borderRadius: 'var(--radius-full)',
            background: slide.badgeBg, color: slide.badgeColor,
            fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.1em',
            marginBottom: '20px',
          }}>
            <slide.icon size={12} />
            {slide.badge}
          </div>

          <h2 style={{
            fontSize: '1.6rem', fontWeight: 800,
            marginBottom: '12px', lineHeight: 1.2,
            color: 'var(--text-primary)',
          }}>
            {slide.title}
          </h2>

          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '0.92rem', lineHeight: 1.7,
            marginBottom: '28px',
          }}>
            {slide.description}
          </p>

          {/* Highlights */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {slide.highlights.map((h, i) => (
              <div
                key={i}
                style={{
                  display: 'flex', alignItems: 'center', gap: '14px',
                  padding: '14px 16px', borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border)',
                  animation: `welcomeHighlight 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${0.1 * i}s both`,
                }}
              >
                <span style={{ fontSize: '1.3rem' }}>{h.icon}</span>
                <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>{h.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{
          padding: '20px 32px 28px',
          display: 'flex', gap: '12px', alignItems: 'center',
          borderTop: '1px solid var(--border)',
        }}>
          {currentSlide > 0 && (
            <button
              onClick={() => setCurrentSlide(prev => prev - 1)}
              className="btn btn-ghost"
              style={{ padding: '12px 20px', fontSize: '0.85rem', flex: 0 }}
            >
              Back
            </button>
          )}
          <div style={{ flex: 1 }} />
          {isLastSlide ? (
            <button
              id="welcome-get-started-btn"
              onClick={handleClose}
              className="btn btn-primary"
              style={{
                padding: '14px 32px', fontSize: '0.95rem',
                borderRadius: 'var(--radius-lg)',
                boxShadow: '0 12px 24px var(--accent-glow)',
              }}
            >
              Let's Get Started <ArrowRight size={18} />
            </button>
          ) : (
            <button
              id="welcome-continue-btn"
              onClick={() => setCurrentSlide(prev => prev + 1)}
              className="btn btn-primary"
              style={{
                padding: '14px 32px', fontSize: '0.95rem',
                borderRadius: 'var(--radius-lg)',
              }}
            >
              Continue <ArrowRight size={18} />
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes welcomeSlideIn {
          from { opacity: 0; transform: translateY(40px) scale(0.92); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes welcomeSlideOut {
          from { opacity: 1; transform: translateY(0) scale(1); }
          to { opacity: 0; transform: translateY(30px) scale(0.95); }
        }
        @keyframes welcomeFadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        @keyframes welcomeHighlight {
          from { opacity: 0; transform: translateX(-12px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};

export default WelcomeModal;
