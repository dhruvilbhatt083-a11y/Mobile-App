// App Theme Configuration
export const COLORS = {
  primary: '#2C3E50',
  secondary: '#3498DB',
  accent: '#E74C3C',
  success: '#27AE60',
  warning: '#F39C12',
  background: '#FFFFFF',
  backgroundSecondary: '#F8F9FA',
  text: '#2C3E50',
  textSecondary: '#7F8C8D',
  border: '#E0E0E0',
  shadow: '#00000010',
};

export const SIZES = {
  base: 8,
  font: 14,
  padding: 16,
  radius: 8,
  h1: 32,
  h2: 24,
  h3: 18,
  h4: 16,
  body1: 16,
  body2: 14,
  body3: 12,
};

export const FONTS = {
  h1: {
    fontSize: SIZES.h1,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  h2: {
    fontSize: SIZES.h2,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  h3: {
    fontSize: SIZES.h3,
    fontWeight: '600',
    color: COLORS.text,
  },
  h4: {
    fontSize: SIZES.h4,
    fontWeight: '600',
    color: COLORS.text,
  },
  body1: {
    fontSize: SIZES.body1,
    color: COLORS.text,
  },
  body2: {
    fontSize: SIZES.body2,
    color: COLORS.text,
  },
  body3: {
    fontSize: SIZES.body3,
    color: COLORS.textSecondary,
  },
};

export const BUTTON_SIZES = {
  small: {
    paddingVertical: SIZES.base,
    paddingHorizontal: SIZES.padding,
    borderRadius: SIZES.radius,
  },
  medium: {
    paddingVertical: SIZES.base * 1.5,
    paddingHorizontal: SIZES.padding * 1.5,
    borderRadius: SIZES.radius,
  },
  large: {
    paddingVertical: SIZES.base * 2,
    paddingHorizontal: SIZES.padding * 2,
    borderRadius: SIZES.radius,
  },
};
