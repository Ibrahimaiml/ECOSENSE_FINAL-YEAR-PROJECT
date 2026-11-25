import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

/**
 * HomeHero — Stage 4 Platform Hero with Pinned Split-Text Scroll Effect (Pic 3 Style)
 * 1. Typography & Styling: Clean, solid, high-impact bold white text (#FFFFFF) matching SHOW | CASE style.
 * 2. Sticky Viewport Pinning: Outer container has 250vh height. Inner view is position: sticky, top: 0, height: 100vh.
 * 3. Scroll Convergence:
 *    - At scroll 0: ECOSENSE is at -50vw, AI is at +50vw.
 *    - As user scrolls down, both sides smoothly move inward until they merge precisely at center (0vw) at scroll = 0.5.
 *    - After scroll > 0.5, words remain joined until the container unpins and reveals subsequent sections.
 * 4. High-performance video with transform: translateZ(0) and will-change: transform.
 */
export default function HomeHero() {
  const containerRef = useRef(null);

  // Bind scroll progress across the 250vh pinned container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Split-text horizontal convergence:
  // Starts off-screen (-40vw / +40vw) at scroll = 0, merges at center (0vw) at scroll = 0.45
  const leftX = useTransform(scrollYProgress, [0, 0.45, 1], ['-40vw', '0vw', '0vw']);
  const rightX = useTransform(scrollYProgress, [0, 0.45, 1], ['40vw', '0vw', '0vw']);

  // Subline fades in as words converge
  const sublineOpacity = useTransform(scrollYProgress, [0.32, 0.5], [0, 1]);
  const sublineY = useTransform(scrollYProgress, [0.32, 0.5], [20, 0]);

  // Subtle scale down after convergence as user scrolls past 0.5
  const heroScale = useTransform(scrollYProgress, [0.5, 0.95], [1, 0.95]);

  // Scroll prompt indicator fades out immediately upon scrolling
  const promptOpacity = useTransform(scrollYProgress, [0, 0.15], [0.75, 0]);

  return (
    <section
      id="home"
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '250vh', // Extended scroll track for pinned scrubbing
      }}
    >
      {/* ── STICKY VIEWPORT PIN (Stays fixed while scrolling from 0 to 1.0) ── */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          width: '100%',
          height: '100vh',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* ── High-Performance Background Drone Video ── */}
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
            transform: 'translateZ(0)',
            willChange: 'transform',
            WebkitBackfaceVisibility: 'hidden',
            backfaceVisibility: 'hidden',
          }}
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        >
          <source src="/landing_final.mp4" type="video/mp4" />
        </video>

        {/* Lightweight Cinematic Vignette */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 1,
            background: 'linear-gradient(to bottom, rgba(10,10,10,0.45) 0%, rgba(10,10,10,0.15) 40%, rgba(10,10,10,0.7) 100%)',
            pointerEvents: 'none',
          }}
        />

        {/* ── PINNED SPLIT-TEXT SCROLL TYPOGRAPHY (PIC 3 STYLE) ── */}
        <motion.div
          style={{
            position: 'relative',
            zIndex: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            padding: '0 24px',
            scale: heroScale,
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        >
          {/* Split Typography Container */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'clamp(14px, 3.2vw, 42px)',
              width: '100%',
              overflow: 'hidden',
            }}
          >
            {/* Left Word: ECOSENSE (Solid bold white text matching Pic 3) */}
            <motion.div
              style={{
                x: leftX,
                fontSize: 'clamp(3.6rem, 10vw, 11rem)',
                fontWeight: 900,
                fontFamily: "'Outfit', sans-serif",
                lineHeight: 0.9,
                letterSpacing: '-0.04em',
                textTransform: 'uppercase',
                color: '#FFFFFF',
                textShadow: '0 8px 36px rgba(0, 0, 0, 0.9)',
                whiteSpace: 'nowrap',
              }}
            >
              ECOSENSE
            </motion.div>

            {/* Right Word: AI (Solid bold white text matching Pic 3) */}
            <motion.div
              style={{
                x: rightX,
                fontSize: 'clamp(3.6rem, 10vw, 11rem)',
                fontWeight: 900,
                fontFamily: "'Outfit', sans-serif",
                lineHeight: 0.9,
                letterSpacing: '-0.04em',
                textTransform: 'uppercase',
                color: '#FFFFFF',
                textShadow: '0 8px 36px rgba(0, 0, 0, 0.9)',
                whiteSpace: 'nowrap',
              }}
            >
              AI
            </motion.div>
          </div>

          {/* Subline: BUILDING INTELLIGENCE (Fades in on convergence) */}
          <motion.div
            style={{
              opacity: sublineOpacity,
              y: sublineY,
              fontSize: 'clamp(0.9rem, 2vw, 1.55rem)',
              fontWeight: 800,
              letterSpacing: '0.32em',
              fontFamily: "'Outfit', sans-serif",
              color: 'rgba(255, 255, 255, 0.92)',
              textShadow: '0 4px 20px rgba(0, 0, 0, 0.85)',
              textTransform: 'uppercase',
              marginTop: 22,
              textAlign: 'center',
            }}
          >
            BUILDING INTELLIGENCE
          </motion.div>
        </motion.div>

        {/* Scroll Guidance Indicator */}
        <motion.div
          style={{
            position: 'absolute',
            bottom: 32,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
            opacity: promptOpacity,
            pointerEvents: 'none',
          }}
        >
          <span
            style={{
              fontSize: '0.68rem',
              letterSpacing: '0.2em',
              color: '#FFFFFF',
              textTransform: 'uppercase',
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 600,
            }}
          >
            Scroll to Converge
          </span>
          <div
            style={{
              width: 1,
              height: 28,
              background: 'linear-gradient(to bottom, #FFFFFF, transparent)',
            }}
          />
        </motion.div>
      </div>
    </section>
  );
}
