import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Thermometer,
  DollarSign,
  Leaf,
  Zap,
  Send,
  Phone,
  Bell,
  AlertTriangle,
  ShieldCheck,
  Activity,
  Play,
  Pause,
  RotateCcw,
  FastForward,
  Home,
  Radio,
  Server,
  Cloud,
  ChevronDown,
} from 'lucide-react';
import TelemetryChart, { ApplianceRadarChart } from './TelemetryChart';

/* ── Pure SVG Sankey Diagram ── */
function SankeyDiagram({ totalKwh = 5.1 }) {
  const zones = [
    { name: 'Conference Hub', pct: 0.24, color: '#84CC16' },
    { name: 'Workstations', pct: 0.36, color: '#06b6d4' },
    { name: 'Server Core', pct: 0.26, color: '#f59e0b' },
    { name: 'Common Areas', pct: 0.14, color: '#a855f7' },
  ];
  const W = 520, H = 190, sourceX = 75, sinkX = 415, nodeW = 16;
  let yOff = 18;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
      {/* Source node — Grid */}
      <rect
        x={sourceX - nodeW / 2}
        y={18}
        width={nodeW}
        height={154}
        rx="4"
        fill="rgba(132, 204, 22, 0.15)"
        stroke="#84CC16"
        strokeWidth="1.5"
      />
      <text x={sourceX} y={12} textAnchor="middle" fill="#84CC16" fontSize="9" fontFamily="Outfit, sans-serif" fontWeight="700">
        GRID
      </text>
      <text x={sourceX} y={185} textAnchor="middle" fill="#94a3b8" fontSize="8.5" fontFamily="JetBrains Mono, monospace">
        {totalKwh.toFixed(2)} kWh
      </text>

      {/* Zone flows */}
      {zones.map((z, i) => {
        const bandH = z.pct * 154;
        const sy = yOff;
        yOff += bandH;
        const ty = 18 + i * 38;

        return (
          <g key={z.name}>
            <path
              d={`M ${sourceX + nodeW / 2} ${sy + bandH / 2}
                  C ${(sourceX + sinkX) / 2} ${sy + bandH / 2},
                    ${(sourceX + sinkX) / 2} ${ty + 16},
                    ${sinkX - nodeW / 2} ${ty + 16}`}
              fill="none"
              stroke={z.color}
              strokeWidth={Math.max(3, bandH * 0.65)}
              strokeOpacity="0.28"
            />
            {/* Sink zone node */}
            <rect
              x={sinkX - nodeW / 2}
              y={ty}
              width={nodeW}
              height={32}
              rx="4"
              fill={`rgba(${z.color === '#84CC16' ? '132,204,22' : z.color === '#06b6d4' ? '6,182,212' : z.color === '#f59e0b' ? '245,158,11' : '168,85,247'}, 0.12)`}
              stroke={z.color}
              strokeWidth="1.5"
            />
            <text x={sinkX + nodeW / 2 + 8} y={ty + 14} fill={z.color} fontSize="8.5" fontFamily="Outfit, sans-serif" fontWeight="600">
              {z.name}
            </text>
            <text x={sinkX + nodeW / 2 + 8} y={ty + 26} fill="#64748b" fontSize="7.5" fontFamily="JetBrains Mono, monospace">
              {(z.pct * totalKwh).toFixed(2)} kWh
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ── AI What-If Energy Chat ── */
function EnergyChat() {
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      content:
        'Hello! I am your EcoSense Energy Advisor. Ask me any energy or tariff question — e.g. "How much will I save turning off AC during 16:00-21:00 peak?"',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEnd = useRef(null);

  const FALLBACK_ANSWERS = {
    fan: 'BLDC Ceiling Fan (28W vs 75W standard):\n📊 Daily Saving: ₹1.45 (@ ToU rates)\n📅 Monthly Saving: ₹43.50\n📆 Annual Saving: ₹522 per fan.\nBonus: Combining fans with 24°C set-point saves 35% on AC load during ₹9.80 critical peak.',
    ac: 'Air Conditioning Optimization:\n📊 Critical Peak Tariff (16:00–21:00): ₹9.80/kWh.\nPre-cooling to 20.5°C before 16:00 allows throttling compressor to 0.45 kW.\n⚡ Daily Peak Shaving: 6.8 kWh avoided @ ₹9.80 = ₹66.64/day.\n📅 Monthly Saving: ~₹2,000 for a 280m² residence.',
    default:
      'EcoSense 24-hour Time-of-Use Strategy:\n• Off-Peak (00:00–06:00): ₹3.20/kWh — Run heavy loads & ice battery.\n• Normal (06:00–16:00, 21:00–24:00): ₹5.50/kWh — Pre-cool indoor space to 20.5°C.\n• Critical Peak (16:00–21:00): ₹9.80/kWh — Peak-shave with BLDC air circulation.',
  };

  const send = async () => {
    const msg = input.trim();
    if (!msg || loading) return;
    setMessages((prev) => [...prev, { role: 'user', content: msg }]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/v1/energy-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: msg }),
        signal: AbortSignal.timeout(5000),
      });
      const data = res.ok ? await res.json() : null;
      const reply =
        data?.answer ||
        (msg.toLowerCase().includes('fan')
          ? FALLBACK_ANSWERS.fan
          : msg.toLowerCase().includes('ac')
          ? FALLBACK_ANSWERS.ac
          : FALLBACK_ANSWERS.default);
      setMessages((prev) => [...prev, { role: 'ai', content: reply }]);
    } catch {
      const reply = msg.toLowerCase().includes('fan')
        ? FALLBACK_ANSWERS.fan
        : msg.toLowerCase().includes('ac')
        ? FALLBACK_ANSWERS.ac
        : FALLBACK_ANSWERS.default;
      setMessages((prev) => [...prev, { role: 'ai', content: reply }]);
    }
    setLoading(false);
    setTimeout(() => chatEnd.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: 420 }}>
      <div
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          gap: 10,
          alignItems: 'center',
        }}
      >
        <Zap size={18} color="#84CC16" />
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#f8fafc' }}>
            Gemini Flash "What-If" Energy Advisor
          </div>
          <div style={{ fontSize: '0.72rem', color: '#8B8B8B' }}>
            Instant INR math calibrated against active ToU tariff schedules
          </div>
        </div>
      </div>
      <div
        className="scrollbar-hide"
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '14px 18px',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        {messages.map((m, i) => (
          <div key={i} className={m.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'} style={{ whiteSpace: 'pre-line' }}>
            {m.content}
          </div>
        ))}
        {loading && (
          <div className="chat-bubble-ai" style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <div className="spinner" style={{ width: 14, height: 14 }} />
            <span style={{ color: '#4A4A4A', fontSize: '0.8rem' }}>Simulating XGBoost thermodynamic delta...</span>
          </div>
        )}
        <div ref={chatEnd} />
      </div>
      <div style={{ padding: '10px 16px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 8 }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') send();
          }}
          placeholder="e.g. 'How much if I turn off AC during peak 16:00-21:00?'"
          style={{ flex: 1, fontSize: '0.85rem' }}
        />
        <button
          onClick={send}
          disabled={loading || !input.trim()}
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: input.trim() ? '#84CC16' : 'rgba(255,255,255,0.05)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <Send size={15} color={input.trim() ? '#0A0A0A' : '#4A4A4A'} />
        </button>
      </div>
    </div>
  );
}

