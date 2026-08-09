export const tokens = {
  colors: {
    // Primary Gradient (Blue-to-Green) for key emphasis (headers, main CTAs, charts)
    gradient: {
      primary: ['#0072ff', '#00c853'], // Vibrant blue to classic green gradient
    },
    // The deep teal neutral base for surfaces and text
    tealNeutral: {
      900: '#061517', // App background (Dark mode)
      800: '#0a2326', // Surface / Card (Dark mode)
      700: '#10363a', // Elevated Surface (Dark mode)
      100: '#e5f3f4', // Surface / Card (Light mode)
      50: '#f4f9f9',  // App background (Light mode)
      textLight: '#f4f9f9',
      textDark: '#061517',
      textMutedLight: '#8da6a8',
      textMutedDark: '#5c787a',
    },
    // Semantic colors
    semantic: {
      success: '#00BFA5',
      warning: '#FF9100',
      error: '#FF1744',
    }
  },
  typography: {
    fontFamily: {
      sans: 'System', // Will replace with custom fonts (Inter/Hind) later
      display: 'System', 
    },
    size: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 20,
      xl: 24,
      display: 40, // For massive balances
    },
    weight: {
      regular: '400',
      medium: '500',
      bold: '700',
    }
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32, // Heavy rounding on major container cards
    pill: 9999,
  },
  shadows: {
    // Deliberate visual hierarchy (flat, elevated, full-bleed, inset)
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 8,
    },
  }
};
