import React, { useState, useEffect, useRef } from 'react';
import { TrendingUp, Sun, Calculator, Award, ChevronRight, ExternalLink } from 'lucide-react';

const SOLAR_PRODUCTS = [
  { name: 'Waaree 440W Mono PERC', type: 'Solar Panel', price: '₹12,800', efficiency: '21.4%', warranty: '25yr', badge: 'BESTSELLER' },
  { name: 'Adani 375W Bifacial', type: 'Solar Panel', price: '₹10,200', efficiency: '19.8%', warranty: '25yr', badge: null },
  { name: 'Luminous 330W Poly', type: 'Solar Panel', price: '₹7,900', efficiency: '18.1%', warranty: '10yr', badge: 'BUDGET' },
  { name: 'Daikin 2-Ton VRV', type: 'HVAC Unit', price: '₹1,45,000', cop: '4.8', warranty: '5yr', badge: 'AI-OPTIMIZED' },
  { name: 'Bluestar 1.5T Inverter', type: 'HVAC Unit', price: '₹52,000', cop: '3.9', warranty: '5yr', badge: null },
  { name: 'Carrier 1.0T DC', type: 'HVAC Unit', price: '₹38,500', cop: '3.5', warranty: '3yr', badge: 'ENTRY' },
];

const SUBSIDIES = [
  { title: 'PM Surya Ghar Muft Bijli Yojana', amount: '₹78,000', description: 'Central government subsidy for rooftop solar ≤3 kW. Direct benefit transfer to bank account.', category: 'CENTRAL', eligibility: 'Residential' },
  { title: 'MNRE CAPEX Subsidy 2024–25', amount: '30%', description: 'Capital expenditure subsidy on solar system cost for commercial establishments above 10 kW.', category: 'CENTRAL', eligibility: 'Commercial' },
  { title: 'Tamil Nadu GEDCL Incentive', amount: '₹20/W', description: 'State-level generation-based incentive for net-metered solar installations.', category: 'STATE', eligibility: 'All' },
  { title: 'BESCOM Green Energy Tariff', amount: '₹6.5/kWh', description: 'Karnataka BESCOM preferential green tariff for industrial solar consumers.', category: 'UTILITY', eligibility: 'Industrial' },
];

