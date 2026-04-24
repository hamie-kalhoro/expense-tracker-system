import React, { useState, useEffect } from 'react';
import {
  X, Star, Heart, Send, MessageSquare, Sparkles,
  ThumbsUp, Coffee, Rocket, Lightbulb, CheckCircle
} from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';

const REVIEW_KEY = 'splitease_review_submitted';
const REVIEW_DISMISSED_KEY = 'splitease_review_dismissed';

const ReviewModal: React.FC = () => {
  const { expenses } = useData();
  const { userProfile } = useAuth();
  const [visible, setVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [suggestion, setSuggestion] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [step, setStep] = useState<'rate' | 'suggest' | 'thanks'>('rate');

  useEffect(() => {
    const alreadySubmitted = localStorage.getItem(REVIEW_KEY);
    const dismissed = localStorage.getItem(REVIEW_DISMISSED_KEY);

    if (alreadySubmitted || dismissed) return;

    // Count expenses created by the current user
    if (expenses.length >= 5 && userProfile) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [expenses.length, userProfile]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      localStorage.setItem(REVIEW_DISMISSED_KEY, 'true');
      setVisible(false);
    }, 400);
  };

  const handleSubmitRating = () => {
    if (rating === 0) return;
    setStep('suggest');
  };

  const handleSubmitSuggestion = () => {
    // Store review data in localStorage (could be sent to Supabase in production)
    const reviewData = {
      rating,
      suggestion: suggestion.trim(),
      username: userProfile?.username || 'anonymous',
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(REVIEW_KEY, JSON.stringify(reviewData));
    setSubmitted(true);
    setStep('thanks');
  };

  const handleSkipSuggestion = () => {
    const reviewData = {
      rating,
      suggestion: '',
      username: userProfile?.username || 'anonymous',
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(REVIEW_KEY, JSON.stringify(reviewData));
    setSubmitted(true);
    setStep('thanks');
  };

  if (!visible) return null;

  const ratingLabels = ['', 'Needs Work', 'Fair', 'Good', 'Great', 'Amazing!'];
  const ratingEmojis = ['', '😕', '🤔', '😊', '😄', '🤩'];

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'var(--bg-overlay)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 9998, padding: '20px',
        backdropFilter: 'blur(12px)',
        animation: isExiting ? 'reviewFadeOut 0.4s ease-out forwards' : 'fadeIn 0.5s ease-out',
      }}
      onClick={(e) => { if (e.target === e.currentTarget && step !== 'thanks') handleClose(); }}
    >
      <div
        className="glass"
        style={{
          maxWidth: '480px', width: '100%',
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          boxShadow: '0 40px 100px rgba(0,0,0,0.25), 0 0 0 1px var(--border)',
          animation: isExiting ? 'reviewSlideOut 0.4s ease-out forwards' : 'reviewSlideIn 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Header */}
        <div style={{
          position: 'relative',
          overflow: 'hidden',
          padding: '28px 28px 24px',
          background: step === 'thanks'
            ? 'linear-gradient(135deg, #10b981 0%, #34d399 50%, #6ee7b7 100%)'
            : 'var(--accent-gradient)',
          transition: 'background 0.5s ease',
        }}>
          {/* Floating particles */}
          <div style={{
            position: 'absolute', top: '10px', right: '40px',
            width: '12px', height: '12px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)',
            animation: 'reviewFloat 3s infinite ease-in-out',
          }} />
          <div style={{
            position: 'absolute', bottom: '15px', left: '25%',
            width: '8px', height: '8px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.15)',
            animation: 'reviewFloat 4s infinite ease-in-out 1s',
          }} />
          <div style={{
            position: 'absolute', top: '40%', right: '15%',
            width: '6px', height: '6px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
            animation: 'reviewFloat 3.5s infinite ease-in-out 0.5s',
          }} />

          <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '5px 12px', borderRadius: 'var(--radius-full)',
                background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(4px)',
                fontSize: '0.65rem', fontWeight: 800, color: 'white',
                letterSpacing: '0.08em', textTransform: 'uppercase',
                marginBottom: '14px',
              }}>
                <Sparkles size={10} />
                {step === 'thanks' ? 'THANK YOU' : 'MILESTONE UNLOCKED'}
              </div>
              <h3 style={{ color: 'white', fontSize: '1.35rem', fontWeight: 800, margin: 0, lineHeight: 1.2 }}>
                {step === 'thanks' ? 'You\'re Awesome! 🎉' : 'You\'ve Hit 5 Expenses! 🎯'}
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.82rem', margin: '8px 0 0', fontWeight: 500 }}>
                {step === 'thanks'
                  ? 'Your feedback means the world to us.'
                  : 'We\'d love to hear what you think so far.'}
              </p>
            </div>
            {step !== 'thanks' && (
              <button
                onClick={handleClose}
                style={{
                  background: 'rgba(255,255,255,0.12)', border: 'none',
                  borderRadius: '10px', width: '34px', height: '34px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: 'white', transition: 'all 0.2s',
                  flexShrink: 0,
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.2)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '28px' }}>
          {/* STEP 1: Rating */}
          {step === 'rate' && (
            <div style={{ animation: 'reviewContentIn 0.3s ease-out' }}>
              <p style={{
                textAlign: 'center', fontSize: '0.88rem', fontWeight: 600,
                color: 'var(--text-secondary)', marginBottom: '24px',
              }}>
                How would you rate your SplitEase experience?
              </p>

              {/* Star Rating */}
              <div style={{
                display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '16px',
              }}>
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredStar(star)}
                    onMouseLeave={() => setHoveredStar(0)}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      padding: '8px', borderRadius: '12px',
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      transform: (hoveredStar >= star || rating >= star) ? 'scale(1.2)' : 'scale(1)',
                    }}
                  >
                    <Star
                      size={36}
                      fill={(hoveredStar >= star || rating >= star) ? '#fbbf24' : 'none'}
                      color={(hoveredStar >= star || rating >= star) ? '#fbbf24' : 'var(--text-muted)'}
                      strokeWidth={1.5}
                      style={{ transition: 'all 0.2s', filter: (hoveredStar >= star || rating >= star) ? 'drop-shadow(0 4px 8px rgba(251, 191, 36, 0.4))' : 'none' }}
                    />
                  </button>
                ))}
              </div>

              {/* Rating Label */}
              <div style={{
                textAlign: 'center', height: '36px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: '8px', marginBottom: '24px',
              }}>
                {(hoveredStar > 0 || rating > 0) && (
                  <span style={{
                    fontSize: '1.5rem',
                    animation: 'reviewPop 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}>
                    {ratingEmojis[hoveredStar || rating]}
                  </span>
                )}
                <span style={{
                  fontSize: '0.9rem', fontWeight: 700,
                  color: (hoveredStar || rating) >= 4 ? 'var(--success)' : (hoveredStar || rating) >= 3 ? 'var(--warning)' : 'var(--text-secondary)',
                  transition: 'color 0.2s',
                }}>
                  {ratingLabels[hoveredStar || rating] || ''}
                </span>
              </div>

              <button
                onClick={handleSubmitRating}
                disabled={rating === 0}
                className="btn btn-primary"
                style={{
                  width: '100%', padding: '14px',
                  opacity: rating === 0 ? 0.5 : 1,
                  cursor: rating === 0 ? 'not-allowed' : 'pointer',
                  borderRadius: 'var(--radius-lg)',
                  fontSize: '0.95rem',
                }}
              >
                <ThumbsUp size={18} /> Submit Rating
              </button>
            </div>
          )}

          {/* STEP 2: Suggestion */}
          {step === 'suggest' && (
            <div style={{ animation: 'reviewContentIn 0.3s ease-out' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '16px', borderRadius: 'var(--radius-md)',
                background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                marginBottom: '24px',
              }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '12px',
                  background: 'var(--accent-subtle)', color: 'var(--accent-1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Lightbulb size={20} />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    You rated us {rating}/5 {ratingEmojis[rating]}
                  </p>
                  <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Got ideas to make SplitEase even better?
                  </p>
                </div>
              </div>

              <label style={{
                display: 'block', fontSize: '0.78rem', fontWeight: 700,
                color: 'var(--text-secondary)', marginBottom: '10px',
                textTransform: 'uppercase', letterSpacing: '0.05em',
              }}>
                <MessageSquare size={12} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
                Your Suggestion (Optional)
              </label>

              <textarea
                value={suggestion}
                onChange={e => setSuggestion(e.target.value)}
                placeholder="What feature would make your experience even better? Any bugs? We're all ears! ✨"
                maxLength={500}
                style={{
                  width: '100%', minHeight: '120px', resize: 'vertical',
                  padding: '16px', borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                  color: 'var(--text-primary)', fontSize: '0.9rem',
                  fontFamily: 'inherit', lineHeight: 1.6, outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = 'var(--border-focus)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
              />

              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginTop: '8px', marginBottom: '24px',
              }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  {suggestion.length}/500 characters
                </span>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={handleSkipSuggestion}
                  className="btn btn-ghost"
                  style={{ flex: 1, padding: '13px', fontSize: '0.85rem' }}
                >
                  Skip
                </button>
                <button
                  onClick={handleSubmitSuggestion}
                  className="btn btn-primary"
                  style={{ flex: 2, padding: '13px', fontSize: '0.9rem', borderRadius: 'var(--radius-lg)' }}
                >
                  <Send size={16} /> Submit Feedback
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Thank You */}
          {step === 'thanks' && (
            <div style={{
              textAlign: 'center', padding: '12px 0',
              animation: 'reviewContentIn 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
            }}>
              <div style={{
                width: '80px', height: '80px', borderRadius: '50%',
                background: 'var(--success-bg)', border: '3px solid var(--success-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px',
                animation: 'reviewCheckPop 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.2s both',
              }}>
                <CheckCircle size={40} color="var(--success)" />
              </div>

              <h3 style={{
                fontSize: '1.3rem', fontWeight: 800, marginBottom: '8px',
                color: 'var(--text-primary)',
              }}>
                Feedback Received!
              </h3>

              <p style={{
                fontSize: '0.88rem', color: 'var(--text-secondary)',
                lineHeight: 1.6, maxWidth: '320px', margin: '0 auto 8px',
              }}>
                Your {rating}-star review and suggestions will help shape the future of SplitEase.
              </p>

              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: '6px', marginBottom: '24px',
                color: 'var(--text-muted)', fontSize: '0.8rem',
              }}>
                <Heart size={14} fill="var(--error)" color="var(--error)" />
                <span>Made with love by <strong style={{ color: 'var(--text-primary)' }}>Hamid Ali Kalhoro</strong></span>
              </div>

              <button
                onClick={handleClose}
                className="btn btn-primary"
                style={{
                  padding: '14px 36px', fontSize: '0.95rem',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: '0 12px 24px var(--accent-glow)',
                }}
              >
                <Rocket size={18} /> Continue Splitting
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes reviewSlideIn {
          from { opacity: 0; transform: translateY(50px) scale(0.9); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes reviewSlideOut {
          from { opacity: 1; transform: translateY(0) scale(1); }
          to { opacity: 0; transform: translateY(30px) scale(0.95); }
        }
        @keyframes reviewFadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        @keyframes reviewContentIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes reviewPop {
          from { transform: scale(0); }
          50% { transform: scale(1.3); }
          to { transform: scale(1); }
        }
        @keyframes reviewCheckPop {
          from { opacity: 0; transform: scale(0.5); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes reviewFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
};

export default ReviewModal;