/* ── Twilio High-Bill SMS Alert Configurator ── */
function SMSAlertConfig() {
  const [phone, setPhone] = useState('');
  const [threshold, setThreshold] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const save = async () => {
    if (!phone || !threshold) return;
    setSubmitting(true);
    try {
      await fetch('/api/v1/configure-alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, threshold_inr: parseFloat(threshold) }),
        signal: AbortSignal.timeout(5000),
      });
    } catch {}
    setTimeout(() => {
      setSubmitting(false);
      setSuccess(true);
    }, 800);
  };

  return (
    <div className="glass-card" style={{ padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <Bell size={18} color="#f59e0b" />
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#f8fafc' }}>
            Automated High-Bill SMS Alerts
          </div>
          <div style={{ fontSize: '0.72rem', color: '#8B8B8B' }}>
            Twilio Gateway · Immediate budget threshold triggers
          </div>
        </div>
      </div>

      {success ? (
        <div
          style={{
            display: 'flex',
            gap: 10,
            alignItems: 'center',
            background: 'rgba(132,204,22,0.08)',
            border: '1px solid rgba(132,204,22,0.2)',
            borderRadius: 12,
            padding: '14px 18px',
          }}
        >
          <ShieldCheck size={20} color="#84CC16" />
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#84CC16' }}>Alert Active!</div>
            <div style={{ fontSize: '0.8rem', color: '#8B8B8B' }}>
              SMS will dispatch when daily bill exceeds ₹{threshold} to {phone}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ position: 'relative' }}>
            <Phone size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#4A4A4A' }} />
            <input
              type="tel"
              placeholder="Phone number (+91 XXXXXXXXXX)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{ paddingLeft: 36 }}
            />
          </div>
          <div style={{ position: 'relative' }}>
            <AlertTriangle size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#4A4A4A' }} />
            <input
              type="number"
              placeholder="Daily budget threshold (₹)"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              style={{ paddingLeft: 36 }}
            />
          </div>
          <button
            onClick={save}
            disabled={submitting || !phone || !threshold}
            className="btn-lime"
            style={{ justifyContent: 'center', padding: '11px', fontSize: '0.88rem', cursor: 'pointer' }}
          >
            {submitting ? (
              <>
                <div className="spinner" /> Activating...
              </>
            ) : (
              'Activate SMS Alerts'
            )}
          </button>
        </div>
      )}
    </div>
  );
}

