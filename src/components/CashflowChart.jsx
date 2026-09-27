import React, { useState } from 'react';
import { formatINR } from '../engine/cashflowEngine';

export default function CashflowChart({ 
  timeline = [], 
  safetyBuffer = 3000, 
  showConfidenceRange = true,
  height = 240
}) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  if (!timeline || timeline.length === 0) return null;

  // Compute scale boundaries
  const allBalances = timeline.map(d => d.projectedBalance);
  const allOptimistic = timeline.map(d => d.optimisticBalance);
  const allConservative = timeline.map(d => d.conservativeBalance);
  const allIncome = timeline.map(d => d.income);
  const allExpenses = timeline.map(d => d.expenses);

  const maxVal = Math.max(
    ...allBalances, 
    ...allOptimistic, 
    ...allIncome, 
    ...allExpenses, 
    safetyBuffer * 1.5,
    10000
  );
  const minVal = Math.min(...allBalances, ...allConservative, 0, -2000);
  const valueRange = maxVal - minVal === 0 ? 1 : maxVal - minVal;

  const chartWidth = 720;
  const paddingLeft = 45;
  const paddingRight = 25;
  const paddingTop = 30;
  const paddingBottom = 40;
  const usableWidth = chartWidth - paddingLeft - paddingRight;
  const usableHeight = height - paddingTop - paddingBottom;

  const getY = (val) => {
    return paddingTop + usableHeight - ((val - minVal) / valueRange) * usableHeight;
  };

  const getX = (idx) => {
    return paddingLeft + (idx / Math.max(1, timeline.length - 1)) * usableWidth;
  };

  // Build projected balance line path
  const linePoints = timeline.map((d, i) => `${getX(i)},${getY(d.projectedBalance)}`).join(' ');

  // Build confidence range area polygon
  const optimisticPoints = timeline.map((d, i) => `${getX(i)},${getY(d.optimisticBalance)}`);
  const conservativePoints = [...timeline].reverse().map((d, i) => {
    const origIdx = timeline.length - 1 - i;
    return `${getX(origIdx)},${getY(d.conservativeBalance)}`;
  });
  const confidencePolygon = [...optimisticPoints, ...conservativePoints].join(' ');

  // Safety buffer reference line Y
  const bufferY = getY(safetyBuffer);
  const zeroY = getY(0);

  return (
    <div style={{ position: 'relative', width: '100%', userSelect: 'none' }}>
      <svg 
        viewBox={`0 0 ${chartWidth} ${height}`} 
        style={{ width: '100%', height: 'auto', overflow: 'visible' }}
      >
        <defs>
          <linearGradient id="balanceLineGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#18181B" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#18181B" stopOpacity="0.0" />
          </linearGradient>

          <pattern id="diagonalHatch" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="8" stroke="#FDBA74" strokeWidth="1" strokeOpacity="0.4" />
          </pattern>
        </defs>

        {/* Horizontal grid lines */}
        {[0.25, 0.5, 0.75, 1].map((ratio) => {
          const val = minVal + ratio * valueRange;
          const y = getY(val);
          return (
            <g key={ratio}>
              <line
                x1={paddingLeft}
                y1={y}
                x2={chartWidth - paddingRight}
                y2={y}
                stroke="#F0EBE1"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
              <text
                x={paddingLeft - 8}
                y={y + 3}
                textAnchor="end"
                fontSize="10"
                fill="#A8A29E"
                fontWeight="500"
              >
                {Math.round(val / 1000)}k
              </text>
            </g>
          );
        })}

        {/* Safety buffer guideline */}
        <line
          x1={paddingLeft}
          y1={bufferY}
          x2={chartWidth - paddingRight}
          y2={bufferY}
          stroke="#10B981"
          strokeDasharray="3 3"
          strokeWidth="1.2"
          opacity="0.6"
        />
        <text
          x={chartWidth - paddingRight + 4}
          y={bufferY + 3}
          fontSize="9"
          fill="#10B981"
          fontWeight="700"
        >
          Buffer
        </text>

        {/* Zero baseline if in view */}
        {zeroY >= paddingTop && zeroY <= height - paddingBottom && (
          <line
            x1={paddingLeft}
            y1={zeroY}
            x2={chartWidth - paddingRight}
            y2={zeroY}
            stroke="#EF4444"
            strokeWidth="1"
            opacity="0.5"
          />
        )}

        {/* Confidence Range Shading */}
        {showConfidenceRange && (
          <polygon
            points={confidencePolygon}
            fill="#FFF7ED"
            stroke="#FED7AA"
            strokeWidth="1"
            strokeDasharray="2 2"
            opacity="0.8"
          />
        )}

        {/* Bars for daily Income and Expenses */}
        {timeline.map((d, i) => {
          const cx = getX(i);
          const barWidth = Math.max(5, Math.min(14, usableWidth / (timeline.length * 2.8)));
          
          const expH = Math.max(0, ((d.expenses) / valueRange) * usableHeight);
          const incH = Math.max(0, ((d.income) / valueRange) * usableHeight);
          
          const expY = zeroY - expH;
          const incY = zeroY - incH;

          return (
            <g key={d.dayIndex}>
              {/* Income bar (green) */}
              {d.income > 0 && (
                <rect
                  x={cx - barWidth - 1}
                  y={incY}
                  width={barWidth}
                  height={expH > 0 && incH < 4 ? 4 : incH}
                  rx="3"
                  fill="#10B981"
                  opacity="0.85"
                />
              )}

              {/* Expense bar (orange) */}
              {d.expenses > 0 && (
                <rect
                  x={cx + 1}
                  y={expY}
                  width={barWidth}
                  height={Math.max(4, expH)}
                  rx="3"
                  fill="#F97316"
                  opacity="0.85"
                />
              )}
            </g>
          );
        })}

        {/* Area fill under projected balance line */}
        <polygon
          points={`${paddingLeft},${zeroY} ${linePoints} ${getX(timeline.length - 1)},${zeroY}`}
          fill="url(#balanceLineGrad)"
        />

        {/* Projected Balance Line */}
        <polyline
          fill="none"
          stroke="#18181B"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={linePoints}
        />

        {/* Interactive Dots & Tooltip trigger columns */}
        {timeline.map((d, i) => {
          const cx = getX(i);
          const cy = getY(d.projectedBalance);
          const isHovered = hoveredIdx === i;
          const isShortfall = d.projectedBalance < safetyBuffer;

          return (
            <g key={`dot-${i}`}>
              {/* Invisible wide hover capture strip */}
              <rect
                x={cx - (usableWidth / timeline.length) / 2}
                y={paddingTop}
                width={usableWidth / timeline.length}
                height={usableHeight}
                fill="transparent"
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
                style={{ cursor: 'pointer' }}
              />

              {/* Vertical crosshair on hover */}
              {isHovered && (
                <line
                  x1={cx}
                  y1={paddingTop}
                  x2={cx}
                  y2={height - paddingBottom}
                  stroke="#EA580C"
                  strokeWidth="1.2"
                  strokeDasharray="2 2"
                />
              )}

              {/* Data point dot */}
              <circle
                cx={cx}
                cy={cy}
                r={isHovered ? 5.5 : 3.5}
                fill={isShortfall ? '#EF4444' : '#18181B'}
                stroke="#FFFFFF"
                strokeWidth={isHovered ? 2.5 : 1.5}
                style={{ transition: 'r 0.15s ease' }}
              />

              {/* X-axis date labels */}
              {(i % 2 === 0 || timeline.length <= 7 || isHovered) && (
                <text
                  x={cx}
                  y={height - paddingBottom + 18}
                  textAnchor="middle"
                  fontSize={isHovered ? '11' : '10'}
                  fontWeight={isHovered ? '700' : '500'}
                  fill={isHovered ? '#EA580C' : '#78716C'}
                >
                  {d.dayLabel}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Floating Tooltip Card matching the screenshot aesthetic */}
      {hoveredIdx !== null && timeline[hoveredIdx] && (
        <div style={{
          position: 'absolute',
          left: `${(getX(hoveredIdx) / chartWidth) * 100}%`,
          top: `${Math.max(10, (getY(timeline[hoveredIdx].projectedBalance) / height) * 100 - 35)}%`,
          transform: 'translate(-50%, -100%)',
          background: '#18181B',
          color: '#FFFFFF',
          padding: '10px 14px',
          borderRadius: '12px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          pointerEvents: 'none',
          zIndex: 20,
          whiteSpace: 'nowrap',
          fontSize: '0.8rem',
          lineHeight: '1.4'
        }}>
          <div style={{ fontWeight: 800, color: '#E4E4E7', marginBottom: '4px', borderBottom: '1px solid #27272A', paddingBottom: '3px' }}>
            {timeline[hoveredIdx].dayLabel} 2025
          </div>
          {timeline[hoveredIdx].income > 0 && (
            <div style={{ color: '#34D399', display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
              <span>Income:</span>
              <span style={{ fontWeight: 700 }}>+{formatINR(timeline[hoveredIdx].income)}</span>
            </div>
          )}
          <div style={{ color: '#FB923C', display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
            <span>Expenses:</span>
            <span style={{ fontWeight: 700 }}>-{formatINR(timeline[hoveredIdx].expenses)}</span>
          </div>
          <div style={{ color: '#FFFFFF', fontWeight: 800, marginTop: '2px', display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
            <span>Projected:</span>
            <span>{formatINR(timeline[hoveredIdx].projectedBalance)}</span>
          </div>

          {showConfidenceRange && (
            <div style={{ fontSize: '0.72rem', color: '#A1A1AA', marginTop: '4px', paddingTop: '3px', borderTop: '1px dashed #27272A' }}>
              Range: {formatINR(timeline[hoveredIdx].conservativeBalance)} – {formatINR(timeline[hoveredIdx].optimisticBalance)}
            </div>
          )}

          {timeline[hoveredIdx].commitmentsList?.length > 0 && (
            <div style={{ fontSize: '0.72rem', color: '#F87171', marginTop: '2px' }}>
              Due: {timeline[hoveredIdx].commitmentsList.map(c => `${c.title} (${formatINR(c.amount)})`).join(', ')}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
