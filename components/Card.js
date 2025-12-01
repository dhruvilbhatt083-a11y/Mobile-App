import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS, SIZES } from '../constants/theme';

const Card = ({
  children,
  style,
  shadow = true,
  padding = true,
  margin = false,
  ...props
}) => {
  const cardStyle = [
    styles.card,
    shadow && styles.shadow,
    padding && { padding: SIZES.padding },
    margin && { margin: SIZES.base },
    style,
  ];

  return (
    <View style={cardStyle} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  shadow: {
    shadowColor: COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});

export default Card;
