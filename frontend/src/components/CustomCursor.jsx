import React, { useEffect, useRef, useState } from 'react';

/**
 * CustomCursor — EcoSense Green House Icon Cursor
 * Smooth requestAnimationFrame tracking with linear interpolation and eco-green ambient glow.
 */
export default function CustomCursor() {
  const cursorRef = useRef(null);
  const dotRef = useRef(null);
  const pos = useRef({ x: -100, y: -100 });
  const lerped = useRef({ x: -100, y: -100 });
  const rafId = useRef(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const SPEED = 0.2;

    const onMove = (e) => {
      pos.current.x = e.clientX;
      pos.current.y = e.clientY;
      if (!isVisible) setIsVisible(true);
    };

    const onEnter = () => setIsVisible(true);
    const onLeave = () => setIsVisible(false);

    const onElementHover = (e) => {
      const el = e.target.closest('button, a, [role="button"], input, select, textarea, label, .dropzone, .nav-link');
      setIsHovering(!!el);
    };

    const loop = () => {
      lerped.current.x += (pos.current.x - lerped.current.x) * SPEED;
      lerped.current.y += (pos.current.y - lerped.current.y) * SPEED;

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${lerped.current.x}px, ${lerped.current.y}px, 0) translate(-50%, -50%)`;
      }
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0) translate(-50%, -50%)`;
      }
      rafId.current = requestAnimationFrame(loop);
    };

    rafId.current = requestAnimationFrame(loop);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseover', onElementHover);
    document.documentElement.addEventListener('mouseenter', onEnter);
    document.documentElement.addEventListener('mouseleave', onLeave);

    return () => {
      cancelAnimationFrame(rafId.current);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseover', onElementHover);
      document.documentElement.removeEventListener('mouseenter', onEnter);
      document.documentElement.removeEventListener('mouseleave', onLeave);
    };
  }, [isVisible]);

  return (
    <>
      {/* EcoSense Green House cursor — main follower */}
      <div
        ref={cursorRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 26,
          height: 26,
          pointerEvents: 'none',
          zIndex: 999999,
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 0.25s ease',
          willChange: 'transform',
        }}
      >
        <svg
          viewBox="0 0 24 24"
          width="26"
          height="26"
          fill="rgba(118, 184, 42, 0.12)"
          stroke="#88d629"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            width: '100%',
            height: '100%',
            transform: isHovering ? 'scale(1.25)' : 'scale(1)',
            transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            filter: isHovering
              ? 'drop-shadow(0 0 10px rgba(136, 214, 41, 0.85)) drop-shadow(0 0 16px rgba(163, 230, 53, 0.45))'
              : 'drop-shadow(0 0 8px rgba(136, 214, 41, 0.6))',
          }}
        >
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      </div>

      {/* Subtle guide dot */}
      <div
        ref={dotRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 4,
          height: 4,
          background: '#a3e635',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 1000000,
          opacity: isVisible ? 0.85 : 0,
          boxShadow: '0 0 6px rgba(136, 214, 41, 0.8)',
          willChange: 'transform',
          transition: 'opacity 0.25s ease',
        }}
      />
    </>
  );
}
