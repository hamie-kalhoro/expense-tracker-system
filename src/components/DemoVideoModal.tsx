import React, { useState, useEffect } from 'react';
import { X, Play, Info, CheckCircle, Zap, AlertCircle } from 'lucide-react';
// Using the public folder path for production availability
const demoVideoPath = "/video/demo-walkthrough.mp4";

interface DemoVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DemoVideoModal: React.FC<DemoVideoModalProps> = ({ isOpen, onClose }) => {
  const [isExiting, setIsExiting] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setVideoError(false);
      setIsLoading(true);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsExiting(false);
      onClose();
    }, 400);
  };

  if (!isOpen && !isExiting) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'var(--bg-overlay)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px',
        backdropFilter: 'blur(12px)',
        animation: isExiting ? 'demoFadeOut 0.4s ease-out forwards' : 'fadeIn 0.5s ease-out',
      }}
      onClick={handleClose}
    >
      <div
        className="glass"
        style={{
          maxWidth: '1000px',
          width: '100%',
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          boxShadow: '0 40px 100px rgba(0,0,0,0.3), 0 0 0 1px var(--border)',
          animation: isExiting ? 'demoSlideOut 0.4s ease-out forwards' : 'demoSlideIn 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
          position: 'relative',
          background: 'var(--bg-modal)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg-elevated)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'var(--accent-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
            }}>
              <Play size={18} fill="currentColor" />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>Product Walkthrough</h3>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: 0, fontWeight: 600 }}>See SplitEase in Action</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent-1)', e.currentTarget.style.color = 'var(--accent-1)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)', e.currentTarget.style.color = 'var(--text-secondary)')}
          >
            <X size={18} />
          </button>
        </div>

        {/* Video Player Area */}
        <div style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16/9',
          background: '#000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {isLoading && !videoError && (
            <div style={{ position: 'absolute', zIndex: 10, textAlign: 'center' }}>
              <div className="spinner" style={{ width: '40px', height: '40px', borderTopColor: 'var(--accent-1)', margin: '0 auto 16px auto' }}></div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Buffering Walkthrough...</p>
            </div>
          )}

          {videoError ? (
            <div style={{ textAlign: 'center', padding: '40px', zIndex: 20 }}>
              <AlertCircle size={48} color="var(--error)" style={{ marginBottom: '16px' }} />
              <h4 style={{ color: 'white', marginBottom: '8px' }}>Unable to Play Video</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto 20px auto' }}>
                We encountered an issue loading the demo video. This could be due to file size, format support, or a connection timeout.
              </p>
              <button 
                className="btn glass" 
                onClick={() => { setVideoError(false); setIsLoading(true); }}
                style={{ padding: '8px 20px', fontSize: '0.85rem', color: 'white' }}
              >
                Try Again
              </button>
            </div>
          ) : (
            <video
              src={demoVideoPath}
              controls
              autoPlay
              muted
              playsInline
              onCanPlay={() => setIsLoading(false)}
              onError={() => {
                setVideoError(true);
                setIsLoading(false);
              }}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                opacity: isLoading ? 0 : 1,
                transition: 'opacity 0.3s ease',
              }}
            />
          )}
        </div>

        {/* Info Footer */}
        <div style={{
          padding: '24px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          background: 'var(--bg-elevated)',
          borderTop: '1px solid var(--border)',
        }}>
          {[
            { icon: Zap, text: 'Real-time syncing shown', color: 'var(--warning)' },
            { icon: CheckCircle, text: 'Expense splitting process', color: 'var(--success)' },
            { icon: Info, text: 'Social profile management', color: 'var(--accent-1)' },
          ].map((item, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <item.icon size={16} color={item.color} />
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes demoSlideIn {
          from { opacity: 0; transform: translateY(30px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes demoSlideOut {
          from { opacity: 1; transform: translateY(0) scale(1); }
          to { opacity: 0; transform: translateY(20px) scale(0.98); }
        }
        @keyframes demoFadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default DemoVideoModal;
