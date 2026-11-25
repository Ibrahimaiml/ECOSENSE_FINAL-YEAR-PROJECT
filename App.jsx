import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

import CustomCursor from './components/CustomCursor';
import Preloader from './components/Preloader';
import IntroPage from './components/IntroPage';
import AuthModal from './components/AuthModal';
import Dashboard from './components/Dashboard';
import ErrorBoundary from './components/ErrorBoundary';

/**
 * App — 4-Stage Auth-Gated Architecture:
 *   Stage 1: Preloader (0→100% counter)
 *   Stage 2: Public Intro Page (Video hero + vertical stacked reveal)
 *   Stage 3: Auth Modal overlay (Microsoft Entra ID / Email + OTP / Demo fallback)
 *   Stage 4: Main Platform Dashboard (Protected behind sessionStorage auth gate)
 */

const SECTION_IDS = ['home', 'ecosense-core', 'studio', 'electricity', 'financial'];
const SESSION_USER_KEY = 'ecosense_user';

function loadSessionUser() {
    try {
        const stored = sessionStorage.getItem(SESSION_USER_KEY);
        if (!stored) return null;
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object' && (parsed.email || parsed.name)) {
            return parsed;
        }
        return null;
    } catch {
        return null;
    }
}

export default function App() {
    const [initialSession] = useState(() => loadSessionUser());
    const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(initialSession));
    const [user, setUser] = useState(() => initialSession);
    const [stage, setStage] = useState(() => (initialSession ? 4 : 1));
    const [activeTab, setActiveTab] = useState('home');
    const [activeSection, setActiveSection] = useState('home');
    const [showAuthModal, setShowAuthModal] = useState(false);

    // Clean up any legacy persistent localStorage user entries so sessions remain tab-scoped
    useEffect(() => {
        try {
            localStorage.removeItem(SESSION_USER_KEY);
        } catch {
            // ignore storage errors
        }
    }, []);

    // Sync activeTab with activeSection when dashboard is mounted
    const handleTabChange = useCallback((tabId) => {
        if (!isAuthenticated) return;
        setActiveTab(tabId);
        setActiveSection(tabId);

        if (stage !== 4) {
            setStage(4);
        }

        const el = document.getElementById(tabId);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [isAuthenticated, stage]);

    // Track active section via IntersectionObserver (authenticated Stage 4 only)
    useEffect(() => {
        if (!isAuthenticated || stage !== 4) return;
        const observers = [];
        SECTION_IDS.forEach(id => {
            const el = document.getElementById(id);
            if (!el) return;
            const obs = new IntersectionObserver(
                ([entry]) => {
                    if (entry.isIntersecting) {
                        setActiveSection(id);
                        setActiveTab(id);
                    }
                },
                { threshold: 0.35, rootMargin: '-64px 0px 0px 0px' }
            );
            obs.observe(el);
            observers.push(obs);
        });
        return () => observers.forEach(o => o.disconnect());
    }, [isAuthenticated, stage]);

    // Stage 1 → 2 (only advance to intro if not already authenticated)
    const handlePreloaderComplete = useCallback(() => {
        setStage(prev => (prev === 1 ? 2 : prev));
    }, []);

    // Stage 2 → 3 (open auth modal)
    const handleSignInClick = useCallback(() => {
        setShowAuthModal(true);
        setStage(3);
    }, []);

    // Close auth modal (return to intro)
    const handleAuthClose = useCallback(() => {
        setShowAuthModal(false);
        setStage(2);
    }, []);

    // Stage 3 → 4 (successful auth via Entra ID, Email + OTP, or Demo session)
    const handleAuth = useCallback((userData) => {
        if (!userData) return;
        try {
            sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(userData));
        } catch {
            // ignore storage errors
        }
        setUser(userData);
        setIsAuthenticated(true);
        setShowAuthModal(false);
        setStage(4);
        setActiveTab('home');
        setActiveSection('home');
        setTimeout(() => window.scrollTo({ top: 0, behavior: 'instant' }), 0);
    }, []);

    // Sign Out: clears sessionStorage + MSAL session keys and returns to Intro / Login screen
    const handleLogout = useCallback(() => {
        try {
            sessionStorage.removeItem(SESSION_USER_KEY);
            localStorage.removeItem(SESSION_USER_KEY);
            Object.keys(sessionStorage).forEach(k => {
                if (k.startsWith('msal.')) sessionStorage.removeItem(k);
            });
        } catch {
            // ignore storage errors
        }
        setUser(null);
        setIsAuthenticated(false);
        setShowAuthModal(false);
        setStage(2);
        setActiveTab('home');
        setActiveSection('home');
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, []);

    return (
        <div
            className="min-h-screen bg-[#050505] text-white w-full h-full relative"
            style={{
                minHeight: '100vh',
                width: '100%',
                backgroundColor: '#050505',
                color: '#ffffff',
                position: 'relative',
                overflowX: 'hidden',
            }}
        >
            {/* Custom cursor — always active */}
            <CustomCursor />

            {/* ── Stage 1: Preloader Screen ── */}
            {!isAuthenticated && stage === 1 && (
                <Preloader onComplete={handlePreloaderComplete} />
            )}

            {/* ── Stage 2: Public Intro Page ── */}
            {(!isAuthenticated && (stage === 2 || stage === 4)) && (
                <IntroPage onSignIn={handleSignInClick} />
            )}

            {/* ── Stage 3: Auth Modal (overlaid on intro) ── */}
            {!isAuthenticated && stage === 3 && (
                <>
                    <IntroPage onSignIn={handleSignInClick} />
                    {showAuthModal && <AuthModal onAuth={handleAuth} onClose={handleAuthClose} />}
                </>
            )}

            {/* ── Stage 4: Main Platform Dashboard (Strict Auth Gate) ── */}
            {isAuthenticated && user && stage === 4 && (
                <ErrorBoundary>
                    <Dashboard
                        activeSection={activeSection}
                        activeTab={activeTab}
                        user={user}
                        onSectionClick={handleTabChange}
                        onLogout={handleLogout}
                    />
                </ErrorBoundary>
            )}
        </div>
    );
}
