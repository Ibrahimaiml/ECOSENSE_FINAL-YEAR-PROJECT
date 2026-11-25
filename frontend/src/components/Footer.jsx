import React, { useState } from 'react';
import { ArrowUpRight, ArrowUp, Mail, Phone, CheckCircle2 } from 'lucide-react';

/**
 * Footer (Stage 5 — Matching Pic 4 Style)
 * 1. Dark multi-column navigation hierarchy.
 * 2. Header/CTA Top: Subscription box ("Enter your email" + "Subscribe ↗" button).
 * 3. 6 Multi-Column Navigation Links:
 *    - Main Pages (About, Work, Services, Pricing, Blog, Career, Contact)
 *    - CMS Pages (Work Details, Blog Details)
 *    - Utility Pages (404, Coming Soon)
 *    - Legal (Privacy Policy, Terms & Conditions)
 *    - Social Links (Facebook, Instagram, Twitter / X, LinkedIn)
 *    - Have a question? (Phone, support emails)
 * 4. Massive Bottom Typography: Giant, bold ECOSENSE AI span running edge-to-edge
 *    in gradient red/burgundy styling matching GrowthLab branding in Pic 4.
 */
export default function Footer() {
  const [emailInput, setEmailInput] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (emailInput.trim() && emailInput.includes('@')) {
      setSubscribed(true);
      setEmailInput('');
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer
      style={{
        background: '#080808',
        color: '#FFFFFF',
        position: 'relative',
        overflow: 'hidden',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        fontFamily: "'Outfit', sans-serif",
        paddingTop: 80,
      }}
    >
      <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 40px' }}>

        {/* ── TOP HEADER / CTA: SUBSCRIPTION BOX (MATCHING PIC 4) ── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 36,
            paddingBottom: 64,
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          {/* Left CTA Headline */}
          <div style={{ maxWidth: 560 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#E11D48' }} />
              <span style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#E11D48' }}>
                EcoSense Intelligence Dispatch
              </span>
            </div>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3.2vw, 2.6rem)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.15, margin: 0, color: '#FFFFFF' }}>
              Stay ahead with autonomous building energy research.
            </h2>
            <p style={{ color: '#888888', fontSize: '0.94rem', lineHeight: 1.6, marginTop: 12 }}>
              Get our quarterly thermodynamic models, ASHRAE 55 compliance whitepapers, and real-time algorithmic releases directly in your inbox.
            </p>
          </div>

          {/* Right Subscription Box */}
          <div style={{ width: '100%', maxWidth: 460 }}>
            <form onSubmit={handleSubscribe} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type="email"
                placeholder="Enter your email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                required
                style={{
                  width: '100%',
                  height: 56,
                  borderRadius: 40,
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.14)',
                  padding: '0 160px 0 24px',
                  color: '#FFFFFF',
                  fontSize: '0.94rem',
                  fontFamily: "'Outfit', sans-serif",
                  outline: 'none',
                  transition: 'border-color 0.2s ease, background 0.2s ease',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#E11D48';
                  e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.14)';
                  e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                }}
              />

              <button
                type="submit"
                style={{
                  position: 'absolute',
                  right: 6,
                  height: 44,
                  padding: '0 22px',
                  borderRadius: 36,
                  background: 'linear-gradient(135deg, #E11D48 0%, #9F1239 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  fontFamily: "'Outfit', sans-serif",
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  cursor: 'none',
                  boxShadow: '0 4px 18px rgba(225, 29, 72, 0.35)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 6px 24px rgba(225, 29, 72, 0.55)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 18px rgba(225, 29, 72, 0.35)';
                }}
              >
                <span>Subscribe</span>
                <ArrowUpRight size={16} />
              </button>
            </form>

            {subscribed && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, color: '#4ade80', fontSize: '0.84rem' }}>
                <CheckCircle2 size={16} />
                <span>Thank you! You are now subscribed to the EcoSense AI intelligence dispatch.</span>
              </div>
            )}
          </div>
        </div>

        {/* ── 6 MULTI-COLUMN NAVIGATION LINKS (MATCHING PIC 4) ── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: 40,
            padding: '64px 0 72px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          {/* Column 1: Main Pages */}
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#FFFFFF', marginBottom: 20 }}>
              Main Pages
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 13 }}>
              {['About', 'Work', 'Services', 'Pricing', 'Blog', 'Career', 'Contact'].map((item) => (
                <li key={item}>
                  <a
                    href="#home"
                    style={{
                      color: '#9CA3AF',
                      textDecoration: 'none',
                      fontSize: '0.92rem',
                      fontWeight: 500,
                      transition: 'color 0.2s ease',
                      cursor: 'none',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#9CA3AF')}
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: CMS Pages */}
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#FFFFFF', marginBottom: 20 }}>
              CMS Pages
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 13 }}>
              {['Work Details', 'Blog Details'].map((item) => (
                <li key={item}>
                  <a
                    href="#home"
                    style={{
                      color: '#9CA3AF',
                      textDecoration: 'none',
                      fontSize: '0.92rem',
                      fontWeight: 500,
                      transition: 'color 0.2s ease',
                      cursor: 'none',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#9CA3AF')}
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Utility Pages */}
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#FFFFFF', marginBottom: 20 }}>
              Utility Pages
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 13 }}>
              {['404', 'Coming Soon'].map((item) => (
                <li key={item}>
                  <a
                    href="#home"
                    style={{
                      color: '#9CA3AF',
                      textDecoration: 'none',
                      fontSize: '0.92rem',
                      fontWeight: 500,
                      transition: 'color 0.2s ease',
                      cursor: 'none',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#9CA3AF')}
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Legal */}
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#FFFFFF', marginBottom: 20 }}>
              Legal
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 13 }}>
              {['Privacy Policy', 'Terms & Conditions'].map((item) => (
                <li key={item}>
                  <a
                    href="#home"
                    style={{
                      color: '#9CA3AF',
                      textDecoration: 'none',
                      fontSize: '0.92rem',
                      fontWeight: 500,
                      transition: 'color 0.2s ease',
                      cursor: 'none',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#9CA3AF')}
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 5: Social Links */}
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#FFFFFF', marginBottom: 20 }}>
              Social Links
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 13 }}>
              {[
                { name: 'Facebook', url: 'https://facebook.com' },
                { name: 'Instagram', url: 'https://instagram.com' },
                { name: 'Twitter / X', url: 'https://x.com' },
                { name: 'LinkedIn', url: 'https://linkedin.com' },
              ].map((s) => (
                <li key={s.name}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: '#9CA3AF',
                      textDecoration: 'none',
                      fontSize: '0.92rem',
                      fontWeight: 500,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      transition: 'color 0.2s ease',
                      cursor: 'none',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#9CA3AF')}
                  >
                    <span>{s.name}</span>
                    <ArrowUpRight size={13} color="#E11D48" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 6: Have a Question? */}
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#FFFFFF', marginBottom: 20 }}>
              Have a Question?
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <a
                href="tel:+18004923267"
                style={{
                  color: '#9CA3AF',
                  textDecoration: 'none',
                  fontSize: '0.92rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  cursor: 'none',
                  transition: 'color 0.2s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#9CA3AF')}
              >
                <Phone size={14} color="#E11D48" />
                <span>+1 (800) 492-3267</span>
              </a>

              <a
                href="mailto:support@ecosense.ai"
                style={{
                  color: '#9CA3AF',
                  textDecoration: 'none',
                  fontSize: '0.92rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  cursor: 'none',
                  transition: 'color 0.2s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#9CA3AF')}
              >
                <Mail size={14} color="#E11D48" />
                <span>support@ecosense.ai</span>
              </a>

              <a
                href="mailto:research@ecosense.ai"
                style={{
                  color: '#9CA3AF',
                  textDecoration: 'none',
                  fontSize: '0.92rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  cursor: 'none',
                  transition: 'color 0.2s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#9CA3AF')}
              >
                <Mail size={14} color="#E11D48" />
                <span>research@ecosense.ai</span>
              </a>
            </div>
          </div>
        </div>

      </div>

      {/* ── MASSIVE BOTTOM TYPOGRAPHY: RICH BURGUNDY GRADIENT ECOSENSE AI (MATCHING PIC 4) ── */}
      <div
        style={{
          width: '100%',
          overflow: 'hidden',
          padding: '60px 0 20px',
          textAlign: 'center',
          userSelect: 'none',
        }}
      >
        <div
          style={{
            fontSize: 'clamp(5.2rem, 17.5vw, 21rem)',
            fontWeight: 900,
            fontFamily: "'Outfit', sans-serif",
            letterSpacing: '-0.055em',
            lineHeight: 0.8,
            textTransform: 'uppercase',
            display: 'block',
            margin: 0,
            whiteSpace: 'nowrap',
            background: 'linear-gradient(180deg, #E11D48 0%, #BE123C 35%, #881337 70%, #4C0519 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 10px 40px rgba(225, 29, 72, 0.28))',
          }}
        >
          ECOSENSE AI
        </div>
      </div>

      {/* Bottom Sub-bar */}
      <div
        style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          padding: '24px 40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
          fontSize: '0.8rem',
          color: '#666666',
          maxWidth: 1440,
          margin: '0 auto',
        }}
      >
        <div>
          &copy; {new Date().getFullYear()} EcoSense AI &middot; Final Year Project &middot; All Rights Reserved.
        </div>

        <button
          onClick={scrollToTop}
          style={{
            background: 'rgba(255, 255, 255, 0.06)',
            color: '#FFFFFF',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 30,
            padding: '8px 18px',
            fontSize: '0.78rem',
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 600,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            cursor: 'none',
            transition: 'background 0.2s ease, border-color 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#E11D48';
            e.currentTarget.style.borderColor = '#E11D48';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
          }}
        >
          <span>Back to Top</span>
          <ArrowUp size={13} />
        </button>
      </div>
    </footer>
  );
}
