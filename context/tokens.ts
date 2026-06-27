// VisaPath AI — Design Tokens (Light Theme)
export const tokens = {
  colors: {
    // Brand accent
    trustBlue: "#2563EB",
    indigoDeep: "#4F46E5",

    // Score semantics (visa bands)
    scoreStrong: "#16A34A",    // ≥ 80
    scoreModerate: "#D97706",  // 60–79
    scoreWeak: "#DC2626",      // < 60
    info: "#2563EB",

    // Backgrounds (light)
    bgBase: "#F8FAFC",
    bgSurface: "#FFFFFF",
    bgMid: "#F1F5F9",
    bgElevated: "#FFFFFF",

    // Text
    textPrimary: "#0F172A",
    textSecondary: "#64748B",
    textBright: "#334155",

    // Border & shadow
    border: "#E2E8F0",
    borderLight: "#CBD5E1",
    separator: "#94A3B8",
  },

  shadows: {
    dialog: "rgba(0,0,0,0.1) 0 4px 12px",
    card: "rgba(0,0,0,0.05) 0 1px 3px",
  },

  radius: {
    sm: "4px",
    md: "8px",
    lg: "12px",
    xl: "16px",
    pill: "9999px",
    circle: "50%",
  },

  typography: {
    fontFamily: "'Inter', 'Noto Sans Devanagari', system-ui, sans-serif",
    display: { size: "28px", weight: "700" },
    sectionTitle: { size: "24px", weight: "700" },
    body: { size: "16px", weight: "400" },
    bodyBold: { size: "16px", weight: "700" },
    button: { size: "14px", weight: "600", tracking: "0.6px" },
    caption: { size: "12px", weight: "400" },
  },

  spacing: {
    base: 8,
  },
} as const;
