export const colors = {
  primary: '#FF6B35',
  primaryDark: '#AB3500',
  secondary: '#004E89',
  secondaryLight: '#24619D',
  background: '#FFF8F6',
  surface: '#FFFFFF',
  surfaceVariant: '#FFE9E3',
  onSurface: '#261814',
  onSurfaceVariant: '#594139',
  outline: '#8D7168',
  outlineVariant: '#E1BFB5',
  success: '#00677E',
  successLight: '#00A7CB',
  error: '#BA1A1A',
  pending: '#FF6B35',
  paid: '#00677E',
  draft: '#8D7168',
};

const manropeTypography = {
  h1: { fontFamily: 'Manrope_700Bold', fontSize: 32, lineHeight: 38 },
  h2: { fontFamily: 'Manrope_600SemiBold', fontSize: 24, lineHeight: 31 },
  h3: { fontFamily: 'Manrope_600SemiBold', fontSize: 20, lineHeight: 28 },
  body: { fontFamily: 'Manrope_400Regular', fontSize: 14, lineHeight: 21 },
  bodyMedium: { fontFamily: 'Manrope_500Medium', fontSize: 14, lineHeight: 21 },
  small: { fontFamily: 'Manrope_400Regular', fontSize: 12, lineHeight: 17 },
  label: { fontFamily: 'Manrope_500Medium', fontSize: 13, lineHeight: 16 },
  button: { fontFamily: 'Manrope_600SemiBold', fontSize: 14, lineHeight: 14 },
};

const interTypography = {
  h1: { fontFamily: 'Inter_700Bold', fontSize: 32, lineHeight: 38 },
  h2: { fontFamily: 'Inter_600SemiBold', fontSize: 24, lineHeight: 31 },
  h3: { fontFamily: 'Inter_600SemiBold', fontSize: 20, lineHeight: 28 },
  body: { fontFamily: 'Inter_400Regular', fontSize: 14, lineHeight: 21 },
  bodyMedium: { fontFamily: 'Inter_500Medium', fontSize: 14, lineHeight: 21 },
  small: { fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 17 },
  label: { fontFamily: 'Inter_500Medium', fontSize: 13, lineHeight: 16 },
  button: { fontFamily: 'Inter_600SemiBold', fontSize: 14, lineHeight: 14 },
};

export const getTypography = (useInterFallback = false) =>
  useInterFallback ? interTypography : manropeTypography;

export const typography = manropeTypography;

export const spacing = {
  xs: 4, sm: 8, md: 16, lg: 24, xl: 32,
  containerMargin: 16,
  navHeight: 60,
};

export const radius = {
  sm: 4, md: 8, lg: 12, xl: 16, full: 9999,
};

export const shadows = {
  card: {
    shadowColor: '#261814',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
};
