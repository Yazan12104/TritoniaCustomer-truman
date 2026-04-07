import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { CartItem } from "../types";
import { useThemeColors } from "../../../shared/theme/colors";
import { spacing } from "../../../shared/theme/spacing";
import { QuantitySelector } from "./QuantitySelector";
import { useCartStore } from "../store/cartStore";

interface CartItemCardProps {
  item: CartItem;
}

export const CartItemCard: React.FC<CartItemCardProps> = ({ item }) => {
  const { updateQuantity } = useCartStore();
  const colors = useThemeColors();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border + "50",
          shadowColor: colors.text,
        },
      ]}
    >
      <Image
        source={{ uri: item.imageUrl || "https://via.placeholder.com/150" }}
        style={[styles.image, { backgroundColor: colors.border }]}
        resizeMode="cover"
      />
      <View style={styles.details}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={[styles.price, { color: colors.primary }]}>
          {item.price} ل.س
        </Text>

        <View style={styles.actions}>
          <QuantitySelector
            quantity={item.quantity}
            onIncrease={() => updateQuantity(item.productId, item.quantity + 1)}
            onDecrease={() => updateQuantity(item.productId, item.quantity - 1)}
          />
          <Text style={[styles.itemTotal, { color: colors.text }]}>
            {item.price * item.quantity} ل.س
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row-reverse",
    borderRadius: spacing.m,
    padding: spacing.m,
    marginBottom: spacing.m,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    alignItems: "center",
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: spacing.s,
    marginLeft: spacing.m,
  },
  details: {
    flex: 1,
    justifyContent: "space-between",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: spacing.xs,
    textAlign: "right",
  },
  price: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: spacing.s,
    textAlign: "right",
  },
  actions: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: "bold",
  },
});