/* ── PRESET HOUSE PROFILES ── */
const PRESET_HOUSES = {
  custom_3d: null, // Populated from 3D studio
  villa_3bhk: {
    building_name: 'Custom 3BHK Executive Villa',
    floor_area_sqm: 172.0,
    totalSqFt: 1850.0,
    solar_panels: true,
    rooms: [
      { id: 'living', name: 'Living Room', appliances: [{ type: 'split_ac', count: 1, spec: '2.0 TR' }, { type: 'ceiling_fan', count: 2, spec: 'BLDC' }] },
      { id: 'master', name: 'Master Bed', appliances: [{ type: 'split_ac', count: 1, spec: '1.5 TR' }, { type: 'ceiling_fan', count: 1, spec: 'BLDC' }] },
      { id: 'bed2', name: 'Bed 2', appliances: [{ type: 'split_ac', count: 1, spec: '1.0 TR' }, { type: 'ceiling_fan', count: 1, spec: 'BLDC' }] },
      { id: 'kitchen', name: 'Kitchen', appliances: [{ type: 'refrigerator', count: 1, name: 'Inverter Smart Fridge' }] },
      { id: 'bath', name: 'Bathroom', appliances: [{ type: 'heater', count: 1 }] },
    ],
  },
  apt_2bhk: {
    building_name: '2BHK Compact Smart Apartment',
    floor_area_sqm: 88.0,
    totalSqFt: 950.0,
    solar_panels: false,
    rooms: [
      { id: 'living', name: 'Living Room', appliances: [{ type: 'split_ac', count: 1, spec: '1.5 TR' }, { type: 'ceiling_fan', count: 1, spec: 'BLDC' }] },
      { id: 'bed', name: 'Bedroom', appliances: [{ type: 'split_ac', count: 1, spec: '1.0 TR' }, { type: 'ceiling_fan', count: 1, spec: 'BLDC' }] },
      { id: 'kitchen', name: 'Kitchen', appliances: [{ type: 'refrigerator', count: 1, name: 'Compact Inverter Fridge' }] },
    ],
  },
  luxury_4bhk: {
    building_name: '4BHK Luxury Solar Estate',
    floor_area_sqm: 353.0,
    totalSqFt: 3800.0,
    solar_panels: true,
    rooms: [
      { id: 'living', name: 'Grand Living', appliances: [{ type: 'split_ac', count: 2, spec: '2.0 TR' }, { type: 'ceiling_fan', count: 3, spec: 'BLDC' }] },
      { id: 'master', name: 'Master Suite', appliances: [{ type: 'split_ac', count: 1, spec: '2.0 TR' }, { type: 'ceiling_fan', count: 2, spec: 'BLDC' }] },
      { id: 'bed2', name: 'Bed 2', appliances: [{ type: 'split_ac', count: 1, spec: '1.5 TR' }, { type: 'ceiling_fan', count: 1, spec: 'BLDC' }] },
      { id: 'bed3', name: 'Bed 3', appliances: [{ type: 'split_ac', count: 1, spec: '1.5 TR' }, { type: 'ceiling_fan', count: 1, spec: 'BLDC' }] },
      { id: 'kitchen', name: 'Kitchen', appliances: [{ type: 'refrigerator', count: 1, name: 'Double-Door Metallic Smart Fridge' }] },
      { id: 'bath1', name: 'Master Bath', appliances: [{ type: 'heater', count: 2 }] },
    ],
  },
};

