import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useThemeColors } from "../../../shared/theme/colors";
import { spacing } from "../../../shared/theme/spacing";

interface OrderSummaryProps {
  subtotal: number;
  total: number;
  deliveryFee?: number;
  discountPercentage?: number;
  discountAmount?: number;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({
  subtotal,
  total,
  deliveryFee,
  discountPercentage,
  discountAmount,
}) => {
  const colors = useThemeColors();
  const hasDiscount = discountPercentage && discountPercentage > 0 && discountAmount && discountAmount > 0;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <Text style={[styles.title, { color: colors.text }]}>ملخص الطلب</Text>

      <View style={styles.row}>

        <Text style={[
          styles.value,
          { color: colors.text },
          hasDiscount && styles.strikethrough,
        ]}>
          {subtotal.toLocaleString()} ل.س
          
        </Text>
                <Text style={[styles.label, { color: colors.textLight }]}>
          المجموع الفرعي
        </Text>
      </View>

      {hasDiscount ? (
        <>
          <View style={[styles.discountRow, { backgroundColor: colors.primary + "08" }]}>
            <Text style={[styles.label, { color: colors.primary }]}>
              خصم {discountPercentage}%
            </Text>
            <Text style={[styles.value, { color: colors.primary, fontWeight: "bold" }]}>
              - {discountAmount.toLocaleString()} ل.س
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={[styles.label, { color: colors.text }]}>
              المجموع بعد الخصم
            </Text>
            <Text style={[styles.value, { color: colors.primary, fontWeight: "bold" }]}>
              {(subtotal - discountAmount).toLocaleString()} ل.س
            </Text>
          </View>
        </>
      ) : null}

      {deliveryFee !== undefined && deliveryFee > 0 && (
        <View style={styles.row}>
          <Text style={[styles.label, { color: colors.textLight }]}>
            رسوم التوصيل
          </Text>
          <Text style={[styles.value, { color: colors.primary }]}>
            {deliveryFee.toLocaleString()} ل.س
          </Text>
        </View>
      )}

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      <View style={styles.row}>
        <Text style={[styles.totalValue, { color: colors.primary }]}>
          {total.toLocaleString()} ل.س
        </Text>
                <Text style={[styles.totalLabel, { color: colors.text }]}>الإجمالي{deliveryFee ? " (مع التوصيل)" : ""}</Text>

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
    textAlign: "left",
  },
  row: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    marginBottom: spacing.s,
  },
  discountRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    marginBottom: spacing.s,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.s,
    borderRadius: spacing.xs,
  },
  label: {
    fontSize: 16,
  },
  value: {
    fontSize: 16,
    fontWeight: "500",
  },
  strikethrough: {
    textDecorationLine: "line-through",
    opacity: 0.6,
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
