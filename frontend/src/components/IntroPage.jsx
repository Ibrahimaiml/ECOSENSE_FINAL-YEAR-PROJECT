import React, { useRef, useEffect, useState } from 'react';

const MARQUEE_ITEMS = [
  'Efficient Homes',
  '3D Thermal Modeling',
  'Electricity AI Forecasting',
  'Solar Rebates',
  'Smart HVAC Guardrails',
  'Efficient Homes',
  '3D Thermal Modeling',
  'Electricity AI Forecasting',
  'Solar Rebates',
  'Smart HVAC Guardrails',
];

/* ── Procedural Backdrop 01: High-Tech Grid & Blueprint Geometry ── */
function FloorplanProceduralVisual() {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: 340, overflow: 'hidden' }}>
      <svg width="100%" height="100%" viewBox="0 0 460 380" preserveAspectRatio="xMidYMid slice">
        <defs>
          <pattern id="grid-pattern-1" width="22" height="22" patternUnits="userSpaceOnUse">
            <path d="M 22 0 L 0 0 0 22" fill="none" stroke="rgba(132, 204, 22, 0.08)" strokeWidth="1" />
          </pattern>
          <linearGradient id="glass-facet-1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#84CC16" stopOpacity="0.25" />
            <stop offset="50%" stopColor="#22c55e" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="wall-glow-1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#84CC16" />
            <stop offset="100%" stopColor="#4ade80" />
          </linearGradient>
        </defs>

        <rect width="100%" height="100%" fill="url(#grid-pattern-1)" />

        {/* Architectural Glass Geometry Polygons */}
        <polygon points="50,40 240,20 300,120 110,140" fill="url(#glass-facet-1)" stroke="rgba(132,204,22,0.4)" strokeWidth="1.5" />
        <polygon points="240,20 390,60 350,180 300,120" fill="url(#glass-facet-1)" stroke="rgba(74,222,128,0.3)" strokeWidth="1.2" />
        <polygon points="110,140 300,120 350,180 180,240" fill="url(#glass-facet-1)" stroke="rgba(6,182,212,0.35)" strokeWidth="1.5" />

        {/* Floorplan Core Walls */}
        <path
          d="M 60 160 L 380 160 L 380 330 L 60 330 Z
             M 200 160 L 200 330
             M 60 250 L 200 250
             M 200 270 L 380 270"
          fill="none"
          stroke="url(#wall-glow-1)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="drop-shadow(0 0 8px rgba(132,204,22,0.7))"
        />

        {/* Internal Door Swings */}
        <path d="M 200 220 A 30 30 0 0 1 230 250" fill="none" stroke="rgba(132,204,22,0.6)" strokeDasharray="3 3" />
        <path d="M 130 160 A 30 30 0 0 1 160 190" fill="none" stroke="rgba(132,204,22,0.6)" strokeDasharray="3 3" />

        {/* Room Labels & Callouts */}
        <text x="80" y="205" fill="#84CC16" fontSize="10" fontFamily="'JetBrains Mono', monospace" letterSpacing="0.1em" opacity="0.9">
          THERMAL CORE
        </text>
        <text x="230" y="215" fill="#FFFFFF" fontSize="10" fontFamily="'JetBrains Mono', monospace" letterSpacing="0.1em" opacity="0.8">
          ATRIUM 32.4m²
        </text>
        <text x="80" y="300" fill="rgba(255,255,255,0.6)" fontSize="9" fontFamily="'JetBrains Mono', monospace">
          U-VAL: 0.18 W/m²K
        </text>
        <text x="230" y="305" fill="#84CC16" fontSize="9" fontFamily="'JetBrains Mono', monospace">
          SOLAR GAIN +42%
        </text>

        {/* Dimension Vectors */}
        <line x1="50" y1="345" x2="390" y2="345" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
        <circle cx="50" cy="345" r="3" fill="#84CC16" />
        <circle cx="390" cy="345" r="3" fill="#84CC16" />
        <text x="220" y="360" fill="rgba(255,255,255,0.5)" fontSize="9" textAnchor="middle" fontFamily="'JetBrains Mono', monospace">
          14.80 m
        </text>

        {/* Glowing Node Vertices */}
        <circle cx="60" cy="160" r="4" fill="#84CC16" />
        <circle cx="380" cy="160" r="4" fill="#84CC16" />
        <circle cx="380" cy="330" r="4" fill="#84CC16" />
        <circle cx="60" cy="330" r="4" fill="#84CC16" />
        <circle cx="200" cy="250" r="4" fill="#FFFFFF" />
      </svg>
    </div>
  );
}

