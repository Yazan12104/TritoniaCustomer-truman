import React from "react";
import { Text, TextProps, StyleSheet } from "react-native";
import { useThemeColors } from "../theme/colors";

type TypographyVariant = "h1" | "h2" | "h3" | "subtitle" | "body" | "caption";

interface TypographyProps extends TextProps {
  variant?: TypographyVariant;
  color?: string;
  align?: "auto" | "left" | "right" | "center" | "justify";
  weight?: "normal" | "bold" | "500" | "600" | "700";
  children: React.ReactNode;
}

export const Typography: React.FC<TypographyProps> = ({
  variant = "body",
  color: propColor,
  align = "auto",
  weight,
  style,
  children,
  ...props
}) => {
  const colors = useThemeColors();

  // Determine default color based on theme and variant if no color prop is provided
  const defaultColor = variant === "caption" ? colors.textLight : colors.text;
  const textColor = propColor || defaultColor;

  return (
    <Text
      style={[
        styles[variant],
        { color: textColor, textAlign: align },
        weight && { fontWeight: weight },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  h1: {
    fontSize: 32,
    fontWeight: "bold",
    writingDirection: "rtl",
  },
  h2: {
    fontSize: 24,
    fontWeight: "bold",
    writingDirection: "rtl",
  },
  h3: {
    fontSize: 20,
    fontWeight: "bold",
    writingDirection: "rtl",
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "600",
    writingDirection: "rtl",
  },
  body: {
    fontSize: 16,
    writingDirection: "rtl",
  },
  caption: {
    fontSize: 14,
    writingDirection: "rtl",
  },
});
