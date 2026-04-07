// CustomerCard.tsx
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Customer } from "../types";
import { useThemeColors } from "../../../shared/theme/colors";
import { spacing } from "../../../shared/theme/spacing";

interface CustomerCardProps {
  customer: Customer;
  onPress: () => void;
}

export const CustomerCard: React.FC<CustomerCardProps> = ({
  customer,
  onPress,
}) => {
  const colors = useThemeColors();
  const displayName = customer.full_name || customer.name || "";
  const initials = displayName.substring(0, 2).toUpperCase();
  const phone = customer.phone || "رقم غير متوفر";
  const location = customer.governorate || "لا يوجد موقع";

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border + "50",
          shadowColor: colors.text,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={[styles.avatarText, { color: colors.background }]}>
            {initials}
          </Text>
        </View>
        <View style={styles.info}>
          <Text
            style={[styles.name, { color: colors.text }]}
            numberOfLines={1}
          >
            {displayName}
          </Text>
          <Text style={[styles.phone, { color: colors.textLight }]}>
            {phone}
          </Text>
        </View>
      </View>

      {customer.referred_by_name && (
        <View
          style={[
            styles.referrerBadge,
            { backgroundColor: colors.primary + "10" },
          ]}
        >
          <Text style={[styles.referrerText, { color: colors.primary }]}>
            📌 تمت الإضافة بواسطة: {customer.referred_by_name}
            {customer.referred_by_role && ` (${customer.referred_by_role})`}
          </Text>
        </View>
      )}

      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <Text
          style={[styles.location, { color: colors.textLight }]}
          numberOfLines={1}
        >
          📍 {location}
        </Text>
        {customer.is_active === false && (
          <Text
            style={[
              styles.inactiveBadge,
              { color: colors.error, backgroundColor: colors.error + "10" },
            ]}
          >
            غير نشط
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: spacing.m,
    padding: spacing.m,
    marginBottom: spacing.m,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.s,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.m,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  phone: {
    fontSize: 14,
  },
  referrerBadge: {
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xs,
    borderRadius: spacing.xs,
    marginBottom: spacing.xs,
  },
  referrerText: {
    fontSize: 11,
  },
  footer: {
    borderTopWidth: 1,
    paddingTop: spacing.xs,
    marginTop: spacing.xs,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  location: {
    fontSize: 12,
    flex: 1,
  },
  inactiveBadge: {
    fontSize: 11,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: spacing.xs,
  },
});
