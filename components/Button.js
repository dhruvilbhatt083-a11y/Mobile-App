import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS, SIZES, FONTS, BUTTON_SIZES } from '../constants/theme';

const Button = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  ...props
}) => {
  const getButtonStyle = () => {
    const baseStyle = BUTTON_SIZES[size];
    const variantStyle = {
      primary: {
        backgroundColor: disabled ? COLORS.border : COLORS.primary,
      },
      secondary: {
        backgroundColor: disabled ? COLORS.border : COLORS.secondary,
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: disabled ? COLORS.border : COLORS.primary,
      },
      ghost: {
        backgroundColor: 'transparent',
      },
    };
    return [baseStyle, variantStyle[variant], styles.button, style];
  };

  const getTextStyle = () => {
    const variantStyle = {
      primary: { color: COLORS.background },
      secondary: { color: COLORS.background },
      outline: { color: disabled ? COLORS.textSecondary : COLORS.primary },
      ghost: { color: disabled ? COLORS.textSecondary : COLORS.primary },
    };
    return [FONTS.body1, variantStyle[variant], styles.text];
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={COLORS.background} size="small" />
      ) : (
        <Text style={getTextStyle()}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    textAlign: 'center',
    fontWeight: '600',
  },
});

export default Button;
