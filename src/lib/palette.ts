// Shared design palette — v5 (dark mode, AgentStudio)
// Dark base with lime accent, inspired by n8n/Linear
export const P = {
  // Backgrounds (dark hierarchy)
  bg: "#0b0b0e",
  bg2: "#111115",
  bg3: "#18181d",
  bg4: "#202026",
  bg5: "#28282f",
  card: "#111115",

  // Sidebar
  sidebar: "#111115",
  sidebarActive: "rgba(197,241,53,0.10)",
  sidebarHover: "#18181d",

  // Primary brand — lime
  lime: "#c5f135",
  lime2: "#d4f75a",
  limeD: "#8aaa1f",

  // Accent colors
  violet: "#7c6fef",
  violet2: "#a99cf5",
  amber: "#f5a623",
  teal: "#2dd4bf",
  rose: "#f472b6",
  blue: "#60a5fa",
  orange: "#fb923c",
  green: "#4ade80",
  cyan: "#22d3ee",
  purple: "#c084fc",

  // Legacy aliases (keeps existing code working)
  indigo: "#7c6fef",
  indigoSoft: "rgba(124,111,239,0.08)",
  indigoMid: "rgba(124,111,239,0.15)",
  indigoLight: "rgba(124,111,239,0.06)",
  pink: "#f472b6",
  pinkSoft: "rgba(244,114,182,0.08)",
  pinkGrad: "linear-gradient(135deg, #f472b6, #f5576c)",
  cyanSoft: "rgba(45,212,191,0.08)",
  cyanGrad: "linear-gradient(135deg, #2dd4bf, #22d3ee)",
  orangeSoft: "rgba(251,146,60,0.08)",
  orangeGrad: "linear-gradient(135deg, #fb923c, #f5a623)",
  purpleSoft: "rgba(192,132,252,0.08)",
  purpleLight: "rgba(192,132,252,0.06)",
  purpleGrad: "linear-gradient(135deg, #7c6fef, #a99cf5)",
  purpleMid: "rgba(192,132,252,0.15)",

  // Status colors
  coral: "#f87171",
  coralSoft: "rgba(248,113,113,0.08)",
  coralGrad: "linear-gradient(135deg, #f87171, #fb923c)",
  emerald: "#4ade80",
  emeraldSoft: "rgba(74,222,128,0.08)",
  emeraldGrad: "linear-gradient(135deg, #4ade80, #2dd4bf)",
  amberSoft: "rgba(245,166,35,0.08)",
  gold: "#f5a623",
  goldSoft: "rgba(245,166,35,0.08)",

  // Text hierarchy
  text: "#eceae4",
  textSec: "#9d9aa6",
  textTer: "#64626c",
  textGhost: "#3a3842",

  // Borders
  border: "rgba(255,255,255,0.07)",
  border2: "rgba(255,255,255,0.14)",
  borderHover: "rgba(255,255,255,0.14)",

  // Shadows (dark mode)
  shadow: "0 2px 8px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2)",
  shadowHover: "0 12px 36px rgba(0,0,0,0.5), 0 4px 8px rgba(0,0,0,0.3)",
  shadowFloat: "0 24px 64px rgba(0,0,0,0.6), 0 8px 16px rgba(0,0,0,0.4)",

  // Card-specific
  cardRadius: "16px",
  cardRadiusLg: "20px",
  cardRadiusXl: "24px",
};

// Font family constants
export const F = "'Syne', system-ui, sans-serif";
export const FS = "'Epilogue', Georgia, serif";
export const FM = "'JetBrains Mono', 'Fira Code', monospace";
