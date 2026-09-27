import React, { useState, useMemo, useRef } from 'react';
import { formatINR } from '../engine/cashflowEngine.js';
import { soundFX } from '../engine/audioEffects.js';
import { ShieldCheck, AlertTriangle, TrendingDown, TrendingUp, Sparkles } from 'lucide-react';

/**
 * Catmull-Rom to Cubic Bezier curve path generator
 * Creates continuous C1 smooth spline curves through data points
 */
function createSmoothSplinePath(points) {
  if (!points || points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x},${points[0].y}`;
  if (points.length === 2) return `M ${points[0].x},${points[0].y} L ${points[1].x},${points[1].y}`;

  let d = `M ${points[0].x},${points[0].y}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = i > 0 ? points[i - 1] : points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = i < points.length - 2 ? points[i + 2] : p2;

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${cp1x.toFixed(2)},${cp1y.toFixed(2)} ${cp2x.toFixed(2)},${cp2y.toFixed(2)} ${p2.x.toFixed(2)},${p2.y.toFixed(2)}`;
  }

  return d;
}

export default function PaisaTwinCurve({
  timeline = [],
  safetyBuffer = 3000,
  currentCash = 0,
  minimumProjectedBalance = 0,
  minimumProjectedDate = '',
  height = 280
}) {
  const [horizon, setHorizon] = useState('30d'); // '7d' | '14d' | '30d'
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const containerRef = useRef(null);

  // Filter timeline based on active horizon
  const activeTimeline = useMemo(() => {
    if (!timeline || timeline.length === 0) return [];
    const count = horizon === '7d' ? 7 : horizon === '14d' ? 14 : 30;
    return timeline.slice(0, count);
  }, [timeline, horizon]);

  // Scaled boundaries
  const { minVal, maxVal, valueRange } = useMemo(() => {
    if (activeTimeline.length === 0) {
      return { minVal: 0, maxVal: 50000, valueRange: 50000 };
    }
    const balances = activeTimeline.map(d => d.closingBalance ?? d.projectedBalance ?? 0);
    const rawMax = Math.max(...balances, safetyBuffer * 1.3, 10000);
    const rawMin = Math.min(...balances, 0, -1000);

    // Add breathing room
    const paddingMargin = (rawMax - rawMin) * 0.12;
    const maxVal = Math.round(rawMax + paddingMargin);
    const minVal = Math.round(rawMin - paddingMargin * 0.5);
    const valueRange = maxVal - minVal === 0 ? 1 : maxVal - minVal;

    return { minVal, maxVal, valueRange };
  }, [activeTimeline, safetyBuffer]);

  const chartWidth = 840;
  const paddingLeft = 48;
  const paddingRight = 48;
  const paddingTop = 36;
  const paddingBottom = 44;
  const usableWidth = chartWidth - paddingLeft - paddingRight;
  const usableHeight = height - paddingTop - paddingBottom;

  const getY = (val) => {
    return paddingTop + usableHeight - ((val - minVal) / valueRange) * usableHeight;
  };

  const getX = (idx) => {
    if (activeTimeline.length <= 1) return paddingLeft + usableWidth / 2;
    return paddingLeft + (idx / (activeTimeline.length - 1)) * usableWidth;
  };

  // Convert points for spline curve
  const points = useMemo(() => {
    return activeTimeline.map((d, i) => ({
      x: getX(i),
      y: getY(d.closingBalance ?? d.projectedBalance ?? 0),
      raw: d,
      index: i
    }));
  }, [activeTimeline, minVal, valueRange, usableWidth, usableHeight]);

  const curvePath = useMemo(() => createSmoothSplinePath(points), [points]);

  // Area path: curve + closed bottom
  const zeroY = getY(0);
  const bottomFillY = Math.min(height - paddingBottom, Math.max(paddingTop, getY(minVal)));
  const areaPath = useMemo(() => {
    if (points.length === 0) return '';
    const first = points[0];
    const last = points[points.length - 1];
    return `${curvePath} L ${last.x},${bottomFillY} L ${first.x},${bottomFillY} Z`;
  }, [curvePath, points, bottomFillY]);

  const bufferY = getY(safetyBuffer);

  // Find lowest point in active timeline
  const lowestPoint = useMemo(() => {
    if (points.length === 0) return null;
    let lowest = points[0];
    points.forEach(p => {
      const b = p.raw.closingBalance ?? p.raw.projectedBalance ?? 0;
      const curLowest = lowest.raw.closingBalance ?? lowest.raw.projectedBalance ?? 0;
      if (b < curLowest) lowest = p;
    });
    return lowest;
  }, [points]);

  // Find major inflow point (stipend/salary)
  const inflowPoint = useMemo(() => {
    if (points.length === 0) return null;
    let best = null;
    points.forEach(p => {
      if ((p.raw.income || 0) > 3000) {
        if (!best || (p.raw.income || 0) > (best.raw.income || 0)) {
          best = p;
        }
      }
    });
    return best;
  }, [points]);

  const activeHoveredPoint = hoveredIdx !== null && points[hoveredIdx] ? points[hoveredIdx] : null;

  const handleHorizonSwitch = (mode) => {
    if (mode === horizon) return;
    soundFX.playClick();
    setHorizon(mode);
    setHoveredIdx(null);
  };

  const handleMouseMove = (e) => {
    if (!containerRef.current || points.length === 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const relX = (clientX / rect.width) * chartWidth;

    // Find nearest point by X coordinate
    let nearestIdx = 0;
    let minDiff = Infinity;
    points.forEach((p, idx) => {
      const diff = Math.abs(p.x - relX);
      if (diff < minDiff) {
        minDiff = diff;
        nearestIdx = idx;
      }
    });

    setHoveredIdx(nearestIdx);
  };

  const handleMouseLeave = () => {
    setHoveredIdx(null);
  };

  return (
    <div className="border border-line-medium bg-ivory rounded-xl overflow-hidden p-5 sm:p-6 space-y-4 shadow-sm">
      {/* 1. Curve Control Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-line-light">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-coral animate-pulse" />
            <h3 className="font-editorial text-lg sm:text-xl text-ink font-normal">
              Forward Cashflow Trajectory
            </h3>
            <span className="text-[10px] font-accent uppercase tracking-widest text-ink-muted border border-line-medium px-2 py-0.5 rounded-full">
              Deterministic Simulation
            </span>
          </div>
          <p className="font-sans text-xs text-ink-muted">
            Physics-based model tracking daily burn velocity against fixed bank auto-debits.
          </p>
        </div>

        {/* Horizon Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-[#F5EFE6] p-1 rounded-lg border border-line-light self-start sm:self-auto">
          {[
            { key: '7d', label: '7 Days' },
            { key: '14d', label: '14 Days' },
            { key: '30d', label: '30 Days' }
          ].map(tab => {
            const isActive = horizon === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => handleHorizonSwitch(tab.key)}
                className={`px-3 py-1 text-xs font-sans rounded-md transition-all ${
                  isActive
                    ? 'bg-ink text-ivory font-semibold shadow-xs'
                    : 'text-ink-muted hover:text-ink hover:bg-ivory/60'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Interactive Scrubber HUD / Status Pill Bar */}
      <div className="min-h-[46px] px-3.5 py-2.5 bg-[#FFFDF9] border border-line-medium rounded-lg flex items-center justify-between flex-wrap gap-2 text-xs">
        {activeHoveredPoint ? (
          <>
            <div className="flex items-center gap-3">
              <span className="font-sans font-bold text-ink">
                {activeHoveredPoint.raw.date}
              </span>
              <span className="text-ink-muted">·</span>
              <span className="font-sans text-ink-muted">
                Balance:
              </span>
              <span className={`font-mono font-bold text-sm ${
                (activeHoveredPoint.raw.closingBalance ?? 0) < 0 
                  ? 'text-coral' 
                  : (activeHoveredPoint.raw.closingBalance ?? 0) < safetyBuffer 
                  ? 'text-amber-600' 
                  : 'text-ink'
              }`}>
                {formatINR(activeHoveredPoint.raw.closingBalance ?? 0)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {activeHoveredPoint.raw.commitmentsList && activeHoveredPoint.raw.commitmentsList.length > 0 ? (
                <span className="px-2 py-0.5 rounded bg-coral/10 text-coral font-medium flex items-center gap-1">
                  <span>Outflow:</span>
                  <strong>{activeHoveredPoint.raw.commitmentsList.map(c => c.title || c.name).join(', ')} (-{formatINR(activeHoveredPoint.raw.commitmentsList.reduce((s, c) => s + c.amount, 0))})</strong>
                </span>
              ) : (activeHoveredPoint.raw.income || 0) > 0 ? (
                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-medium flex items-center gap-1">
                  <span>Inflow:</span>
                  <strong>+{formatINR(activeHoveredPoint.raw.income)}</strong>
                </span>
              ) : (
                <span className="text-ink-muted font-sans">
                  Daily Burn: -{formatINR(activeHoveredPoint.raw.expenses || 0)}
                </span>
              )}

              {(activeHoveredPoint.raw.closingBalance ?? 0) < 0 ? (
                <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-bold uppercase tracking-wider">
                  Deficit Risk
                </span>
              ) : (activeHoveredPoint.raw.closingBalance ?? 0) < safetyBuffer ? (
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold uppercase tracking-wider">
                  Buffer Cushion
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wider">
                  Solvent
                </span>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-between w-full text-ink-muted">
            <span className="flex items-center gap-1.5">
              <Sparkles size={13} className="text-coral" />
              <span>Hover anywhere across the curve to inspect day-by-day cashflow movements.</span>
            </span>
            <span className="font-mono text-[11px] text-ink-muted hidden sm:inline">
              Reserve Floor: <strong className="text-emerald-700 font-semibold">{formatINR(safetyBuffer)}</strong>
            </span>
          </div>
        )}
      </div>

      {/* 3. The Living SVG Spline Curve */}
      <div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative w-full cursor-crosshair select-none"
        style={{ touchAction: 'pan-y' }}
      >
        <svg
          viewBox={`0 0 ${chartWidth} ${height}`}
          className="w-full h-auto overflow-visible"
        >
          <defs>
            {/* Soft Warm Champagne Area Gradient */}
            <linearGradient id="ptCurveGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FF6244" stopOpacity="0.14" />
              <stop offset="50%" stopColor="#FFF2DB" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#FFF2DB" stopOpacity="0.0" />
            </linearGradient>

            {/* Glowing filter for critical milestone dots */}
            <filter id="ptGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#FF6244" floodOpacity="0.3" />
            </filter>
          </defs>

          {/* Horizontal Gridlines */}
          {[0.25, 0.5, 0.75].map(ratio => {
            const val = minVal + ratio * valueRange;
            const y = getY(val);
            return (
              <g key={ratio}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={chartWidth - paddingRight}
                  y2={y}
                  stroke="#EFE8DF"
                  strokeWidth="0.8"
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 3}
                  textAnchor="end"
                  fontSize="10"
                  fill="#A8A29E"
                  fontFamily="var(--font-mono)"
                >
                  {Math.round(val / 1000)}k
                </text>
              </g>
            );
          })}

          {/* Safety Buffer Guideline */}
          {bufferY >= paddingTop && bufferY <= height - paddingBottom && (
            <g>
              <line
                x1={paddingLeft}
                y1={bufferY}
                x2={chartWidth - paddingRight}
                y2={bufferY}
                stroke="#10B981"
                strokeWidth="1.2"
                strokeDasharray="4 3"
                opacity="0.65"
              />
              <text
                x={chartWidth - paddingRight}
                y={bufferY - 5}
                textAnchor="end"
                fontSize="9.5"
                fill="#059669"
                fontWeight="600"
                fontFamily="var(--font-sans)"
              >
                Protected Buffer ({formatINR(safetyBuffer)})
              </text>
            </g>
          )}

          {/* Zero baseline if in range */}
          {zeroY >= paddingTop && zeroY <= height - paddingBottom && (
            <g>
              <line
                x1={paddingLeft}
                y1={zeroY}
                x2={chartWidth - paddingRight}
                y2={zeroY}
                stroke="#EF4444"
                strokeWidth="1.2"
                strokeDasharray="3 3"
                opacity="0.55"
              />
              <text
                x={chartWidth - paddingRight}
                y={zeroY + 11}
                textAnchor="end"
                fontSize="9"
                fill="#DC2626"
                fontWeight="600"
                fontFamily="var(--font-mono)"
              >
                ₹0 Deficit Line
              </text>
            </g>
          )}

          {/* Area Fill Under Spline Curve */}
          <path
            d={areaPath}
            fill="url(#ptCurveGradient)"
          />

          {/* Spline Path Line */}
          <path
            d={curvePath}
            fill="none"
            stroke="#1A1815"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Static Milestone Pins (Today & Lowest Point) */}
          {points.length > 0 && (
            <g key="today-pin">
              <circle
                cx={points[0].x}
                cy={points[0].y}
                r="4.5"
                fill="#1A1815"
                stroke="#FFFAF3"
                strokeWidth="2"
              />
              <text
                x={points[0].x}
                y={points[0].y - 9}
                textAnchor="start"
                fontSize="10"
                fontWeight="700"
                fill="#1A1815"
                fontFamily="var(--font-sans)"
              >
                Today ({formatINR(currentCash)})
              </text>
            </g>
          )}

          {/* Lowest Point Callout Marker */}
          {lowestPoint && (lowestPoint.raw.closingBalance ?? 0) < safetyBuffer && (
            <g key="lowest-pin" filter="url(#ptGlow)">
              <circle
                cx={lowestPoint.x}
                cy={lowestPoint.y}
                r="6"
                fill="#FF6244"
                stroke="#FFFFFF"
                strokeWidth="2.5"
              />
              <text
                x={lowestPoint.x}
                y={lowestPoint.y + 18}
                textAnchor="middle"
                fontSize="10"
                fontWeight="800"
                fill="#DC2626"
                fontFamily="var(--font-sans)"
              >
                Low: {formatINR(lowestPoint.raw.closingBalance ?? 0)} ({lowestPoint.raw.date})
              </text>
            </g>
          )}

          {/* Major Inflow Marker (Stipend) */}
          {inflowPoint && (
            <g key="inflow-pin">
              <circle
                cx={inflowPoint.x}
                cy={inflowPoint.y}
                r="5"
                fill="#10B981"
                stroke="#FFFFFF"
                strokeWidth="2"
              />
              <text
                x={inflowPoint.x}
                y={inflowPoint.y - 9}
                textAnchor="middle"
                fontSize="10"
                fontWeight="700"
                fill="#059669"
                fontFamily="var(--font-sans)"
              >
                +{formatINR(inflowPoint.raw.income)} Credit
              </text>
            </g>
          )}

          {/* Dynamic Scrubber Crosshair & Dot */}
          {activeHoveredPoint && (
            <g key="hover-crosshair">
              {/* Vertical tracking line */}
              <line
                x1={activeHoveredPoint.x}
                y1={paddingTop}
                x2={activeHoveredPoint.x}
                y2={height - paddingBottom}
                stroke="#FF6244"
                strokeWidth="1.2"
                strokeDasharray="2 2"
              />

              {/* Pulsing circle on curve */}
              <circle
                cx={activeHoveredPoint.x}
                cy={activeHoveredPoint.y}
                r="7"
                fill="#FF6244"
                stroke="#FFFFFF"
                strokeWidth="3"
                filter="url(#ptGlow)"
              />
            </g>
          )}

          {/* X-Axis Date Labels */}
          {points.map((p, idx) => {
            const isLast = idx === points.length - 1;
            const step = horizon === '7d' ? 1 : horizon === '14d' ? 2 : 5;
            const isLabelVisible = isLast || (idx % step === 0 && idx < points.length - Math.ceil(step * 0.6));

            if (!isLabelVisible) return null;

            return (
              <text
                key={`label-${idx}`}
                x={p.x}
                y={height - paddingBottom + 18}
                textAnchor="middle"
                fontSize="10"
                fill="#78716C"
                fontFamily="var(--font-sans)"
              >
                {p.raw.date}
              </text>
            );
          })}
        </svg>
      </div>

      {/* 4. Bottom Horizon Milestones Strip */}
      <div className="pt-3 border-t border-line-light grid grid-cols-3 divide-x divide-line-light text-center">
        <div className="space-y-0.5 px-2">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-accent">
            7 Days Out
          </div>
          <div className="font-mono font-bold text-ink text-sm sm:text-base">
            {formatINR(timeline[6]?.closingBalance ?? currentCash)}
          </div>
        </div>

        <div className="space-y-0.5 px-2">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-accent">
            14 Days Out
          </div>
          <div className="font-mono font-bold text-ink text-sm sm:text-base">
            {formatINR(timeline[13]?.closingBalance ?? currentCash)}
          </div>
        </div>

        <div className="space-y-0.5 px-2">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-accent">
            30 Days Out
          </div>
          <div className={`font-mono font-bold text-sm sm:text-base ${
            (timeline[29]?.closingBalance ?? 0) < safetyBuffer ? 'text-coral' : 'text-ink'
          }`}>
            {formatINR(timeline[29]?.closingBalance ?? currentCash)}
          </div>
        </div>
      </div>
    </div>
  );
}
