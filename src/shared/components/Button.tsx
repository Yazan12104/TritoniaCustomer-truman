import React, { useRef } from "react";
import {
  TouchableOpacity,
  TouchableOpacityProps,
  StyleSheet,
  ActivityIndicator,
  View,
  Animated,
} from "react-native";
import { Typography } from "./Typography";
import { useThemeColors } from "../theme/colors";
import { radii, spacing } from "../theme/spacing";

type ButtonVariant = "primary" | "secondary" | "outline" | "text";

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: ButtonVariant;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = "primary",
  loading = false,
  disabled,
  style,
  ...props
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const colors = useThemeColors();

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 20,
      bounciness: 10,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 10,
    }).start();
  };

  const getBackgroundColor = () => {
    if (disabled) return colors.border;
    switch (variant) {
      case "primary":
        return colors.primary;
      case "secondary":
        return colors.secondary;
      case "outline":
        return "transparent";
      case "text":
        return "transparent";
      default:
        return colors.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return colors.textLight;
    switch (variant) {
      case "outline":
        return colors.primary;
      case "text":
        return colors.primary;
      default:
        return "#ffffff"; // Static white for primary/secondary buttons usually looks better
    }
  };

  const getBorderColor = () => {
    if (disabled && variant === "outline") return colors.border;
    if (variant === "outline") return colors.primary;
    return "transparent";
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        disabled={disabled || loading}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.container,
          {
            backgroundColor: getBackgroundColor(),
            borderColor: getBorderColor(),
            borderWidth: variant === "outline" ? 1 : 0,
            shadowColor: variant === "primary" ? colors.primary : "transparent",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: variant === "primary" ? 0.2 : 0,
            shadowRadius: 8,
            elevation: variant === "primary" ? 4 : 0,
          },
          style,
        ]}
        activeOpacity={0.9}
        {...props}
      >
        {loading ? (
          <ActivityIndicator color={getTextColor()} />
        ) : (
          <Typography
            variant="subtitle"
            color={getTextColor()}
            align="center"
            weight="600"
          >
            {title}
          </Typography>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.l,
    borderRadius: radii.m,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 48, // Minimum touch target size
  },
});
