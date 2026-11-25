import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

import CustomCursor from './components/CustomCursor';
import Preloader from './components/Preloader';
import IntroPage from './components/IntroPage';
import AuthModal from './components/AuthModal';
import Dashboard from './components/Dashboard';
import ErrorBoundary from './components/ErrorBoundary';

/**
 * App — Executive Multi-Tab Architecture:
 * - Default State: Stage 4 (Main Platform Dashboard) with activeTab = 'home'
 * - Safe localStorage reads with try/catch fallbacks
 * - Explicit dark background (#050505) and full viewport bounds
 */

const SECTION_IDS = ['home', 'ecosense-core', 'studio', 'electricity', 'financial'];

export default function App() {
  // Default to Stage 4: Dashboard with Executive Profile
  const [stage, setStage] = useState(4);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('ecosense_user');
      return stored ? JSON.parse(stored) : { name: 'Executive Architect', avatar: 'EA' };
    } catch {
      return { name: 'Executive Architect', avatar: 'EA' };
    }
  });

  // Default active tab state set to 'home'
  const [activeTab, setActiveTab] = useState('home');
  const [activeSection, setActiveSection] = useState('home');
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Sync activeTab with activeSection
  const handleTabChange = useCallback((tabId) => {
    setActiveTab(tabId);
    setActiveSection(tabId);

    if (stage !== 4) {
      setStage(4);
    }

    const el = document.getElementById(tabId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [stage]);

  // Track active section via IntersectionObserver when in Stage 4
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

  // Stage 1 → 2
  const handlePreloaderComplete = useCallback(() => {
    setStage(2);
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

  // Stage 3 → 4 (successful auth)
  const handleAuth = useCallback((userData) => {
    try {
      localStorage.setItem('ecosense_user', JSON.stringify(userData));
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
      {stage === 1 && <Preloader onComplete={handlePreloaderComplete} />}

      {/* ── Stage 2: Public Intro Page ── */}
      {stage === 2 && (
        <IntroPage onSignIn={handleSignInClick} />
      )}

      {/* ── Stage 3: Auth Modal (overlaid on intro) ── */}
      {stage === 3 && (
        <>
          <IntroPage onSignIn={handleSignInClick} />
          {showAuthModal && <AuthModal onAuth={handleAuth} onClose={handleAuthClose} />}
        </>
      )}

      {/* ── Stage 4: Main Platform Dashboard ── */}
      {stage === 4 && (
        <ErrorBoundary>
          <Dashboard
            activeSection={activeSection}
            activeTab={activeTab}
            user={user}
            onSectionClick={handleTabChange}
          />
        </ErrorBoundary>
      )}
    </div>
  );
}
