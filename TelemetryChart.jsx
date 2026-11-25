import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceArea,
  ReferenceLine,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { Zap, Clock } from 'lucide-react';

/* ── Custom Glassmorphic Tooltip ── */
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isPeak = data.is_peak || (data.hour >= 16 && data.hour < 21);
    const tariff = data.tariff_rate || (isPeak ? 9.80 : (data.hour < 6 ? 3.20 : 5.50));
    const liveKwh = data.actual_kwh ?? data.live_kw;
    const forecastKwh = data.forecast_kwh;

    return (
      <div
        style={{
          background: 'rgba(10, 10, 10, 0.92)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          backdropFilter: 'blur(16px)',
          borderRadius: '12px',
          padding: '12px 16px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.8)',
          minWidth: '200px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: '0.85rem', color: '#f8fafc' }}>
            {label}
          </span>
          {isPeak && (
            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                color: '#ef4444',
                background: 'rgba(239, 68, 68, 0.15)',
                padding: '2px 6px',
                borderRadius: '4px',
                border: '1px solid rgba(239, 68, 68, 0.3)',
              }}
            >
              CRITICAL PEAK
            </span>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.78rem' }}>
          {liveKwh !== null && liveKwh !== undefined && (
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#06b6d4' }}>
              <span>Live IoT Load:</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>
                {Number(liveKwh).toFixed(2)} kWh
              </span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981' }}>
            <span>XGBoost Forecast:</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>
              {Number(forecastKwh).toFixed(2)} kWh
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#f59e0b' }}>
            <span>ToU Tariff:</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>
              ₹{Number(tariff).toFixed(2)}/kWh
            </span>
          </div>
          {data.temp && (
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
              <span>Ambient Temp:</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{data.temp}°C</span>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

/* ── Main Telemetry & Load Forecast Chart Component ── */
export default function TelemetryChart({ telemetryData = [], currentHour = 16, currentTime = "16:00" }) {
  // Generate high-fidelity default 24h series if data is missing
  const chartData = (telemetryData && telemetryData.length >= 24)
    ? telemetryData
    : Array.from({ length: 24 }).map((_, h) => {
        const isPeak = (h >= 16 && h < 21);
        const tariff = isPeak ? 9.80 : (h < 6 ? 3.20 : 5.50);
        const temp = 25.0 + 8.5 * Math.sin(Math.PI * (h - 9) / 12);
        const base = 0.5 + 0.08 * (temp - 20) + 0.6 * Math.sin(2 * Math.PI * (h - 6) / 24);
        const peakAdd = isPeak ? 1.4 : 0;
        const live = Number((base + peakAdd).toFixed(2));
        const forecast = Number((live * 0.95 + 0.12).toFixed(2));

        return {
          hour: h,
          label: `${String(h).padStart(2, '0')}:00`,
          actual_kwh: h <= currentHour ? live : null,
          live_kw: live,
          forecast_kwh: forecast,
          tariff_rate: tariff,
          is_peak: isPeak,
          temp: Number(temp.toFixed(1))
        };
      });

  const maxKwh = Math.max(
    ...chartData.map(d => Math.max(d.actual_kwh || 0, d.forecast_kwh || 0))
  );
  const yDomainMax = Math.ceil(maxKwh * 1.25);

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Chart Header & Executive Legend */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'rgba(6, 182, 212, 0.12)',
              border: '1px solid rgba(6, 182, 212, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Zap size={18} color="#06b6d4" />
          </div>
          <div>
            <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
              Telemetry vs. XGBoost Load Forecast (24h)
            </h3>
            <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
              Continuous IoT sampling · XGBoost dynamic load curve · ToU tariff bands
            </span>
          </div>
        </div>

        {/* Legend Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', fontSize: '0.78rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: 14, height: 4, background: '#06b6d4', borderRadius: 2 }} />
            <span style={{ color: '#cbd5e1', fontWeight: 600 }}>Live IoT kWh</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: 14, height: 0, borderTop: '2px dashed #10b981' }} />
            <span style={{ color: '#cbd5e1', fontWeight: 600 }}>XGBoost Baseline</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                width: 12,
                height: 12,
                background: 'rgba(239, 68, 68, 0.22)',
                border: '1px solid #ef4444',
                borderRadius: 2,
              }}
            />
            <span style={{ color: '#ef4444', fontWeight: 700 }}>Critical Peak (₹9.80)</span>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              padding: '3px 8px',
              borderRadius: '6px',
              color: '#f59e0b',
              fontSize: '0.72rem',
              fontWeight: 700,
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            <Clock size={12} />
            {currentTime}
          </div>
        </div>
      </div>

      {/* Main Recharts Container */}
      <div style={{ width: '100%', height: 260, position: 'relative' }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 12, right: 12, left: -16, bottom: 0 }}>
            <defs>
              {/* Cyan gradient for Live IoT load area */}
              <linearGradient id="liveKwhGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.4} />
                <stop offset="85%" stopColor="#06b6d4" stopOpacity={0.03} />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid stroke="rgba(255, 255, 255, 0.05)" strokeDasharray="3 3" vertical={false} />

            {/* Critical Peak Tariff Overlay (16:00 to 21:00) */}
            <ReferenceArea
              x1="16:00"
              x2="21:00"
              stroke="#ef4444"
              strokeOpacity={0.35}
              strokeDasharray="4 2"
              fill="#ef4444"
              fillOpacity={0.12}
            />

            <XAxis
              dataKey="label"
              stroke="#475569"
              tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}
              axisLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
              tickLine={false}
              interval={2}
            />

            <YAxis
              stroke="#475569"
              domain={[0, yDomainMax]}
              tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}
              axisLine={false}
              tickLine={false}
              unit=" kW"
            />

            <Tooltip content={<CustomTooltip />} />

            {/* Current Hour Indicator Line */}
            {currentHour >= 0 && currentHour < 24 && (
              <ReferenceLine
                x={`${String(currentHour).padStart(2, '0')}:00`}
                stroke="#f59e0b"
                strokeWidth={1.5}
                strokeDasharray="3 3"
              />
            )}

            {/* Solid Cyan Area: Live IoT kWh (Historical up to current hour) */}
            <Area
              type="monotone"
              dataKey="actual_kwh"
              stroke="#06b6d4"
              strokeWidth={2.5}
              fill="url(#liveKwhGradient)"
              isAnimationActive={false}
              connectNulls={false}
              dot={{ r: 3, fill: '#06b6d4', stroke: '#0a0a0a', strokeWidth: 1 }}
              activeDot={{ r: 6, fill: '#06b6d4', stroke: '#ffffff', strokeWidth: 2 }}
            />

            {/* Dashed Green Line: Full 24H XGBoost Predicted Baseline Curve */}
            <Line
              type="monotone"
              dataKey="forecast_kwh"
              stroke="#10b981"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ── Recharts Appliance Usage Radar Chart Component ── */
export function ApplianceRadarChart({ data = [] }) {
  const radarData = data && data.length === 5 ? data : [
    { label: 'Air Con', value: 68, kw: 1.45 },
    { label: 'Fans', value: 24, kw: 0.22 },
    { label: 'Heater', value: 15, kw: 0.12 },
    { label: 'Fridge', value: 30, kw: 0.28 },
    { label: 'Lighting', value: 44, kw: 0.34 },
  ];

  return (
    <div style={{ width: '100%', height: 260, position: 'relative' }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="72%" data={radarData}>
          <PolarGrid stroke="rgba(255, 255, 255, 0.08)" />
          <PolarAngleAxis
            dataKey="label"
            tick={{ fill: '#cbd5e1', fontSize: 11, fontFamily: "'Outfit', sans-serif", fontWeight: 600 }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tick={false}
            axisLine={false}
          />
          <Radar
            name="Power Draw (%)"
            dataKey="value"
            stroke="#84cc16"
            strokeWidth={2}
            fill="#84cc16"
            fillOpacity={0.22}
            isAnimationActive={false}
            dot={{ r: 4, fill: '#84cc16', stroke: '#0a0a0a', strokeWidth: 1.5 }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
