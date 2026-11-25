import React, { useEffect, useRef, useState } from 'react';
import { Clock, LogOut, ChevronDown } from 'lucide-react';

const SECTIONS = [
    { id: 'home', label: 'Home' },
    { id: 'ecosense-core', label: 'EcoSense Core' },
    { id: 'studio', label: '3D Architectural Studio' },
    { id: 'electricity', label: 'Electricity Bill' },
    { id: 'financial', label: 'Financial Analytics' },
];

/**
 * Navbar — Clean fixed dashboard header.
 * Live clock + interactive user avatar dropdown with Sign Out / Logout.
 */
export default function Navbar({ activeSection, activeTab, user, onSectionClick, onLogout }) {
    const [time, setTime] = useState('');
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);

    const currentTab = activeTab || activeSection || 'home';

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuOpen(false);
            }
        };
        const handleEsc = (e) => {
            if (e.key === 'Escape') setMenuOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEsc);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEsc);
        };
    }, []);

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
                    <div ref={menuRef} style={{ position: 'relative' }}>
                        <button
                            type="button"
                            onClick={() => setMenuOpen(o => !o)}
                            aria-label="Account menu"
                            aria-expanded={menuOpen}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 6,
                                background: 'rgba(255,255,255,0.04)',
                                border: menuOpen ? '1px solid rgba(132,204,22,0.55)' : '1px solid rgba(255,255,255,0.1)',
                                borderRadius: 999, padding: '3px 8px 3px 3px',
                                cursor: 'none', transition: 'border-color 0.2s ease, background 0.2s ease',
                            }}
                            title={user.name || user.email || 'Account'}
                        >
                            <span
                                style={{
                                    width: 30, height: 30, borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #84CC16, #4ade80)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '0.72rem', fontWeight: 800, color: '#0A0A0A',
                                    flexShrink: 0, letterSpacing: '0.02em',
                                    boxShadow: '0 0 14px rgba(132,204,22,0.35)',
                                }}
                            >
                                {user.avatar || (user.name ? user.name.slice(0, 2).toUpperCase() : 'EA')}
                            </span>
                            <ChevronDown
                                size={13}
                                color="#8B8B8B"
                                style={{ transform: menuOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}
                            />
                        </button>

                        {menuOpen && (
                            <div
                                style={{
                                    position: 'absolute', top: 'calc(100% + 10px)', right: 0,
                                    minWidth: 230, borderRadius: 14,
                                    background: 'rgba(13, 13, 13, 0.96)',
                                    backdropFilter: 'blur(20px)',
                                    WebkitBackdropFilter: 'blur(20px)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    boxShadow: '0 20px 50px rgba(0,0,0,0.85)',
                                    padding: 12, zIndex: 1100,
                                }}
                            >
                                <div style={{ padding: '6px 8px 10px', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: 8 }}>
                                    <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#FFFFFF', fontFamily: 'Outfit, sans-serif' }}>
                                        {user.name || 'Authenticated User'}
                                    </div>
                                    {user.email && (
                                        <div style={{ fontSize: '0.73rem', color: '#8B8B8B', marginTop: 2, wordBreak: 'break-all' }}>
                                            {user.email}
                                        </div>
                                    )}
                                </div>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setMenuOpen(false);
                                        if (typeof onLogout === 'function') onLogout();
                                    }}
                                    style={{
                                        width: '100%', display: 'flex', alignItems: 'center', gap: 9,
                                        padding: '9px 10px', borderRadius: 9,
                                        background: 'rgba(244,63,94,0.1)',
                                        border: '1px solid rgba(244,63,94,0.28)',
                                        color: '#fb7185',
                                        fontFamily: 'Outfit, sans-serif', fontSize: '0.82rem', fontWeight: 700,
                                        cursor: 'none', transition: 'background 0.2s ease',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(244,63,94,0.22)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(244,63,94,0.1)'; }}
                                >
                                    <LogOut size={14} />
                                    <span>Sign Out / Logout</span>
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
}
