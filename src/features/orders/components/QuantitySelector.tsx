import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useThemeColors } from "../../../shared/theme/colors";
import { spacing } from "../../../shared/theme/spacing";

interface QuantitySelectorProps {
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
}

export const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  quantity,
  onIncrease,
  onDecrease,
}) => {
  const colors = useThemeColors();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <TouchableOpacity
        style={styles.button}
        onPress={onIncrease}
        activeOpacity={0.7}
      >
        <Text style={[styles.buttonText, { color: colors.primary }]}>+</Text>
      </TouchableOpacity>

      <View style={[styles.valueContainer, { borderColor: colors.border }]}>
        <Text style={[styles.valueText, { color: colors.text }]}>
          {quantity}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={onDecrease}
        activeOpacity={0.7}
      >
        <Text style={[styles.buttonText, { color: colors.primary }]}>-</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: spacing.s,
  },
  button: {
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.xs,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  valueContainer: {
    paddingHorizontal: spacing.s,
    minWidth: 40,
    alignItems: "center",
    borderLeftWidth: 1,
    borderRightWidth: 1,
  },
  valueText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
