import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useThemeColors } from "../../../shared/theme/colors";
import { spacing } from "../../../shared/theme/spacing";

interface OrderSummaryProps {
  subtotal: number;
  total: number;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({ subtotal, total }) => {
  const colors = useThemeColors();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <Text style={[styles.title, { color: colors.text }]}>ملخص الطلب</Text>

      <View style={styles.row}>
        <Text style={[styles.label, { color: colors.textLight }]}>
          المجموع الفرعي
        </Text>
        <Text style={[styles.value, { color: colors.text }]}>
          {subtotal.toLocaleString()} ل.س
        </Text>
      </View>

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      <View style={styles.row}>
        <Text style={[styles.totalLabel, { color: colors.text }]}>الإجمالي</Text>
        <Text style={[styles.totalValue, { color: colors.primary }]}>
          {total.toLocaleString()} ل.س
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.m,
    borderRadius: spacing.m,
    borderWidth: 1,
    marginBottom: spacing.m,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: spacing.m,
    textAlign: "right",
  },
  row: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    marginBottom: spacing.s,
  },
  label: {
    fontSize: 16,
  },
  value: {
    fontSize: 16,
    fontWeight: "500",
  },
  divider: {
    height: 1,
    marginVertical: spacing.s,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "bold",
  },
  totalValue: {
    fontSize: 20,
    fontWeight: "bold",
  },
});