/* ── Procedural Backdrop 02: Voxel Wireframe Mesh & Thermal Gradient Flow ── */
function VoxelTwinProceduralVisual() {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: 340, overflow: 'hidden' }}>
      <svg width="100%" height="100%" viewBox="0 0 460 380" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="thermal-gradient-2" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.45" />
            <stop offset="40%" stopColor="#10b981" stopOpacity="0.35" />
            <stop offset="70%" stopColor="#84CC16" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.5" />
          </linearGradient>
          <linearGradient id="laser-grad-2" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0" />
            <stop offset="50%" stopColor="#22d3ee" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Isometric Voxel Cube Matrix */}
        <g transform="translate(230, 140)" stroke="rgba(6, 182, 212, 0.4)" strokeWidth="1.2" fill="url(#thermal-gradient-2)">
          {/* Level 0 Floor */}
          <polygon points="0,-60 100,-10 0,40 -100,-10" />
          <polygon points="-100,-10 0,40 0,110 -100,60" fill="rgba(6, 182, 212, 0.2)" />
          <polygon points="100,-10 0,40 0,110 100,60" fill="rgba(16, 185, 129, 0.25)" />

          {/* Level 1 Tower Stack Left */}
          <g transform="translate(-50, 15)">
            <polygon points="0,-40 50,-15 0,10 -50,-15" fill="rgba(132, 204, 22, 0.3)" />
            <polygon points="-50,-15 0,10 0,60 -50,35" fill="rgba(6, 182, 212, 0.3)" />
            <polygon points="50,-15 0,10 0,60 50,35" fill="rgba(132, 204, 22, 0.2)" />
          </g>

          {/* Level 1 Tower Stack Right */}
          <g transform="translate(50, 15)">
            <polygon points="0,-40 50,-15 0,10 -50,-15" fill="rgba(245, 158, 11, 0.35)" />
            <polygon points="-50,-15 0,10 0,60 -50,35" fill="rgba(16, 185, 129, 0.3)" />
            <polygon points="50,-15 0,10 0,60 50,35" fill="rgba(245, 158, 11, 0.25)" />
          </g>

          {/* Voxel Apex Node */}
          <g transform="translate(0, -60)">
            <polygon points="0,-40 50,-15 0,10 -50,-15" fill="rgba(132, 204, 22, 0.45)" stroke="#84CC16" strokeWidth="1.5" />
            <polygon points="-50,-15 0,10 0,50 -50,25" fill="rgba(6, 182, 212, 0.35)" />
            <polygon points="50,-15 0,10 0,50 50,25" fill="rgba(132, 204, 22, 0.35)" />
          </g>
        </g>

        {/* Laser Scanner Horizontal Beam */}
        <line x1="20" y1="180" x2="440" y2="180" stroke="url(#laser-grad-2)" strokeWidth="3" filter="drop-shadow(0 0 10px #06b6d4)" />
        <rect x="20" y="160" width="420" height="40" fill="url(#laser-grad-2)" opacity="0.3" />

        {/* Thermal Node Callout Badges */}
        <g transform="translate(60, 60)">
          <rect width="90" height="24" rx="4" fill="rgba(6,182,212,0.15)" stroke="rgba(6,182,212,0.5)" strokeWidth="1" />
          <circle cx="12" cy="12" r="3" fill="#22d3ee" />
          <text x="24" y="16" fill="#22d3ee" fontSize="10" fontFamily="'JetBrains Mono', monospace" fontWeight="bold">
            21.4°C / L1
          </text>
        </g>

        <g transform="translate(300, 50)">
          <rect width="96" height="24" rx="4" fill="rgba(245,158,11,0.15)" stroke="rgba(245,158,11,0.5)" strokeWidth="1" />
          <circle cx="12" cy="12" r="3" fill="#fbbf24" />
          <text x="24" y="16" fill="#fbbf24" fontSize="10" fontFamily="'JetBrains Mono', monospace" fontWeight="bold">
            24.8°C / ROOF
          </text>
        </g>

        <g transform="translate(160, 300)">
          <rect width="130" height="26" rx="6" fill="rgba(132,204,22,0.15)" stroke="rgba(132,204,22,0.6)" strokeWidth="1" />
          <circle cx="14" cy="13" r="4" fill="#84CC16" />
          <text x="28" y="17" fill="#84CC16" fontSize="10" fontFamily="'JetBrains Mono', monospace" fontWeight="bold">
            VOXEL SYNC: 100%
          </text>
        </g>
      </svg>
    </div>
  );
}

