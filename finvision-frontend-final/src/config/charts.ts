import { COLORS } from '@/lib/constants';

export const CHART_DEFAULTS = {
  margin: { top: 8, right: 16, left: 0, bottom: 8 },
  animationDuration: 600,
  animationEasing: 'ease-out',
  fontSize: 12,
  fontFamily: 'Inter, system-ui, sans-serif',
};

export const CHART_COLORS = {
  primary: COLORS.primary,
  teal: COLORS.teal,
  green: COLORS.green,
  red: COLORS.red,
  amber: COLORS.amber,
  purple: '#7C3AED',
  gray: COLORS.textMuted,
};

export const GRID_STYLE = {
  stroke: COLORS.border,
  strokeDasharray: '3 3',
};

export const AXIS_STYLE = {
  tick: { fill: COLORS.textMuted, fontSize: 11 },
  axisLine: { stroke: COLORS.border },
  tickLine: { stroke: 'transparent' },
};

export const TOOLTIP_STYLE = {
  contentStyle: {
    background: '#fff',
    border: `1px solid ${COLORS.border}`,
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    fontSize: 12,
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  labelStyle: { color: COLORS.textSecondary, fontWeight: 600 },
  itemStyle: { color: COLORS.textPrimary },
};

export const CANDLESTICK_CONFIG = {
  upColor: COLORS.green,
  downColor: COLORS.red,
  upBorderColor: COLORS.green,
  downBorderColor: COLORS.red,
  wickColor: COLORS.textMuted,
};
