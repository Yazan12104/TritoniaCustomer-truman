import React, { forwardRef } from "react";
import { View, TextInput, TextInputProps, StyleSheet } from "react-native";
import { Typography } from "./Typography";
import { useThemeColors } from "../theme/colors";
import { radii, spacing } from "../theme/spacing";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export const Input = forwardRef<TextInput, InputProps>(
  ({ label, error, style, onFocus, onBlur, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const colors = useThemeColors();

    const handleFocus = (e: any) => {
      setIsFocused(true);
      if (onFocus) onFocus(e);
    };

    const handleBlur = (e: any) => {
      setIsFocused(false);
      if (onBlur) onBlur(e);
    };

    const dynamicStyles = {
      label: { color: colors.text },
      input: {
        backgroundColor: colors.surface,
        borderColor: colors.border,
        color: colors.text,
      },
      inputFocused: {
        borderColor: colors.primary,
        backgroundColor: colors.surface,
        shadowColor: colors.primary,
      },
      inputError: {
        borderColor: colors.error,
        backgroundColor: colors.error + "05",
      },
    };

    return (
      <View style={styles.container}>
        {label && (
          <Typography
            variant="body"
            weight="600"
            style={[styles.label, dynamicStyles.label]}
          >
            {label}
          </Typography>
        )}
        <TextInput
          ref={ref}
          style={[
            styles.input,
            dynamicStyles.input,
            isFocused ? [styles.inputFocused, dynamicStyles.inputFocused] : null,
            error ? [styles.inputError, dynamicStyles.inputError] : null,
            style,
          ]}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholderTextColor={colors.textLight}
          textAlign="right"
          {...props}
        />
        {error && (
          <Typography
            variant="caption"
            color={colors.error}
            style={styles.error}
          >
            {error}
          </Typography>
        )}
      </View>
    );
  }
);

Input.displayName = "Input";

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.m,
  },
  label: {
    marginBottom: spacing.s,
  },
  input: {
    borderWidth: 1,
    borderRadius: radii.m,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.m,
    fontSize: 16,
    minHeight: 48,
  },
  inputFocused: {
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputError: {
    // Other error styles
  },
  error: {
    marginTop: spacing.xs,
  },
});
