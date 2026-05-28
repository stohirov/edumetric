export const CHART_COLORS = {
  primary: "#4f46e5",
  primaryLight: "#818cf8",
  primaryMuted: "#c7d2fe",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  slate: "#94a3b8",
  grid: "#f1f5f9",
  indigoScale: ["#4f46e5", "#6366f1", "#818cf8", "#a5b4fc", "#c7d2fe", "#e0e7ff"],
} as const;

export const chartMargin = { top: 8, right: 12, left: -12, bottom: 0 };

export const axisTick = {
  fill: "#94a3b8",
  fontSize: 11,
  fontWeight: 500,
} as const;

export const axisTickBold = {
  ...axisTick,
  fill: "#64748b",
  fontWeight: 600,
} as const;

export const chartGridProps = {
  strokeDasharray: "4 4",
  stroke: CHART_COLORS.grid,
  vertical: false,
} as const;

export const chartTooltipStyle: Record<string, string | number> = {
  backgroundColor: "rgba(255, 255, 255, 0.98)",
  border: "1px solid rgba(226, 232, 240, 0.9)",
  borderRadius: "12px",
  boxShadow:
    "0 4px 6px -1px rgb(0 0 0 / 0.06), 0 12px 28px -6px rgb(79 70 229 / 0.12)",
  fontSize: "12px",
  padding: "10px 12px",
  backdropFilter: "blur(8px)",
};

export function chartGradientId(key: string) {
  return `chart-grad-${key.replace(/\s+/g, "-").toLowerCase()}`;
}
