import React from 'react';
import { TextInput, View, Text, StyleSheet } from 'react-native';
import { COLORS, SIZES, FONTS } from '../constants/theme';

const Input = ({
  label,
  error,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
  multiline = false,
  numberOfLines = 1,
  style,
  ...props
}) => {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          multiline && styles.multiline,
          error && styles.inputError,
          style,
        ]}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textSecondary}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={numberOfLines}
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SIZES.base * 1.5,
  },
  label: {
    ...FONTS.body3,
    marginBottom: SIZES.base / 2,
    color: COLORS.text,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius,
    padding: SIZES.base,
    fontSize: SIZES.body2,
    color: COLORS.text,
    backgroundColor: COLORS.background,
  },
  multiline: {
    height: 80,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: COLORS.accent,
  },
  errorText: {
    ...FONTS.body3,
    color: COLORS.accent,
    marginTop: SIZES.base / 2,
  },
});

export default Input;