/* ── Procedural Backdrop 03: High-Density Solar Circuit Traces & Pulse Waves ── */
function SolarGridProceduralVisual() {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: 340, overflow: 'hidden' }}>
      <svg width="100%" height="100%" viewBox="0 0 460 380" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="copper-track-3" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="50%" stopColor="#ea580c" />
            <stop offset="100%" stopColor="#84CC16" />
          </linearGradient>
          <filter id="circuit-glow-3">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Solar PV Grid Busbars */}
        <g stroke="rgba(245, 158, 11, 0.25)" strokeWidth="1">
          <line x1="40" y1="40" x2="420" y2="40" />
          <line x1="40" y1="70" x2="420" y2="70" />
          <line x1="40" y1="100" x2="420" y2="100" />
          <line x1="120" y1="30" x2="120" y2="110" />
          <line x1="230" y1="30" x2="230" y2="110" />
          <line x1="340" y1="30" x2="340" y2="110" />
        </g>

        {/* High-density Circuit Traces */}
        <path
          d="M 120 110 L 120 160 L 180 220 L 180 280
             M 230 110 L 230 180 L 270 220 L 270 310
             M 340 110 L 340 150 L 300 190 L 360 250 L 360 320
             M 50 220 L 140 220 L 180 260
             M 410 260 L 320 260 L 270 300"
          fill="none"
          stroke="url(#copper-track-3)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#circuit-glow-3)"
        />

        {/* Animated Traveling Pulse Paths */}
        <path
          className="circuit-trace"
          d="M 120 110 L 120 160 L 180 220 L 180 280"
          fill="none"
          stroke="#84CC16"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <path
          className="circuit-trace"
          d="M 340 110 L 340 150 L 300 190 L 360 250 L 360 320"
          fill="none"
          stroke="#fbbf24"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Energy Neural Concentric Nodes */}
        <g transform="translate(180, 220)">
          <circle cx="0" cy="0" r="14" fill="none" stroke="rgba(132,204,22,0.4)" strokeWidth="1" strokeDasharray="3 3" />
          <circle cx="0" cy="0" r="6" fill="#84CC16" filter="drop-shadow(0 0 10px #84CC16)" />
        </g>
        <g transform="translate(270, 220)">
          <circle cx="0" cy="0" r="16" fill="none" stroke="rgba(245,158,11,0.4)" strokeWidth="1" strokeDasharray="4 2" />
          <circle cx="0" cy="0" r="7" fill="#f59e0b" filter="drop-shadow(0 0 12px #f59e0b)" />
        </g>
        <g transform="translate(230, 330)">
          <circle cx="0" cy="0" r="22" fill="none" stroke="rgba(132,204,22,0.3)" strokeWidth="1.5" />
          <circle cx="0" cy="0" r="10" fill="#84CC16" />
        </g>

        {/* Circuit telemetry tags */}
        <text x="50" y="150" fill="#f59e0b" fontSize="10" fontFamily="'JetBrains Mono', monospace" letterSpacing="0.08em">
          BUS 480V · 60Hz
        </text>
        <text x="290" y="160" fill="#84CC16" fontSize="10" fontFamily="'JetBrains Mono', monospace" letterSpacing="0.08em">
          PV INVERTER 14.8kW
        </text>
        <text x="90" y="340" fill="#FFFFFF" fontSize="10" fontFamily="'JetBrains Mono', monospace">
          XGBOOST R²=0.9973
        </text>
      </svg>
    </div>
  );
}

const PROCESS_DATA = [
  {
    num: '01',
    stepTitle: 'Step 01',
    title: '01 - Aesthetic House Design',
    desc: 'Procedurally generated architectural blueprints tuned for thermal performance and spatial elegance.',
    accent: '#84CC16',
    engine: 'PROCEDURAL · BLUEPRINT SYNTHESIS',
    VisualComponent: FloorplanProceduralVisual,
  },
  {
    num: '02',
    stepTitle: 'Step 02',
    title: '02 - 3D Procedural Twin',
    desc: 'Real-time digital twin with voxel-accurate thermal mapping and live occupancy simulation.',
    accent: '#06b6d4',
    engine: 'VOXEL TWIN · ASHRAE 55 DYNAMICS',
    VisualComponent: VoxelTwinProceduralVisual,
  },
  {
    num: '03',
    stepTitle: 'Step 03',
    title: '03 - Electricity Prediction',
    desc: 'XGBoost + Gemini AI forecasting energy demand with R²=0.9973 precision on 15-min granularity.',
    accent: '#f59e0b',
    engine: 'INFERENCE · XGBOOST & GEMINI FLASH',
    VisualComponent: SolarGridProceduralVisual,
  },
];

