import React from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Text,
  TouchableOpacity,
  Alert,
} from "react-native";
import { ScreenContainer } from "../../../shared/components/ScreenContainer";
import { Typography } from "../../../shared/components/Typography";
import { useThemeColors } from "../../../shared/theme/colors";
import { spacing } from "../../../shared/theme/spacing";
import { useCartStore } from "../store/cartStore";
import { CartItemCard } from "../components/CartItemCard";
import { OrderSummary } from "../components/OrderSummary";

export const CartScreen = ({ navigation }: any) => {
  const { cartItems, subtotal, total, clearCart } = useCartStore();
  const colors = useThemeColors();

  const handleEmptyCart = () => {
    Alert.alert(
      "تفريغ السلة",
      "هل أنت متأكد من أنك تريد إزالة جميع المنتجات من السلة؟",
      [
        {
          text: "إلغاء",
          style: "cancel",
        },
        {
          text: "تفريغ",
          style: "destructive",
          onPress: () => clearCart(),
        },
      ]
    );
  };

  if (cartItems.length === 0) {
    return (
      <ScreenContainer style={styles.emptyContainer}>
        <Typography
          variant="h2"
          color={colors.textLight}
          style={styles.emptyText}
        >
          سلة المشتريات فارغة.
        </Typography>
        <TouchableOpacity
          style={[styles.browseButton, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate("ProductsTab", { screen: "ProductsListScreen" })}
        >
          <Text style={[styles.browseButtonText, { color: colors.background }]}>
            تصفح المنتجات
          </Text>
        </TouchableOpacity>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      scrollable={false}
      contentContainerStyle={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleEmptyCart}
          style={styles.emptyCartButton}
          activeOpacity={0.7}
        >
          <Text style={[styles.emptyCartText, { color: colors.error }]}>
            تفريغ السلة
          </Text>
        </TouchableOpacity>

        <Typography variant="h2" color={colors.primary}>
          سلة المشتريات
        </Typography>
      </View>

      <FlatList
        data={cartItems}
        keyExtractor={(item) => item.productId}
        renderItem={({ item }) => <CartItemCard item={item} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ListFooterComponent={
          <View style={styles.footer}>
            <OrderSummary subtotal={subtotal} total={total} />
            <TouchableOpacity
              style={[styles.checkoutButton, { backgroundColor: colors.primary }]}
              onPress={() => navigation.navigate("CheckoutScreen")}
              activeOpacity={0.8}
            >
              <Text style={[styles.checkoutButtonText, { color: colors.background }]}>
                متابعة عملية الدفع
              </Text>
            </TouchableOpacity>
          </View>
        }
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 0,
  },
  emptyContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    marginBottom: spacing.l,
    textAlign: "center",
  },
  browseButton: {
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
    borderRadius: spacing.m,
  },
  browseButtonText: {
    fontWeight: "bold",
    fontSize: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.l,
    marginBottom: spacing.m,
  },
  emptyCartButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.s,
  },
  emptyCartText: {
    fontWeight: "bold",
    fontSize: 14,
  },
  list: {
    paddingHorizontal: spacing.l,
    paddingBottom: spacing.xxl,
  },
  footer: {
    marginTop: spacing.m,
  },
  checkoutButton: {
    padding: spacing.m,
    borderRadius: spacing.m,
    alignItems: "center",
    marginTop: spacing.s,
  },
  checkoutButtonText: {
    fontSize: 18,
    fontWeight: "bold",
  },
});
