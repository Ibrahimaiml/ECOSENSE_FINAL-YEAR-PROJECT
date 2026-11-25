import React from 'react';
import { ArrowUp, ArrowRight, ShieldCheck, Sparkles, Database } from 'lucide-react';

/**
 * FooterTransition (Stage 5 — Matching Image 6 style)
 * Smooth dark-to-light theme transition section featuring giant high-contrast solid typography
 * ("ECOSENSE AI" & "BUILDING INTELLIGENCE") over a crisp off-white canvas.
 */
export default function FooterTransition() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={{ position: 'relative', width: '100%', overflow: 'hidden' }}>
      {/* ── Transition Gradient Header (Dark to Light Blend) ── */}
      <div
        style={{
          height: 120,
          background: 'linear-gradient(to bottom, #0A0A0A 0%, rgba(10,10,10,0.8) 40%, rgba(248,249,250,0.2) 80%, #F8F9FA 100%)',
          position: 'relative',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
        }}
      />

      {/* ── Light Canvas Footer Body ── */}
      <footer
        className="footer-light-theme"
        style={{
          background: '#F8F9FA',
          color: '#0A0A0A',
          padding: '80px 48px 48px',
          position: 'relative',
        }}
      >
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>

          {/* Top Row: Brand & Back-to-Top Button */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 24,
            paddingBottom: 48,
            borderBottom: '1px solid rgba(0,0,0,0.08)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <img
                src="/logo-header.jpg"
                alt="EcoSense AI"
                style={{ width: 44, height: 44, borderRadius: 12, objectFit: 'cover', boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}
                onError={e => { e.target.style.display = 'none'; }}
              />
              <div>
                <span style={{ fontSize: '1.25rem', fontWeight: 900, fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.03em', color: '#0A0A0A' }}>
                  EcoSense <span style={{ color: '#65a30d' }}>AI</span>
                </span>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#6B7280', fontWeight: 500 }}>
                  Autonomous Building Intelligence &middot; Next-Gen Energy Platform
                </p>
              </div>
            </div>

            <button
              onClick={scrollToTop}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: '#0A0A0A',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 40,
                padding: '12px 24px',
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'none',
                transition: 'all 0.25s ease',
                boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#84CC16';
                e.currentTarget.style.color = '#0A0A0A';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = '#0A0A0A';
                e.currentTarget.style.color = '#FFFFFF';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <span>Back to Top</span>
              <ArrowUp size={16} />
            </button>
          </div>

          {/* Directory Navigation Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 40,
            padding: '54px 0 60px',
            borderBottom: '1px solid rgba(0,0,0,0.08)',
          }}>
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#65a30d', marginBottom: 18 }}>
                01 / Platforms
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {['3D Architectural Studio', 'Electricity Bill Command', 'Financial Analytics', 'HVAC Thermal Control'].map(item => (
                  <li key={item}>
                    <a
                      href="#home"
                      style={{ color: '#374151', textDecoration: 'none', fontSize: '0.92rem', fontWeight: 600, transition: 'color 0.2s ease', cursor: 'none' }}
                      onMouseEnter={e => { e.currentTarget.style.color = '#0A0A0A'; }}
                      onMouseLeave={e => { e.currentTarget.style.color = '#374151'; }}
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#65a30d', marginBottom: 18 }}>
                02 / Architecture
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {['Procedural Twin Synthesis', 'Thermal Geometry Mesh', 'Solar Inverter Bus', 'Real-Time Energy Audit'].map(item => (
                  <li key={item}>
                    <span style={{ color: '#4B5563', fontSize: '0.92rem', fontWeight: 500 }}>
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#65a30d', marginBottom: 18 }}>
                03 / Compliance & ML
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {['ASHRAE Standard 55-2023', 'ISO 52016-1 Energy Metrics', 'XGBoost R²=0.9973 Regression', 'Gemini Flash Reasoning'].map(item => (
                  <li key={item}>
                    <span style={{ color: '#4B5563', fontSize: '0.92rem', fontWeight: 500 }}>
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#65a30d', marginBottom: 18 }}>
                04 / Enterprise Grid
              </div>
              <div style={{
                background: '#FFFFFF',
                borderRadius: 16,
                padding: '20px',
                border: '1px solid rgba(0,0,0,0.08)',
                boxShadow: '0 4px 14px rgba(0,0,0,0.04)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#65a30d', boxShadow: '0 0 8px #65a30d' }} />
                  <span style={{ fontSize: '0.76rem', fontWeight: 700, letterSpacing: '0.06em', color: '#0A0A0A', textTransform: 'uppercase' }}>
                    Grid Sync Active
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#6B7280', lineHeight: 1.5 }}>
                  Sub-15ms inference latency across continuous residential & enterprise HVAC microgrids.
                </p>
              </div>
            </div>
          </div>

          {/* ── GIANT HIGH-CONTRAST SOLID TYPOGRAPHY OVER LIGHT BACKGROUND (IMAGE 6 STYLE) ── */}
          <div style={{ padding: '60px 0 40px', overflow: 'hidden', textAlign: 'center' }}>
            <div
              className="footer-giant-brand"
              style={{
                fontSize: 'clamp(5rem, 15.5vw, 17rem)',
                fontWeight: 900,
                letterSpacing: '-0.06em',
                lineHeight: 0.82,
                color: '#0A0A0A',
                textTransform: 'uppercase',
                display: 'block',
                margin: 0,
              }}
            >
              ECOSENSE AI
            </div>
            <div
              style={{
                fontSize: 'clamp(1.5rem, 4vw, 4.2rem)',
                fontWeight: 800,
                letterSpacing: '0.12em',
                color: '#65a30d',
                fontFamily: 'Outfit, sans-serif',
                textTransform: 'uppercase',
                marginTop: 8,
              }}
            >
              BUILDING INTELLIGENCE
            </div>
          </div>

          {/* Bottom Copyright and Verification Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16,
            paddingTop: 32,
            borderTop: '1px solid rgba(0,0,0,0.08)',
            fontSize: '0.78rem',
            color: '#6B7280',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShieldCheck size={16} color="#65a30d" />
              <span>Microsoft Entra ID Authenticated &middot; AES-256 Cloud Infrastructure</span>
            </div>
            <div>
              &copy; 2026 EcoSense AI &middot; Final Year Project &middot; All Rights Reserved.
            </div>
          </div>

        </div>
      </footer>
    </div>
  );
}
