import React from 'react';

interface SplitEaseLogoProps {
  size?: number;
  showText?: boolean;
  textSize?: string;
  onClick?: () => void;
}

/**
 * Premium SplitEase Logo — Inline SVG icon + wordmark
 * Uses the app's accent gradient for consistent branding
 */
const SplitEaseLogo: React.FC<SplitEaseLogoProps> = ({
  size = 40,
  showText = true,
  textSize = '1.25rem',
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        cursor: onClick ? 'pointer' : 'default',
        userSelect: 'none',
      }}
    >
      {/* Logo Icon */}
      <div style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: `${Math.round(size * 0.28)}px`,
        background: 'var(--accent-gradient)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 8px 20px var(--accent-glow)',
        position: 'relative',
        overflow: 'hidden',
        flexShrink: 0,
      }}>
        {/* Subtle shine effect */}
        <div style={{
          position: 'absolute',
          top: '-50%',
          left: '-50%',
          width: '200%',
          height: '200%',
          background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 60%)',
          pointerEvents: 'none',
        }} />
        <svg
          width={size * 0.55}
          height={size * 0.55}
          viewBox="0 0 24 24"
          fill="none"
          style={{ position: 'relative', zIndex: 1 }}
        >
          {/* Stylized S path */}
          <path
            d="M16 6C13.5 6 10 7 10 10C10 15 18 13 18 16C18 18 14 19 11 19"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
          {/* Split dots */}
          <circle cx="7" cy="12.5" r="1.8" fill="white" opacity="0.65" />
          <circle cx="21" cy="12.5" r="1.8" fill="white" opacity="0.65" />
        </svg>
      </div>

      {/* Wordmark */}
      {showText && (
        <h1 style={{
          fontSize: textSize,
          fontWeight: 800,
          letterSpacing: '-0.02em',
          margin: 0,
          lineHeight: 1,
        }}>
          Split<span className="gradient-text">Ease</span>
        </h1>
      )}
    </div>
  );
};

export default SplitEaseLogo;
