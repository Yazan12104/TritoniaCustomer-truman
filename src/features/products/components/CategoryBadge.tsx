import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { useThemeColors } from "../../../shared/theme/colors";
import { spacing } from "../../../shared/theme/spacing";

interface CategoryBadgeProps {
  label: string;
  isActive: boolean;
  onPress: () => void;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({
  label,
  isActive,
  onPress,
}) => {
  const colors = useThemeColors();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: isActive ? colors.primary : colors.surface,
          borderColor: isActive ? colors.primary : colors.border,
        },
        isActive && styles.activeContainer,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text
        style={[
          styles.text,
          {
            color: isActive ? "#ffffff" : colors.textLight,
          },
          isActive && styles.activeText,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.s,
    borderRadius: spacing.l,
    borderWidth: 1,
    marginRight: spacing.s,
    alignItems: "center",
    justifyContent: "center",
  },
  activeContainer: {
    // Other active container styles
  },
  text: {
    fontSize: 16,
    fontWeight: "500",
  },
  activeText: {
    fontWeight: "700",
  },
});
