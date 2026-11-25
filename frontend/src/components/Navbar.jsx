import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

const SECTIONS = [
  { id: 'home', label: 'Home' },
  { id: 'ecosense-core', label: 'EcoSense Core' },
  { id: 'studio', label: '3D Architectural Studio' },
  { id: 'electricity', label: 'Electricity Bill' },
  { id: 'financial', label: 'Financial Analytics' },
];

/**
 * Navbar — Clean fixed dashboard header.
 * No PostgreSQL status pills. Live clock + user avatar retained.
 */
export default function Navbar({ activeSection, activeTab, user, onSectionClick }) {
  const [time, setTime] = useState('');
  const [scrolled, setScrolled] = useState(false);

  const currentTab = activeTab || activeSection || 'home';

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }));
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (typeof onSectionClick === 'function') {
      onSectionClick(id);
    }
  };

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      background: scrolled ? 'rgba(10,10,10,0.92)' : 'rgba(10,10,10,0.7)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      borderBottom: scrolled ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(255,255,255,0.04)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 32px', height: 64, gap: 24,
      transition: 'background 0.3s ease, border-color 0.3s ease',
    }}>

      {/* Left: Logo + wordmark */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <img
          src="/logo-header.jpg" alt="EcoSense AI"
          style={{ width: 32, height: 32, borderRadius: 9, objectFit: 'cover' }}
          onError={e => { e.target.style.display = 'none'; }}
        />
        <span style={{ fontSize: '1.02rem', fontWeight: 800, letterSpacing: '-0.02em', fontFamily: 'Outfit, sans-serif' }}>
          EcoSense <span style={{ color: '#84CC16' }}>AI</span>
        </span>
      </div>

      {/* Center: Section nav links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 2, overflow: 'hidden' }}>
        {SECTIONS.map(s => {
          const isActive = currentTab === s.id;
          return (
            <button
              key={s.id}
              onClick={() => scrollTo(s.id)}
              className={`nav-link${isActive ? ' active' : ''}`}
              style={{
                background: 'none', border: 'none',
                fontFamily: 'Outfit, sans-serif',
                padding: '6px 13px', borderRadius: 8,
                whiteSpace: 'nowrap',
                fontSize: '0.83rem',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? '#84CC16' : '#8B8B8B',
                borderBottom: isActive ? '2px solid #84CC16' : '2px solid transparent',
                transition: 'color 0.2s ease, border-color 0.2s ease',
                cursor: 'none',
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = '#FFFFFF'; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = '#8B8B8B'; }}
            >
              {s.label}
            </button>
          );
        })}
      </div>

      {/* Right: Clock + user avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#4A4A4A', fontSize: '0.79rem', fontFamily: "'JetBrains Mono', monospace" }}>
          <Clock size={12} />
          <span style={{ color: '#6B6B6B' }}>{time}</span>
        </div>

        {user && (
          <div
            style={{
              width: 34, height: 34, borderRadius: '50%',
              background: 'linear-gradient(135deg, #84CC16, #4ade80)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.72rem', fontWeight: 800, color: '#0A0A0A',
              flexShrink: 0, letterSpacing: '0.02em',
              boxShadow: '0 0 14px rgba(132,204,22,0.35)',
            }}
            title={user.name}
          >
            {user.avatar || user.name.slice(0, 2).toUpperCase()}
          </div>
        )}
      </div>
    </nav>
  );
}
