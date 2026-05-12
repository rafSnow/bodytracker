export const CHART_COLORS = {
  primary: '#6366f1', // Indigo 500
  secondary: '#94a3b8', // Slate 400
  success: '#10b981', // Emerald 500
  warning: '#f59e0b', // Amber 500
  danger: '#ef4444', // Red 500
  info: '#3b82f6', // Blue 500
  fat: '#f97316', // Orange 500
  lean: '#0ea5e9', // Sky 500
  bmi: {
    underweight: '#3b82f6',
    normal: '#10b981',
    overweight: '#f59e0b',
    obese1: '#f97316',
    obese2: '#ef4444',
    obese3: '#7f1d1d',
  }
};

export const tooltipContentStyle = {
  backgroundColor: 'var(--tooltip-bg, #fff)',
  border: '1px solid var(--tooltip-border, #e2e8f0)',
  borderRadius: '8px',
  fontSize: '12px',
};

export const tooltipItemStyle = {
  color: 'var(--tooltip-text, #1e293b)',
};
