import React, { useEffect, useRef } from 'react';
import { ShieldCheck, Database, Cpu, Leaf } from 'lucide-react';

const CARDS = [
  {
    label: 'Platform Mission',
    icon: Leaf,
    iconColor: '#84CC16',
    title: 'Autonomous Energy Optimization',
    body: 'EcoSense AI orchestrates a full-stack intelligence pipeline: real-time IoT telemetry ingestion, XGBoost dynamic load forecasting (R²=0.9973), Gemini 3.8 Flash agentic reasoning, and pre-construction 3D architectural simulation — all converging to reduce commercial building energy costs by 15–35% without sacrificing occupant comfort.',
    tags: ['XGBoost ML', 'Agentic AI', 'IoT Telemetry', 'ASHRAE 55'],
    accent: '#84CC16',
  },
  {
    label: 'Enterprise Security',
    icon: ShieldCheck,
    iconColor: '#06b6d4',
    title: 'Microsoft Entra ID · Zero-Trust Access',
    body: 'Platform access is governed by Microsoft Entra ID (formerly Azure Active Directory) with OAuth 2.0 authorization flows. All session tokens are AES-256 encrypted. Role-based access control (RBAC) ensures building operators, energy analysts, and executive dashboards maintain isolated data views with full audit logging.',
    tags: ['Microsoft Entra', 'OAuth 2.0', 'RBAC', 'AES-256'],
    accent: '#06b6d4',
  },
  {
    label: 'Data Architecture',
    icon: Database,
    iconColor: '#8b5cf6',
    title: 'Native PostgreSQL 18 + pgvector RAG Engine',
    body: 'The persistence layer runs on native standard PostgreSQL 18 with zero external extension requirements. Vector embeddings for RAG (Retrieval-Augmented Generation) tariff document search are stored as `DOUBLE PRECISION[]` arrays with numpy cosine similarity — achieving semantic retrieval without the TimescaleDB or pgvector extensions, making deployment trivial on any managed cloud PostgreSQL instance.',
    tags: ['PostgreSQL 18', 'pgvector RAG', 'In-Memory Fallback', 'Native SQL'],
    accent: '#8b5cf6',
  },
  {
    label: 'AI Safety Layer',
    icon: Cpu,
    iconColor: '#f59e0b',
    title: 'Gemini Flash · Hard Safety Guardrails',
    body: 'The Gemini 3.8 Flash agentic control loop integrates ToU tariff rules via RAG retrieval, XGBoost load predictions, and real-time telemetry to synthesize optimal HVAC set-points. Every AI-generated decision passes through hard safety guardrails (19°C ≤ set-point ≤ 26°C per ASHRAE 55-2023 and NBC 2026) enforced server-side — no unsafe temperature can ever reach physical actuators.',
    tags: ['Gemini Flash', 'ASHRAE 55', 'NBC 2026', 'Guardrails'],
    accent: '#f59e0b',
  },
];

/**
 * EcoSenseCore — scroll-stacking card animation revealing platform capabilities.
 */
export default function EcoSenseCore() {
  const sectionRef = useRef(null);
  const cardRefs = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
          }
        });
      },
      { threshold: 0.15, rootMargin: '-40px 0px' }
    );

    cardRefs.current.forEach(el => { if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="ecosense-core"
      ref={sectionRef}
      style={{ padding: '120px 0', background: '#0A0A0A' }}
    >
      <div className="section-container">
        {/* Section header */}
        <div style={{ marginBottom: 80, maxWidth: 600 }}>
          <div className="section-label" style={{ marginBottom: 20 }}>
            Platform Overview
          </div>
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 20 }}>
            The Intelligence Behind
            <br />
            <span style={{ color: '#84CC16' }}>Smarter Buildings</span>
          </h2>
          <p style={{ color: '#8B8B8B', fontSize: '1.05rem', lineHeight: 1.7 }}>
            A vertically integrated AI stack spanning security, data architecture, machine learning, and real-time agentic control.
          </p>
        </div>

        {/* Stacking cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {CARDS.map((card, i) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                ref={el => { cardRefs.current[i] = el; }}
                style={{
                  opacity: 0,
                  transform: 'translateY(40px)',
                  transition: `opacity 0.65s ${i * 0.12}s cubic-bezier(0.4,0,0.2,1), transform 0.65s ${i * 0.12}s cubic-bezier(0.4,0,0.2,1)`,
                  background: '#0D0D0D',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderLeft: `3px solid ${card.accent}`,
                  borderRadius: 20,
                  padding: '40px 44px',
                  display: 'grid',
                  gridTemplateColumns: 'auto 1fr',
                  gap: 36,
                  alignItems: 'start',
                  position: 'sticky',
                  top: 80 + i * 20,
                  boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
                  backdropFilter: 'blur(12px)',
                }}
              >
                {/* Icon column */}
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 16,
                    background: `rgba(${card.accent === '#84CC16' ? '132,204,22' : card.accent === '#06b6d4' ? '6,182,212' : card.accent === '#8b5cf6' ? '139,92,246' : '245,158,11'}, 0.1)`,
                    border: `1px solid rgba(${card.accent === '#84CC16' ? '132,204,22' : card.accent === '#06b6d4' ? '6,182,212' : card.accent === '#8b5cf6' ? '139,92,246' : '245,158,11'}, 0.25)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon size={26} color={card.accent} />
                </div>

                {/* Content */}
                <div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', color: card.accent, textTransform: 'uppercase', marginBottom: 10 }}>
                    {card.label}
                  </div>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 16, color: '#FFFFFF' }}>
                    {card.title}
                  </h3>
                  <p style={{ color: '#8B8B8B', lineHeight: 1.75, fontSize: '0.95rem', marginBottom: 22 }}>
                    {card.body}
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {card.tags.map(tag => (
                      <span
                        key={tag}
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          letterSpacing: '0.04em',
                          padding: '4px 10px',
                          borderRadius: 20,
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          color: '#C8C8C8',
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