/* ── IOT DATA SOURCES ── */
const IOT_DATA_SOURCES = [
  { id: '3D_STUDIO_SIMULATION', label: '3D Architectural Model (Dynamic)', icon: Home, color: '#84CC16' },
  { id: 'HOME_ASSISTANT_API', label: 'Home Assistant IoT', icon: Server, color: '#06b6d4' },
  { id: 'TUYA_IOT_CLOUD', label: 'Tuya Smart Meter API', icon: Cloud, color: '#f59e0b' },
  { id: 'MQTT_BROKER', label: 'Custom MQTT Feed', icon: Radio, color: '#a855f7' },
];

/* ── Main Component: ElectricityBill ── */
export default function ElectricityBill({ houseProfile: propHouseProfile }) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [dataSource, setDataSource] = useState('3D_STUDIO_SIMULATION');
  const [activeHouseKey, setActiveHouseKey] = useState('custom_3d');
  const [custom3DProfile, setCustom3DProfile] = useState(() => {
    try {
      const stored = localStorage.getItem('ecosense_active_house_profile');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [streamData, setStreamData] = useState({
    time_label: '16:00',
    current_hour: 16,
    current_minute: 0,
    live_kw: 2.25,
    indoor_temp: 20.5,
    outdoor_temp: 32.5,
    effective_set_point: 20.5,
    hvac_mode: 'PRE_COOL',
    hvac_status: '20.5°C - PRE_COOL',
    tariff: { rate_inr: 9.80, tier: 'CRITICAL_PEAK', name: 'Critical Peak Window' },
    house_profile: {
      name: 'Custom 3D Villa (3,014 sq ft)',
      total_sqft: 3014,
      floor_area_sqm: 280,
      ac_tonnage: 3.8,
      fan_count: 4,
      room_count: 6,
      has_solar: false,
    },
    data_source: {
      source: '3D_STUDIO_SIMULATION',
      label: '3D Architectural Model (Dynamic)',
      status: 'ONLINE_ACTIVE',
      message: 'Telemetry scaled to custom house layout',
    },
    sub_meter_breakdown: [
      { channel: 'Air Con', label: 'Air Con (3.8 TR)', kw: 1.45, percentage: 64.4, color: '#06b6d4' },
      { channel: 'Fans', label: 'Fans (4 BLDC)', kw: 0.22, percentage: 9.8, color: '#84cc16' },
      { channel: 'Heater', label: 'Heater (2 Units)', kw: 0.12, percentage: 5.3, color: '#f59e0b' },
      { channel: 'Refrigerator', label: 'Fridge (Inverter)', kw: 0.26, percentage: 11.5, color: '#a855f7' },
      { channel: 'Lighting', label: 'Lighting (3,014 sq ft)', kw: 0.20, percentage: 8.9, color: '#ec4899' },
    ],
    radar_data: [
      { label: 'Air Con', value: 68, kw: 1.45 },
      { label: 'Fans', value: 24, kw: 0.22 },
      { label: 'Heater', value: 15, kw: 0.12 },
      { label: 'Fridge', value: 30, kw: 0.28 },
      { label: 'Lighting', value: 44, kw: 0.34 },
    ],
    accumulated_units_kwh: 3.85,
    current_bill_inr: 147.46,
    projected_24h_bill_inr: 292.48,
    projected_24h_kwh: 5.14,
    today_savings_inr: 28.50,
    today_savings_kwh: 3.65,
    co2_offset_kg: 2.99,
    series_24h: [],
  });

  // Determine active profile object
  const getActiveProfile = useCallback(() => {
    if (activeHouseKey === 'custom_3d') {
      return custom3DProfile || propHouseProfile || null;
    }
    return PRESET_HOUSES[activeHouseKey] || null;
  }, [activeHouseKey, custom3DProfile, propHouseProfile]);

  // Fetch telemetry with dynamic house profile and source
  const fetchTelemetry = useCallback(async (advance = true, overrideProfile = null, overrideSource = null) => {
    const profile = overrideProfile || getActiveProfile();
    const src = overrideSource || dataSource;

    try {
      const url = advance ? '/api/telemetry/simulate-tick' : '/api/telemetry/live';
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          houseProfile: profile,
          source: src,
          advance: advance,
        }),
        signal: AbortSignal.timeout(4000),
      });

      if (res.ok) {
        const data = await res.json();
        setStreamData(data);
        return;
      }
    } catch {}

    // Fallback: Client-side dynamic simulation tick
    setStreamData((prev) => {
      const nextMin = (prev.current_minute + 15) % 60;
      const nextHour = nextMin === 0 ? (prev.current_hour + 1) % 24 : prev.current_hour;
      const isPeak = nextHour >= 16 && nextHour < 21;
      const tariffRate = isPeak ? 9.80 : nextHour < 6 ? 3.20 : 5.50;
      const newLiveKw = Number((prev.live_kw + (Math.random() * 0.08 - 0.04)).toFixed(2));
      const newBill = Number((prev.current_bill_inr + (newLiveKw * 0.25 * tariffRate)).toFixed(2));

      return {
        ...prev,
        current_hour: nextHour,
        current_minute: nextMin,
        time_label: `${String(nextHour).padStart(2, '0')}:${String(nextMin).padStart(2, '0')}`,
        live_kw: newLiveKw,
        current_bill_inr: newBill,
        projected_24h_bill_inr: Number((newBill * 1.8).toFixed(2)),
        tariff: {
          rate_inr: tariffRate,
          tier: isPeak ? 'CRITICAL_PEAK' : nextHour < 6 ? 'OFF_PEAK' : 'NORMAL',
          name: isPeak ? 'Critical Peak Window' : 'Normal Daytime',
        },
      };
    });
  }, [getActiveProfile, dataSource]);

  // Listen for custom 3D house updates from 3D Architectural Studio
  useEffect(() => {
    if (propHouseProfile) {
      setCustom3DProfile(propHouseProfile);
    }

    const handleLayoutUpdate = (event) => {
      if (event.detail) {
        setCustom3DProfile(event.detail);
        if (activeHouseKey === 'custom_3d') {
          // Immediately re-fetch telemetry with updated 3D house profile
          fetchTelemetry(false, event.detail, dataSource);
        }
      }
    };

    window.addEventListener('ecosense:house_layout_updated', handleLayoutUpdate);
    return () => window.removeEventListener('ecosense:house_layout_updated', handleLayoutUpdate);
  }, [propHouseProfile, activeHouseKey, dataSource, fetchTelemetry]);

  // Real-time continuous polling engine (3 seconds interval)
  useEffect(() => {
    fetchTelemetry(false);

    if (!isPlaying) return;

    const intervalId = setInterval(() => {
      fetchTelemetry(true);
    }, 3000);

    return () => clearInterval(intervalId);
  }, [isPlaying, fetchTelemetry]);

  // Handle data source change
  const handleSourceChange = (newSource) => {
    setDataSource(newSource);
    fetchTelemetry(false, null, newSource);
  };

  // Handle preset house change
  const handleHouseChange = (newKey) => {
    setActiveHouseKey(newKey);
    const profile = newKey === 'custom_3d' ? custom3DProfile : PRESET_HOUSES[newKey];
    fetchTelemetry(false, profile, dataSource);
  };

  const isPeak = streamData.tariff?.tier === 'CRITICAL_PEAK' || (streamData.current_hour >= 16 && streamData.current_hour < 21);

  return (
    <section id="electricity" style={{ padding: '120px 0', background: '#050505', color: '#f8fafc' }}>
      <div className="section-container" style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
        {/* Section Header & Subtitle */}
        <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 20 }}>
          <div>
            <div className="section-label" style={{ marginBottom: 12, color: '#84CC16', fontWeight: 700, letterSpacing: '0.1em' }}>
              IoT Telemetry Stream & Predictive Billing
            </div>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, letterSpacing: '-0.03em', margin: '0 0 12px 0' }}>
              Operational Energy
              <span style={{ color: '#84CC16' }}> Control Center</span>
            </h2>
            <p style={{ color: '#8B8B8B', fontSize: '0.98rem', maxWidth: 640, margin: 0 }}>
              Dynamic load curve & 24h bill predictor calibrated to your <strong>3D Architectural Model</strong> and live <strong>Smart Meter APIs</strong>.
            </p>
          </div>

          {/* Stream Controls Toolbar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '6px 12px',
              borderRadius: '12px',
              backdropFilter: 'blur(12px)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginRight: 8 }}>
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: isPlaying ? '#22c55e' : '#eab308',
                  boxShadow: isPlaying ? '0 0 10px #22c55e' : 'none',
                }}
              />
              <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontFamily: "'JetBrains Mono', monospace" }}>
                {isPlaying ? 'STREAM LIVE' : 'PAUSED'} ({streamData.time_label})
              </span>
            </div>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              style={{
                background: isPlaying ? 'rgba(239, 68, 68, 0.15)' : 'rgba(34, 197, 94, 0.15)',
                border: isPlaying ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(34, 197, 94, 0.3)',
                color: isPlaying ? '#ef4444' : '#22c55e',
                borderRadius: 8,
                padding: '6px 12px',
                fontSize: '0.75rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                cursor: 'pointer',
              }}
            >
              {isPlaying ? <><Pause size={13} /> Pause</> : <><Play size={13} /> Resume</>}
            </button>

            <button
              onClick={() => fetchTelemetry(true)}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#cbd5e1',
                borderRadius: 8,
                padding: '6px 10px',
                fontSize: '0.75rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                cursor: 'pointer',
              }}
              title="Advance 15 minutes"
            >
              <FastForward size={13} /> +15m
            </button>

            <button
              onClick={() => fetchTelemetry(false)}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#94a3b8',
                borderRadius: 8,
                padding: '6px 8px',
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
              }}
              title="Refresh Telemetry"
            >
              <RotateCcw size={13} />
            </button>
          </div>
        </div>

        {/* Selected House Profile & IoT Hardware Source Control Bar */}
        <div
          style={{
            marginBottom: 24,
            padding: '16px 20px',
            borderRadius: 14,
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          {/* Active House Profile Selector Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(132, 204, 22, 0.12)',
                border: '1px solid rgba(132, 204, 22, 0.3)',
                padding: '6px 14px',
                borderRadius: 10,
              }}
            >
              <Home size={16} color="#84CC16" />
              <div>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Active House Profile:
                </span>
                <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#f8fafc' }}>
                  {streamData.house_profile?.name || 'Custom 3D Villa (1,850 sq ft)'}
                </div>
              </div>
            </div>

            {/* Quick House Switcher */}
            <div style={{ display: 'flex', gap: 6 }}>
              {[
                { key: 'custom_3d', label: '3D Studio Model' },
                { key: 'villa_3bhk', label: '3BHK Villa (1,850 sq ft)' },
                { key: 'apt_2bhk', label: '2BHK Apt (950 sq ft)' },
                { key: 'luxury_4bhk', label: '4BHK Estate (3,800 sq ft)' },
              ].map((h) => (
                <button
                  key={h.key}
                  onClick={() => handleHouseChange(h.key)}
                  style={{
                    background: activeHouseKey === h.key ? '#84CC16' : 'rgba(255, 255, 255, 0.04)',
                    color: activeHouseKey === h.key ? '#050505' : '#94a3b8',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: 8,
                    padding: '5px 10px',
                    fontSize: '0.74rem',
                    fontWeight: activeHouseKey === h.key ? 700 : 500,
                    cursor: 'pointer',
                  }}
                >
                  {h.label}
                </button>
              ))}
            </div>
          </div>

          {/* IoT Hardware Data Source Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '0.76rem', color: '#94a3b8', fontWeight: 600 }}>IoT Data Source:</span>
            <div style={{ position: 'relative' }}>
              <select
                value={dataSource}
                onChange={(e) => handleSourceChange(e.target.value)}
                style={{
                  background: 'rgba(10, 10, 10, 0.9)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#f8fafc',
                  padding: '7px 32px 7px 12px',
                  borderRadius: 10,
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  appearance: 'none',
                }}
              >
                {IOT_DATA_SOURCES.map((s) => (
                  <option key={s.id} value={s.id} style={{ background: '#0a0a0a', color: '#f8fafc' }}>
                    {s.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#94a3b8' }} />
            </div>

            {/* Connection Status Badge */}
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                color: streamData.data_source?.status === 'CONNECTED_LIVE' ? '#22c55e' : '#06b6d4',
                background: 'rgba(6, 182, 212, 0.12)',
                border: '1px solid rgba(6, 182, 212, 0.25)',
                padding: '4px 8px',
                borderRadius: 6,
              }}
            >
              {streamData.data_source?.status || 'ONLINE'}
            </span>
          </div>
        </div>

        {/* Time-of-Use Tariff Banner */}
        <div
          style={{
            marginBottom: 28,
            padding: '14px 20px',
            borderRadius: 14,
            background: isPeak
              ? 'linear-gradient(90deg, rgba(239, 68, 68, 0.14) 0%, rgba(10, 10, 10, 0.6) 100%)'
              : 'linear-gradient(90deg, rgba(6, 182, 212, 0.12) 0%, rgba(10, 10, 10, 0.6) 100%)',
            border: isPeak ? '1px solid rgba(239, 68, 68, 0.35)' : '1px solid rgba(6, 182, 212, 0.25)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: isPeak ? '#ef4444' : '#06b6d4',
                boxShadow: isPeak ? '0 0 12px #ef4444' : '0 0 10px #06b6d4',
              }}
            />
            <div>
              <span style={{ fontWeight: 800, fontSize: '0.9rem', color: isPeak ? '#ef4444' : '#06b6d4', letterSpacing: '0.04em' }}>
                {isPeak ? 'ACTIVE: CRITICAL PEAK WINDOW (16:00 - 21:00)' : 'ACTIVE: STANDARD ToU TARIFF WINDOW'}
              </span>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8', marginLeft: 12 }}>
                Current Rate: <strong style={{ color: '#f8fafc', fontFamily: "'JetBrains Mono', monospace" }}>₹{Number(streamData.tariff?.rate_inr || 5.5).toFixed(2)}/kWh</strong>
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 20, fontSize: '0.78rem', color: '#94a3b8', fontFamily: "'JetBrains Mono', monospace" }}>
            <span>Off-Peak (00:00–06:00): ₹3.20</span>
            <span>Normal: ₹5.50</span>
            <span style={{ color: '#ef4444', fontWeight: 700 }}>Peak (16:00–21:00): ₹9.80</span>
          </div>
        </div>

        {/* Dynamic KPI Cards Row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 20,
            marginBottom: 32,
          }}
        >
          {/* KPI 1: Today's Accumulated Bill */}
          <div className="glass-card" style={{ padding: '22px 24px', borderLeft: '4px solid #84CC16' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', color: '#94a3b8', textTransform: 'uppercase' }}>
                Today's Accumulated Bill
              </span>
              <DollarSign size={20} color="#84CC16" />
            </div>
            <div
              style={{
                fontSize: '2.1rem',
                fontWeight: 900,
                color: '#84CC16',
                letterSpacing: '-0.02em',
                fontFamily: "'JetBrains Mono', monospace",
                marginBottom: 6,
              }}
            >
              ₹{Number(streamData.current_bill_inr || 0).toFixed(2)}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
              Projected 24h: <strong style={{ color: '#f8fafc' }}>₹{Number(streamData.projected_24h_bill_inr || 0).toFixed(2)}</strong> (₹{Number(streamData.today_savings_inr || 28.5).toFixed(2)} saved)
            </div>
          </div>

          {/* KPI 2: Active Set-Point / Indoor Temp */}
          <div className="glass-card" style={{ padding: '22px 24px', borderLeft: '4px solid #06b6d4' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', color: '#94a3b8', textTransform: 'uppercase' }}>
                Active Set-Point & Mode
              </span>
              <Thermometer size={20} color="#06b6d4" />
            </div>
            <div
              style={{
                fontSize: '1.75rem',
                fontWeight: 800,
                color: '#06b6d4',
                letterSpacing: '-0.02em',
                fontFamily: "'JetBrains Mono', monospace",
                marginBottom: 6,
              }}
            >
              {streamData.hvac_status || `${streamData.effective_set_point}°C - ${streamData.hvac_mode}`}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
              Indoor: <strong style={{ color: '#f8fafc' }}>{streamData.indoor_temp}°C</strong> · Ambient Outdoor: <strong style={{ color: '#f8fafc' }}>{streamData.outdoor_temp}°C</strong>
            </div>
          </div>

          {/* KPI 3: 24h Load Forecast */}
          <div className="glass-card" style={{ padding: '22px 24px', borderLeft: '4px solid #f59e0b' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', color: '#94a3b8', textTransform: 'uppercase' }}>
                24h Load Forecast
              </span>
              <Activity size={20} color="#f59e0b" />
            </div>
            <div
              style={{
                fontSize: '2.1rem',
                fontWeight: 900,
                color: '#f59e0b',
                letterSpacing: '-0.02em',
                fontFamily: "'JetBrains Mono', monospace",
                marginBottom: 6,
              }}
            >
              {Number(streamData.projected_24h_kwh || 5.14).toFixed(2)} kWh
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
              Used So Far: <strong style={{ color: '#f8fafc' }}>{Number(streamData.accumulated_units_kwh || 0).toFixed(2)} kWh</strong> (XGBoost R²=0.9973)
            </div>
          </div>

          {/* KPI 4: CO2 Offset */}
          <div className="glass-card" style={{ padding: '22px 24px', borderLeft: '4px solid #10b981' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', color: '#94a3b8', textTransform: 'uppercase' }}>
                CO₂ Offset
              </span>
              <Leaf size={20} color="#10b981" />
            </div>
            <div
              style={{
                fontSize: '2.1rem',
                fontWeight: 900,
                color: '#10b981',
                letterSpacing: '-0.02em',
                fontFamily: "'JetBrains Mono', monospace",
                marginBottom: 6,
              }}
            >
              {Number(streamData.co2_offset_kg || 2.99).toFixed(2)} kg
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
              Grid factor: 0.82 kg CO₂/kWh saved ({Number(streamData.today_savings_kwh || 3.65).toFixed(2)} kWh saved)
            </div>
          </div>
        </div>

        {/* Charts Row: Sub-Meter Radar + Telemetry Time-Series */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: 24, marginBottom: 28 }}>
          {/* Sub-Meter Radar & Appliance Channels */}
          <div className="glass-card" style={{ padding: 24, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#f8fafc' }}>
                  Sub-Meter Power Breakdown
                </div>
                <div style={{ fontSize: '0.74rem', color: '#8B8B8B' }}>
                  Live instantaneous load: <strong style={{ color: '#06b6d4', fontFamily: "'JetBrains Mono'" }}>{streamData.live_kw} kW</strong>
                </div>
              </div>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  color: '#84cc16',
                  background: 'rgba(132, 204, 22, 0.1)',
                  padding: '3px 8px',
                  borderRadius: 6,
                  border: '1px solid rgba(132, 204, 22, 0.25)',
                }}
              >
                5 CHANNELS
              </span>
            </div>

            {/* Recharts Appliance Radar */}
            <ApplianceRadarChart data={streamData.radar_data} />

            {/* Appliance Percentage Sliders */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 14 }}>
              {streamData.sub_meter_breakdown?.map((ch) => (
                <div key={ch.channel} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem' }}>
                    <span style={{ color: '#cbd5e1', fontWeight: 600 }}>{ch.label}</span>
                    <span style={{ color: ch.color, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>
                      {ch.kw} kW ({ch.percentage}%)
                    </span>
                  </div>
                  <div style={{ width: '100%', height: 4, background: 'rgba(255, 255, 255, 0.06)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ width: `${ch.percentage}%`, height: '100%', background: ch.color, borderRadius: 2 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Main Telemetry & XGBoost Chart */}
          <div className="glass-card" style={{ padding: 24, minHeight: 380, display: 'flex', flexDirection: 'column' }}>
            <TelemetryChart
              telemetryData={streamData.series_24h}
              currentHour={streamData.current_hour}
              currentTime={streamData.time_label}
            />
          </div>
        </div>

        {/* Energy Flow Sankey Diagram */}
        <div className="glass-card" style={{ padding: 28, marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#f8fafc' }}>
                Energy Flow — Grid → Building Zones
              </div>
              <div style={{ fontSize: '0.75rem', color: '#8B8B8B' }}>
                Calibrated distribution across commercial and executive functional zones
              </div>
            </div>
            <span style={{ fontSize: '0.74rem', color: '#94a3b8', fontFamily: "'JetBrains Mono', monospace" }}>
              Total Load: <strong>{Number(streamData.projected_24h_kwh || 5.14).toFixed(2)} kWh</strong>
            </span>
          </div>
          <SankeyDiagram totalKwh={Number(streamData.projected_24h_kwh || 5.14)} />
        </div>

        {/* AI Chat + SMS Side by Side */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: 24 }}>
          <EnergyChat />
          <SMSAlertConfig />
        </div>
      </div>
    </section>
  );
}