export default function IntroPage({ onSignIn }) {
  // Card-by-card intersection observers for vertical stacked reveal
  const [card1Visible, setCard1Visible] = useState(false);
  const [card2Visible, setCard2Visible] = useState(false);
  const [card3Visible, setCard3Visible] = useState(false);

  const card1Ref = useRef(null);
  const card2Ref = useRef(null);
  const card3Ref = useRef(null);

  useEffect(() => {
    const observer1 = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setCard1Visible(true);
    }, { threshold: 0.15 });

    const observer2 = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setCard2Visible(true);
    }, { threshold: 0.18 });

    const observer3 = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setCard3Visible(true);
    }, { threshold: 0.18 });

    if (card1Ref.current) observer1.observe(card1Ref.current);
    if (card2Ref.current) observer2.observe(card2Ref.current);
    if (card3Ref.current) observer3.observe(card3Ref.current);

    return () => {
      observer1.disconnect();
      observer2.disconnect();
      observer3.disconnect();
    };
  }, []);

  return (
    <div style={{ background: '#0A0A0A', overflowX: 'hidden' }}>

      {/* ═══════════ STAGE 2A: CLEAN VIDEO HERO (MATCHING PIC 2) ═══════════ */}
      <section style={{ position: 'relative', width: '100%', height: '100svh', minHeight: 650, overflow: 'hidden' }}>

        {/* Video loop with hardware acceleration */}
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: 0,
            willChange: 'transform',
            transform: 'translateZ(0)',
            WebkitBackfaceVisibility: 'hidden',
            backfaceVisibility: 'hidden',
          }}
          onError={e => { e.target.style.display = 'none'; }}
        >
          <source src="/intro_page.mp4" type="video/mp4" />
        </video>

        {/* Dynamic Dark Gradient Overlay */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1,
          background: 'linear-gradient(135deg, rgba(10,10,10,0.8) 0%, rgba(10,10,10,0.3) 50%, rgba(10,10,10,0.1) 100%)',
        }} />

        {/* Bottom Fade for giant typography bleed */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '42%', zIndex: 2,
          background: 'linear-gradient(to bottom, transparent 0%, rgba(10,10,10,0.6) 45%, rgba(10,10,10,0.95) 100%)',
        }} />

        {/* Top Navbar */}
        <nav style={{
          position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 40px', height: 76,
          background: 'rgba(10,10,10,0.35)',
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img
              src="/logo-header.jpg"
              alt="EcoSense AI"
              style={{ width: 38, height: 38, borderRadius: 10, objectFit: 'cover', boxShadow: '0 0 16px rgba(132,204,22,0.28)' }}
              onError={e => { e.target.style.display = 'none'; }}
            />
            <span style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.025em', fontFamily: 'Outfit, sans-serif' }}>
              EcoSense <span style={{ color: '#84CC16' }}>AI</span>
            </span>
          </div>

          <button
            onClick={onSignIn}
            className="intro-signin-btn"
            style={{
              background: 'rgba(255,255,255,0.96)',
              color: '#0A0A0A',
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 700,
              fontSize: '0.9rem',
              letterSpacing: '0.02em',
              padding: '11px 28px',
              borderRadius: 40,
              border: 'none',
              cursor: 'none',
              transition: 'all 0.25s ease',
              boxShadow: '0 4px 24px rgba(0,0,0,0.45)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#84CC16';
              e.currentTarget.style.boxShadow = '0 6px 30px rgba(132,204,22,0.6)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.96)';
              e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.45)';
            }}
          >
            Sign In
          </button>
        </nav>

        {/* ── SEMI-TRANSPARENT OUTLINE/FILL TYPOGRAPHY (IMAGE 6 STYLE) ── */}
        <div style={{
          position: 'absolute', bottom: 42, left: 0, right: 0, zIndex: 4,
          overflow: 'hidden', userSelect: 'none', pointerEvents: 'none',
          padding: '0 48px',
        }}>
          {/* Sits gracefully inside lower viewport without obstructing background video */}
          <div style={{
            fontSize: 'clamp(3rem, 6.8vw, 6.8rem)',
            fontWeight: 800,
            letterSpacing: '-0.025em',
            fontFamily: "'Outfit', sans-serif",
            lineHeight: 0.95,
            whiteSpace: 'nowrap',
            color: 'rgba(255, 255, 255, 0.16)',
            WebkitTextStroke: '1px rgba(255, 255, 255, 0.65)',
            textTransform: 'uppercase',
            filter: 'drop-shadow(0 0 25px rgba(132, 204, 22, 0.25))',
          }}>
            ECOSENSE <span style={{ color: 'rgba(132, 204, 22, 0.35)', WebkitTextStroke: '1.2px #84CC16' }}>AI</span>
          </div>

          {/* Subline */}
          <div style={{
            fontSize: 'clamp(0.78rem, 1.4vw, 1.15rem)',
            fontWeight: 600,
            letterSpacing: '0.22em',
            fontFamily: "'Outfit', sans-serif",
            color: 'rgba(255, 255, 255, 0.55)',
            textTransform: 'uppercase',
            marginTop: 8,
          }}>
            AUTONOMOUS BUILDING INTELLIGENCE &middot; 3D THERMAL PLATFORM
          </div>
        </div>

        {/* Sliding Marquee Ticker */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 6,
          borderTop: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(10,10,10,0.85)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          overflow: 'hidden',
          padding: '13px 0',
        }}>
          <div className="marquee-track">
            {MARQUEE_ITEMS.map((item, i) => (
              <span key={i} className="marquee-item">
                <span className="marquee-dot" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ STAGE 2B: "OUR PROCESS" VERTICAL STACKED REVEAL (PIC 3 STYLE) ═══════════ */}
      <section
        style={{
          padding: '120px 0 140px',
          background: '#0A0A0A',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          position: 'relative',
        }}
      >
        <div className="section-container" style={{ maxWidth: 1160, margin: '0 auto', padding: '0 32px' }}>
          
          {/* Section Header */}
          <div style={{ textAlign: 'center', marginBottom: 80 }}>
            <div className="section-label" style={{ justifyContent: 'center', marginBottom: 16 }}>
              Architecture &middot; Simulation &middot; Intelligence
            </div>
            <h2 style={{ fontSize: 'clamp(2.4rem, 5vw, 3.8rem)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.05 }}>
              Our <span style={{ color: '#84CC16' }}>Process</span>
            </h2>
            <p style={{ maxWidth: 540, margin: '16px auto 0', color: 'rgba(255,255,255,0.5)', fontSize: '1rem', lineHeight: 1.7 }}>
              Scroll down to explore each procedural layer of our autonomous thermal modeling and predictive energy engine.
            </p>
          </div>

          {/* ── Vertical Stacked Reveal Container ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 64 }}>

            {/* CARD 01: Aesthetic House Design */}
            <div
              ref={card1Ref}
              style={{
                opacity: card1Visible ? 1 : 0,
                transform: card1Visible ? 'translateY(0)' : 'translateY(80px)',
                transition: 'opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1), transform 0.9s cubic-bezier(0.16, 1, 0.3, 1)',
                background: '#0D0D0D',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 24,
                overflow: 'hidden',
                boxShadow: '0 24px 70px rgba(0,0,0,0.7)',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'rgba(132,204,22,0.5)';
                e.currentTarget.style.boxShadow = '0 30px 80px rgba(0,0,0,0.85), 0 0 35px rgba(132,204,22,0.15)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                e.currentTarget.style.boxShadow = '0 24px 70px rgba(0,0,0,0.7)';
              }}
            >
              {/* Left/Top: High-tech grid & blueprint geometry */}
              <div style={{ background: '#090909', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
                <FloorplanProceduralVisual />
              </div>

              {/* Right/Bottom: Card content */}
              <div style={{ padding: '48px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: 'rgba(132,204,22,0.12)', border: '1px solid rgba(132,204,22,0.3)',
                  borderRadius: 16, padding: '4px 12px', width: 'fit-content', marginBottom: 18,
                }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#84CC16' }} />
                  <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#84CC16', textTransform: 'uppercase' }}>
                    01 / Synthesis
                  </span>
                </div>

                <h3 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 14, color: '#FFFFFF' }}>
                  01 - Aesthetic House Design
                </h3>

                <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.96rem', lineHeight: 1.7, marginBottom: 28 }}>
                  Procedurally generated architectural blueprints tuned for thermal performance and spatial elegance. Calculates heat loss vectors, solar window angles, and natural convection airflows prior to construction.
                </p>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 18 }}>
                  <span style={{ fontSize: '0.78rem', color: '#84CC16', fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>
                    PROCEDURAL BLUEPRINT ENGINE
                  </span>
                  <span style={{ color: '#84CC16', fontSize: '1.2rem', fontWeight: 700 }}>&rarr;</span>
                </div>
              </div>
            </div>

            {/* CARD 02: 3D Procedural Twin (Slides up on deeper scroll) */}
            <div
              ref={card2Ref}
              style={{
                opacity: card2Visible ? 1 : 0,
                transform: card2Visible ? 'translateY(0)' : 'translateY(100px)',
                transition: 'opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1), transform 0.9s cubic-bezier(0.16, 1, 0.3, 1)',
                background: '#0D0D0D',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 24,
                overflow: 'hidden',
                boxShadow: '0 24px 70px rgba(0,0,0,0.7)',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'rgba(6,182,212,0.5)';
                e.currentTarget.style.boxShadow = '0 30px 80px rgba(0,0,0,0.85), 0 0 35px rgba(6,182,212,0.15)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                e.currentTarget.style.boxShadow = '0 24px 70px rgba(0,0,0,0.7)';
              }}
            >
              {/* Left/Top: Voxel wireframe mesh visual */}
              <div style={{ background: '#090909', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
                <VoxelTwinProceduralVisual />
              </div>

              {/* Right/Bottom: Card content */}
              <div style={{ padding: '48px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.3)',
                  borderRadius: 16, padding: '4px 12px', width: 'fit-content', marginBottom: 18,
                }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#06b6d4' }} />
                  <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#06b6d4', textTransform: 'uppercase' }}>
                    02 / Digital Twin
                  </span>
                </div>

                <h3 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 14, color: '#FFFFFF' }}>
                  02 - 3D Procedural Twin
                </h3>

                <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.96rem', lineHeight: 1.7, marginBottom: 28 }}>
                  Real-time digital twin with voxel-accurate thermal mapping and live occupancy simulation. Continuous sensor telemetry tracks interior temperature distribution and ASHRAE 55 comfort envelopes across all rooms.
                </p>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 18 }}>
                  <span style={{ fontSize: '0.78rem', color: '#06b6d4', fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>
                    VOXEL TWIN &middot; ASHRAE 55 DYNAMICS
                  </span>
                  <span style={{ color: '#06b6d4', fontSize: '1.2rem', fontWeight: 700 }}>&rarr;</span>
                </div>
              </div>
            </div>

            {/* CARD 03: Electricity Prediction (Slides up on deepest scroll) */}
            <div
              ref={card3Ref}
              style={{
                opacity: card3Visible ? 1 : 0,
                transform: card3Visible ? 'translateY(0)' : 'translateY(100px)',
                transition: 'opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1), transform 0.9s cubic-bezier(0.16, 1, 0.3, 1)',
                background: '#0D0D0D',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 24,
                overflow: 'hidden',
                boxShadow: '0 24px 70px rgba(0,0,0,0.7)',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'rgba(245,158,11,0.5)';
                e.currentTarget.style.boxShadow = '0 30px 80px rgba(0,0,0,0.85), 0 0 35px rgba(245,158,11,0.15)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                e.currentTarget.style.boxShadow = '0 24px 70px rgba(0,0,0,0.7)';
              }}
            >
              {/* Left/Top: Solar circuit visual */}
              <div style={{ background: '#090909', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
                <SolarGridProceduralVisual />
              </div>

              {/* Right/Bottom: Card content */}
              <div style={{ padding: '48px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)',
                  borderRadius: 16, padding: '4px 12px', width: 'fit-content', marginBottom: 18,
                }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#f59e0b' }} />
                  <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase' }}>
                    03 / Intelligence
                  </span>
                </div>

                <h3 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 14, color: '#FFFFFF' }}>
                  03 - Electricity Prediction
                </h3>

                <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.96rem', lineHeight: 1.7, marginBottom: 28 }}>
                  XGBoost + Gemini AI forecasting energy demand with R²=0.9973 precision on 15-min granularity. Calculates dynamic solar rebate offsets and enforces automated grid cost boundaries.
                </p>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 18 }}>
                  <span style={{ fontSize: '0.78rem', color: '#f59e0b', fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>
                    XGBOOST ML &middot; GEMINI FLASH REASONING
                  </span>
                  <span style={{ color: '#f59e0b', fontSize: '1.2rem', fontWeight: 700 }}>&rarr;</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
