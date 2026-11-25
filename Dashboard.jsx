import React, { useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Navbar from './Navbar';
import EcoSenseCore from './EcoSenseCore';
import ArchitecturalStudio from './ArchitecturalStudio';
import ElectricityBill from './ElectricityBill';
import FinancialAnalytics from './FinancialAnalytics';
import Footer from './Footer';

/**
 * Dashboard (Stage 4 & Stage 5 Platform Container)
 * Features:
 * - Sticky Split-Text Scroll Pinning: 250vh track, sticky 100vh viewport
 * - High-performance background video (/landing_final.mp4) with GPU transform
 * - Framer Motion split text ECOSENSE and AI converging smoothly to center
 * - Solid bold white typography (color: #FFFFFF, font-weight: 900)
 * - Core platform modules & exact Pic 4 footer
 */
export default function Dashboard({ activeSection, activeTab, user, onSectionClick, onLogout }) {
    const heroRef = useRef(null);
    const [activeHouseProfile, setActiveHouseProfile] = useState(null);

    // Bind scroll progress across the 250vh pinned container
    const { scrollYProgress } = useScroll({
        target: heroRef,
        offset: ['start start', 'end end'],
    });

    // Smooth split text converging animation: Visible from start and subtly scales/locks into place
    const leftX = useTransform(scrollYProgress, [0, 0.35, 1], ['-6vw', '0vw', '0vw']);
    const rightX = useTransform(scrollYProgress, [0, 0.35, 1], ['6vw', '0vw', '0vw']);
    const sublineOpacity = useTransform(scrollYProgress, [0, 0.15], [0.85, 1]);
    const heroScale = useTransform(scrollYProgress, [0.35, 0.95], [1, 0.96]);

    return (
        <>
            {/* Clean Sticky Navigation Bar */}
            <Navbar
                activeSection={activeSection}
                activeTab={activeTab}
                user={user}
                onSectionClick={onSectionClick}
                onLogout={onLogout}
            />

            <main style={{ paddingTop: 0, minHeight: '100vh', backgroundColor: '#050505' }}>
                {/* Section 1: Sticky Split-Text Scroll Pinning (Pic 3 Style) */}
                <div
                    id="home"
                    ref={heroRef}
                    style={{ height: '220vh', position: 'relative', backgroundColor: '#050505' }}
                >
                    <div
                        style={{
                            position: 'sticky',
                            top: 0,
                            height: '100vh',
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'radial-gradient(circle at center, #0f172a 0%, #050505 100%)',
                        }}
                    >
                        {/* Background Video */}
                        <video
                            autoPlay
                            loop
                            muted
                            playsInline
                            style={{
                                position: 'absolute',
                                inset: 0,
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                zIndex: 0,
                                transform: 'translateZ(0)',
                                willChange: 'transform',
                                opacity: 0.85,
                            }}
                            src="/landing_final.mp4"
                        />

                        {/* Cinematic Background Vignette */}
                        <div
                            style={{
                                position: 'absolute',
                                inset: 0,
                                zIndex: 1,
                                background: 'linear-gradient(to bottom, rgba(5,5,5,0.65) 0%, rgba(5,5,5,0.25) 40%, rgba(5,5,5,0.92) 100%)',
                                pointerEvents: 'none',
                            }}
                        />

                        {/* Framer Motion Split Text Container */}
                        <motion.div
                            initial={{ opacity: 0, y: 18 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                            style={{
                                position: 'relative',
                                zIndex: 2,
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
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 'clamp(1rem, 3.2vw, 3rem)',
                                    width: '100%',
                                    overflow: 'hidden',
                                }}
                            >
                                {/* Left Split Text: ECOSENSE */}
                                <motion.div
                                    style={{
                                        x: leftX,
                                        color: '#FFFFFF',
                                        fontWeight: 900,
                                        fontSize: 'clamp(3.8rem, 10vw, 8rem)',
                                        fontFamily: "'Outfit', sans-serif",
                                        letterSpacing: '-0.04em',
                                        lineHeight: 0.9,
                                        textTransform: 'uppercase',
                                        textShadow: '0 8px 36px rgba(0, 0, 0, 0.95), 0 0 20px rgba(255, 255, 255, 0.1)',
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    ECOSENSE
                                </motion.div>

                                {/* Right Split Text: AI */}
                                <motion.div
                                    style={{
                                        x: rightX,
                                        color: '#84CC16',
                                        fontWeight: 900,
                                        fontSize: 'clamp(3.8rem, 10vw, 8rem)',
                                        fontFamily: "'Outfit', sans-serif",
                                        letterSpacing: '-0.04em',
                                        lineHeight: 0.9,
                                        textTransform: 'uppercase',
                                        textShadow: '0 8px 36px rgba(0, 0, 0, 0.95), 0 0 30px rgba(132, 204, 22, 0.4)',
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    AI
                                </motion.div>
                            </div>

                            {/* Tagline reveals as words lock in place */}
                            <motion.div
                                style={{
                                    opacity: sublineOpacity,
                                    marginTop: 22,
                                    fontSize: 'clamp(0.85rem, 1.8vw, 1.45rem)',
                                    fontWeight: 800,
                                    letterSpacing: '0.34em',
                                    fontFamily: "'Outfit', sans-serif",
                                    color: 'rgba(255, 255, 255, 0.92)',
                                    textShadow: '0 4px 18px rgba(0, 0, 0, 0.85)',
                                    textTransform: 'uppercase',
                                    textAlign: 'center',
                                }}
                            >
                                BUILDING INTELLIGENCE
                            </motion.div>
                        </motion.div>
                    </div>
                </div>

                <div className="divider" />

                {/* Section 2: EcoSense Core Engine Architecture */}
                <EcoSenseCore />
                <div className="divider" />

                {/* Section 3: 3D Architectural Studio */}
                <ArchitecturalStudio onLayoutChange={setActiveHouseProfile} />
                <div className="divider" />

                {/* Section 4: Operational Energy Control Center & Electricity Bill */}
                <ElectricityBill houseProfile={activeHouseProfile} />
                <div className="divider" />

                {/* Section 5: Financial Analytics */}
                <FinancialAnalytics />

                {/* Stage 5: Light-to-Dark Theme Scroll Transition Footer (Pic 4 Style) */}
                <Footer />
            </main>
        </>
    );
}

