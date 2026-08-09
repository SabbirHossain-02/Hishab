export const tokens = {
  colors: {
    // Primary Gradient: Vibrant Royal Blue to Deep Purple (Fintech look)
    gradient: {
      primary: ['#4A00E0', '#8E2DE2'], 
      secondary: ['#FF9100', '#FFAB40'], // Warm orange accents
    },
    // The Light Theme neutral base for surfaces and text
    tealNeutral: {
      900: '#FFFFFF', // App background (Light mode)
      800: '#FFFFFF', // Surface / Card
      700: '#F8F9FA', // Elevated Surface
      100: '#E9ECEF', // Subtle borders/dividers
      50: '#F4F6F8',  // Very subtle background
      textLight: '#FFFFFF', // For text on dark gradients
      textDark: '#1A1D20', // Main dark text
      textMutedLight: '#6C757D', // Muted text on light bg
      textMutedDark: '#ADB5BD',
    },
    // Semantic colors
    semantic: {
      success: '#00C853',
      warning: '#FF9100',
      error: '#FF1744',
    }
  },
  typography: {
    fontFamily: {
      sans: 'System', 
      display: 'System', 
    },
    size: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 20,
      xl: 24,
      display: 36, // Slightly reduced for cleaner look
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
    xl: 32,
    pill: 9999,
  },
  shadows: {
    // Soft diffused shadows for the light theme reference
    sm: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.04,
      shadowRadius: 8,
      elevation: 2,
    },
    md: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.08,
      shadowRadius: 16,
      elevation: 4,
    },
    lg: {
      shadowColor: '#4A00E0', // Colored shadow for primary elements
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.25,
      shadowRadius: 24,
      elevation: 8,
    },
  }
};
