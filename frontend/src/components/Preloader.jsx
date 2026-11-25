import React, { useEffect, useRef, useState } from 'react';

/**
 * Preloader — full-screen pitch-black overlay with logo + numeric counter 0→100%.
 * Thin lime progress bar at bottom. Fades out and calls onComplete() at 100%.
 */
export default function Preloader({ onComplete }) {
  const [count, setCount] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const DURATION = 2400; // ms
    const STEPS = 100;
    const interval = DURATION / STEPS;
    let current = 0;

    const timer = setInterval(() => {
      current++;
      setCount(current);
      if (current >= STEPS) {
        clearInterval(timer);
        setTimeout(() => {
          setFadeOut(true);
          setTimeout(onComplete, 550);
        }, 300);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#0A0A0A',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99998,
        opacity: fadeOut ? 0 : 1,
        transition: 'opacity 0.55s cubic-bezier(0.4,0,0.2,1)',
        pointerEvents: fadeOut ? 'none' : 'all',
      }}
    >
      {/* Logo */}
      <div
        style={{
          marginBottom: 40,
          animation: 'fade-in 0.8s ease forwards',
        }}
      >
        <img
          src="/logo-preloader.jpg"
          alt="EcoSense AI"
          style={{
            width: 140,
            height: 'auto',
            borderRadius: 16,
            boxShadow: '0 0 40px rgba(132,204,22,0.2)',
          }}
          onError={(e) => { e.target.style.display = 'none'; }}
        />
      </div>

      {/* Wordmark */}
      <div
        style={{
          fontSize: '0.72rem',
          letterSpacing: '0.22em',
          fontWeight: 700,
          textTransform: 'uppercase',
          color: '#4A4A4A',
          marginBottom: 56,
          fontFamily: 'Outfit, sans-serif',
          animation: 'fade-in 0.8s 0.2s ease forwards',
          opacity: 0,
        }}
      >
        Autonomous Building Intelligence
      </div>

      {/* Counter */}
      <div
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '5rem',
          fontWeight: 700,
          color: '#FFFFFF',
          lineHeight: 1,
          letterSpacing: '-0.04em',
          marginBottom: 8,
          tabularNums: 'tabular-nums',
        }}
      >
        {String(count).padStart(2, '0')}
        <span style={{ fontSize: '2rem', color: '#84CC16', marginLeft: 4 }}>%</span>
      </div>

      {/* Status text */}
      <div
        style={{
          fontSize: '0.75rem',
          color: '#4A4A4A',
          fontFamily: 'Outfit, sans-serif',
          marginBottom: 60,
          letterSpacing: '0.05em',
        }}
      >
        {count < 30 ? 'Connecting to PostgreSQL...'
          : count < 60 ? 'Loading 3D rendering engine...'
          : count < 85 ? 'Calibrating AI safety guardrails...'
          : 'Initializing platform...'}
      </div>

      {/* Progress bar at bottom */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 3,
          background: 'rgba(255,255,255,0.05)',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${count}%`,
            background: 'linear-gradient(90deg, #84CC16, #a3e635)',
            boxShadow: '0 0 12px rgba(132,204,22,0.5)',
            transition: 'width 0.025s linear',
            borderRadius: '0 2px 2px 0',
          }}
        />
      </div>
    </div>
  );
}
