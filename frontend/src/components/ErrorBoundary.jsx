import React, { Component } from 'react';
import { AlertTriangle, RotateCcw, Trash2 } from 'lucide-react';

/**
 * EcoSense AI - Global Executive Error Boundary
 * Catches unhandled runtime / WebGL rendering errors, prevents total screen blanking,
 * and provides one-click recovery mechanisms.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[EcoSense AI ErrorBoundary caught an exception]:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleResetAndReload = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      console.warn('Failed to clear storage:', e);
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            width: '100%',
            backgroundColor: '#050505',
            color: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            fontFamily: "'Outfit', -apple-system, BlinkMacSystemFont, sans-serif",
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              maxWidth: '680px',
              width: '100%',
              backgroundColor: 'rgba(18, 18, 18, 0.92)',
              border: '1px solid rgba(132, 204, 22, 0.3)',
              borderRadius: '16px',
              padding: '36px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.9), 0 0 30px rgba(132, 204, 22, 0.1)',
              backdropFilter: 'blur(16px)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ef4444',
                  flexShrink: 0,
                }}
              >
                <AlertTriangle size={26} />
              </div>
              <div>
                <h1 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
                  EcoSense AI — Application Runtime Alert
                </h1>
                <p style={{ margin: '4px 0 0 0', color: '#94a3b8', fontSize: '0.88rem' }}>
                  A component encountered an unhandled exception during rendering.
                </p>
              </div>
            </div>

            <div
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.65)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '10px',
                padding: '16px',
                marginBottom: '24px',
                maxHeight: '180px',
                overflowY: 'auto',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.8rem',
                color: '#f87171',
                lineHeight: 1.5,
              }}
            >
              {this.state.error?.toString() || 'Unknown runtime error'}
            </div>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                onClick={this.handleReload}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#84cc16',
                  color: '#050505',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  padding: '10px 20px',
                  borderRadius: '10px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'opacity 0.2s',
                }}
              >
                <RotateCcw size={16} />
                Reload Application
              </button>

              <button
                onClick={this.handleResetAndReload}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.06)',
                  color: '#e2e8f0',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  padding: '10px 20px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
              >
                <Trash2 size={16} />
                Clear Cache & Restart
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

