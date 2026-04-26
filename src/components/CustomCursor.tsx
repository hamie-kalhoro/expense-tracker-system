import React, { useEffect, useState } from 'react';

/**
 * Premium Custom Cursor Aura
 * A subtle glowing ring that follows the mouse and expands when hovering over clickable elements.
 */
const CustomCursor: React.FC = () => {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let animationFrameId: number;
    let targetX = -100;
    let targetY = -100;
    
    // Smooth trailing effect using linear interpolation
    let currentX = -100;
    let currentY = -100;

    const onMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      setIsVisible(true);
      
      // Check if hovering over a clickable element
      const target = e.target as HTMLElement;
      const isClickable = 
        target.tagName.toLowerCase() === 'button' ||
        target.tagName.toLowerCase() === 'a' ||
        target.closest('button') !== null ||
        target.closest('a') !== null ||
        target.classList.contains('nav-link') ||
        target.classList.contains('card-hover') ||
        target.classList.contains('btn') ||
        target.classList.contains('icon-btn') ||
        target.classList.contains('avatar') ||
        target.closest('.avatar') !== null;
        
      setIsHovering(isClickable);
    };

    const onMouseLeave = () => setIsVisible(false);
    const onMouseEnter = () => setIsVisible(true);

    const animate = () => {
      // Lerp logic for smooth but highly responsive trailing (snappier factor)
      currentX += (targetX - currentX) * 0.35;
      currentY += (targetY - currentY) * 0.35;
      
      setPosition({ x: currentX, y: currentY });
      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', onMouseMove);
    document.body.addEventListener('mouseleave', onMouseLeave);
    document.body.addEventListener('mouseenter', onMouseEnter);
    
    animate();

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.body.removeEventListener('mouseleave', onMouseLeave);
      document.body.removeEventListener('mouseenter', onMouseEnter);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Don't render on mobile devices
  if (typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches) {
    return null;
  }

  return (
    <>
      {/* Tiny solid dot that instantly follows the cursor */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '6px',
          height: '6px',
          backgroundColor: 'var(--accent-1)',
          borderRadius: '50%',
          pointerEvents: 'none',
          transform: `translate3d(calc(${position.x}px - 3px), calc(${position.y}px - 3px), 0)`,
          zIndex: 99999,
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 0.2s ease',
        }}
      />
      {/* Trailing glowing aura that expands on hover */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '36px',
          height: '36px',
          border: `2px solid ${isHovering ? 'var(--accent-3)' : 'var(--accent-2)'}`,
          backgroundColor: isHovering ? 'rgba(236, 72, 153, 0.15)' : 'transparent',
          borderRadius: '50%',
          pointerEvents: 'none',
          transform: `translate3d(calc(${position.x}px - 18px), calc(${position.y}px - 18px), 0) scale(${isHovering ? 1.5 : 1})`,
          zIndex: 99998,
          opacity: isVisible ? 1 : 0,
          transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.2s ease, border-color 0.2s ease, opacity 0.2s ease',
        }}
      />
    </>
  );
};

export default CustomCursor;