/* ── ROI Calculator ── */
function ROICalculator() {
  const [systemCost, setSystemCost] = useState('');
  const [monthlyBill, setMonthlyBill] = useState('');
  const [reductionPct, setReductionPct] = useState(35);
  const [result, setResult] = useState(null);

  const calculate = () => {
    const cost = parseFloat(systemCost);
    const bill = parseFloat(monthlyBill);
    if (!cost || !bill) return;
    const annualSaving = bill * 12 * (reductionPct / 100);
    const payback = cost / annualSaving;
    const roi20yr = (annualSaving * 20 - cost) / cost * 100;
    const co2 = annualSaving / 5.5 * 0.82;
    setResult({ payback, roi20yr, annualSaving, co2 });
  };

  return (
    <div className="glass-card" style={{ padding: 28 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <Calculator size={20} color="#84CC16" />
        <div>
          <div style={{ fontWeight: 700, fontSize: '1rem' }}>Solar ROI Payback Calculator</div>
          <div style={{ fontSize: '0.75rem', color: '#8B8B8B' }}>Estimate payback period and 20-year returns</div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        <div>
          <label style={{ fontSize: '0.78rem', color: '#8B8B8B', display: 'block', marginBottom: 6 }}>System Cost (₹)</label>
          <input type="number" placeholder="e.g. 350000" value={systemCost} onChange={e => setSystemCost(e.target.value)} />
        </div>
        <div>
          <label style={{ fontSize: '0.78rem', color: '#8B8B8B', display: 'block', marginBottom: 6 }}>Monthly Bill (₹)</label>
          <input type="number" placeholder="e.g. 8500" value={monthlyBill} onChange={e => setMonthlyBill(e.target.value)} />
        </div>
      </div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#8B8B8B', marginBottom: 8 }}>
          <span>Bill Reduction Estimate</span>
          <span style={{ color: '#84CC16', fontWeight: 700 }}>{reductionPct}%</span>
        </div>
        <input type="range" min="15" max="60" step="5" value={reductionPct} onChange={e => setReductionPct(Number(e.target.value))} />
      </div>
      <button onClick={calculate} className="btn-lime" style={{ width: '100%', justifyContent: 'center', padding: '12px', marginBottom: 20 }}>
        <Calculator size={16} /> Calculate Returns
      </button>

      {result && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {[
            { label: 'Payback Period', value: `${result.payback.toFixed(1)} yrs`, color: '#84CC16' },
            { label: '20-Year ROI', value: `${result.roi20yr.toFixed(0)}%`, color: '#10b981' },
            { label: 'Annual Saving', value: `₹${result.annualSaving.toFixed(0)}`, color: '#06b6d4' },
            { label: 'CO₂ Offset/yr', value: `${result.co2.toFixed(0)} kg`, color: '#a3e635' },
          ].map(r => (
            <div key={r.label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: '14px 16px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: '0.68rem', color: '#4A4A4A', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{r.label}</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: r.color, fontFamily: "'JetBrains Mono', monospace" }}>{r.value}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Main Component ── */
export default function FinancialAnalytics() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [subsidyFilter, setSubsidyFilter] = useState('All');
  const cardRefs = useRef([]);

  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.style.opacity = '1'; e.target.style.transform = 'translateY(0)'; }
      });
    }, { threshold: 0.1 });
    cardRefs.current.forEach(el => { if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, []);

  const filters = ['All', 'Solar Panel', 'HVAC Unit'];
  const subFilters = ['All', 'CENTRAL', 'STATE', 'UTILITY'];
  const filteredProducts = activeFilter === 'All' ? SOLAR_PRODUCTS : SOLAR_PRODUCTS.filter(p => p.type === activeFilter);
  const filteredSubs = subsidyFilter === 'All' ? SUBSIDIES : SUBSIDIES.filter(s => s.category === subsidyFilter);

  return (
    <section id="financial" style={{ padding: '120px 0 160px', background: 'linear-gradient(180deg, #0A0A0A 0%, #0D0D0D 100%)' }}>
      <div className="section-container">
        {/* Header */}
        <div style={{ marginBottom: 64 }}>
          <div className="section-label" style={{ marginBottom: 16 }}>Financial Analytics</div>
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 14 }}>
            Green Asset
            <span style={{ color: '#84CC16' }}> Market Intelligence</span>
          </h2>
          <p style={{ color: '#8B8B8B', fontSize: '1rem', maxWidth: 560 }}>
            Live solar + HVAC pricing · ROI payback calculator · Government subsidy tracker.
          </p>
        </div>

        {/* Equipment Price Tables */}
        <div style={{ marginBottom: 56 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Equipment Market Prices</h3>
            <div style={{ display: 'flex', gap: 8 }}>
              {filters.map(f => (
                <button key={f} onClick={() => setActiveFilter(f)} style={{
                  padding: '6px 16px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 600, cursor: 'none', border: 'none', fontFamily: 'Outfit, sans-serif',
                  background: activeFilter === f ? '#84CC16' : 'rgba(255,255,255,0.05)',
                  color: activeFilter === f ? '#0A0A0A' : '#8B8B8B',
                  transition: 'all 0.2s',
                }}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {filteredProducts.map((product, i) => (
              <div
                key={product.name}
                ref={el => { cardRefs.current[i] = el; }}
                className="glass-card"
                style={{
                  padding: 22, opacity: 0, transform: 'translateY(24px)',
                  transition: `all 0.5s ${i * 0.08}s cubic-bezier(0.4,0,0.2,1)`,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: '0.68rem', color: '#8B8B8B', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{product.type}</div>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem', lineHeight: 1.3 }}>{product.name}</div>
                  </div>
                  {product.badge && (
                    <span className="badge badge-lime" style={{ fontSize: '0.6rem', flexShrink: 0 }}>{product.badge}</span>
                  )}
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#84CC16', fontFamily: "'JetBrains Mono', monospace", marginBottom: 12 }}>
                  {product.price}
                </div>
                <div style={{ display: 'flex', gap: 16, fontSize: '0.78rem', color: '#4A4A4A' }}>
                  <span>⚡ {product.efficiency || product.cop}</span>
                  <span>🛡 {product.warranty} warranty</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Two-col: ROI Calc + Subsidy Tracker */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
          <ROICalculator />

          {/* Subsidy Tracker */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Award size={18} color="#f59e0b" /> Government Subsidies & Rebates
              </h3>
              <div style={{ display: 'flex', gap: 6 }}>
                {subFilters.map(f => (
                  <button key={f} onClick={() => setSubsidyFilter(f)} style={{
                    padding: '4px 12px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 600, cursor: 'none', border: 'none', fontFamily: 'Outfit, sans-serif',
                    background: subsidyFilter === f ? '#f59e0b' : 'rgba(255,255,255,0.05)',
                    color: subsidyFilter === f ? '#0A0A0A' : '#8B8B8B', transition: 'all 0.2s',
                  }}>{f}</button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {filteredSubs.map((sub, i) => (
                <div key={sub.title} className="glass-card" style={{ padding: 20, borderLeft: '3px solid #f59e0b' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', lineHeight: 1.35, paddingRight: 12 }}>{sub.title}</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#84CC16', fontFamily: "'JetBrains Mono', monospace", flexShrink: 0 }}>{sub.amount}</div>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#8B8B8B', lineHeight: 1.6, marginBottom: 10 }}>{sub.description}</p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <span className="badge badge-neutral">{sub.category}</span>
                    <span className="badge badge-neutral">{sub.eligibility}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
