// VisaPath AI — Design Tokens (Technical PRD §21)
// Premium dark theme: ink-navy + Trust-Blue accent

export const tokens = {
  colors: {
    // Brand accent
    trustBlue: "#3B82F6",
    indigoDeep: "#6366F1",

    // Score semantics (visa bands)
    scoreStrong: "#22C55E",    // ≥ 80
    scoreModerate: "#F59E0B",  // 60–79
    scoreWeak: "#EF4444",      // < 60
    info: "#539DF5",

    // Backgrounds (ink-navy)
    bgBase: "#0B0F1A",
    bgSurface: "#121826",
    bgMid: "#1A2234",
    bgElevated: "#202A40",

    // Text
    textPrimary: "#FFFFFF",
    textSecondary: "#9AA7BD",
    textBright: "#CBD5E1",

    // Border & shadow
    border: "#2A3548",
    borderLight: "#3A4660",
    separator: "#9AA7BD",
  },

  shadows: {
    dialog: "rgba(0,0,0,0.55) 0 8px 24px",
    card: "rgba(0,0,0,0.35) 0 8px 8px",
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
    base: 8,  // 8px base unit
  },
} as const;
