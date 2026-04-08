import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Alert,
  ScrollView,
  TextInput,
} from "react-native";
import { ScreenContainer } from "../../../shared/components/ScreenContainer";
import { Typography } from "../../../shared/components/Typography";
import { useThemeColors } from "../../../shared/theme/colors";
import { spacing } from "../../../shared/theme/spacing";
import { useCartStore } from "../store/cartStore";
import { OrderSummary } from "../components/OrderSummary";
import { useOrderStore } from "../store/orderStore";
import { useAuthStore } from "../../auth/store/authStore";
import { useBranchesStore, Branch } from "../../branches/store/branchesStore";

export const CheckoutScreen = ({ navigation }: any) => {
  const { cartItems, total, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const { branches, fetchBranches } = useBranchesStore();
  const {
    selectedBranchId,
    setBranchId,
    createOrder,
    isLoading,
    error,
    resetError,
  } = useOrderStore();
  const colors = useThemeColors();

  const [notes, setNotes] = useState("");

  useEffect(() => {
    fetchBranches();
  }, []);

  const handlePlaceOrder = async () => {
    if (!user?.id) {
      Alert.alert("تنبيه", "يرجى تسجيل الدخول أولاً.");
      return;
    }
    if (!selectedBranchId) {
      Alert.alert("تنبيه", "يرجى اختيار الفرع أولاً.");
      return;
    }

    // For customers, use their own ID as customer_id
    const orderId = await createOrder({
      customer_id: user.id,
      branch_id: selectedBranchId,
      sold_price: total,
      notes: notes,
      items: cartItems.map((item) => ({
        product_id: item.productId,
        quantity: item.quantity,
      })),
    });

    if (orderId) {
      clearCart();
      Alert.alert("نجاح", "تم إرسال طلبك بنجاح!", [
        { text: "حسناً", onPress: () => navigation.navigate("OrdersTab") },
      ]);
    }
  };

  useEffect(() => {
    if (error) {
      Alert.alert("خطأ", error);
      resetError();
    }
  }, [error]);

  return (
    <ScreenContainer scrollable={true}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={[styles.backButtonText, { color: colors.primary }]}>
          ← العودة للسلة
        </Text>
      </TouchableOpacity>

      <Typography variant="h2" color={colors.primary} style={styles.title}>
        إتمام الطلب
      </Typography>

      <View
        style={[
          styles.section,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <Typography variant="h3" color={colors.primary} style={styles.sectionTitle}>
          1. اختيار الفرع
        </Typography>
        <ScrollView style={styles.listContainer} nestedScrollEnabled={true}>
          {branches
            .filter((b: Branch) => b.is_active !== false)
            .map((branch: Branch) => (
              <TouchableOpacity
                key={branch.id}
                style={[
                  styles.listItem,
                  { borderBottomColor: colors.border },
                  selectedBranchId === branch.id && [
                    styles.listItemSelected,
                    { backgroundColor: colors.primary + "15" },
                  ],
                ]}
                onPress={() => setBranchId(branch.id)}
              >
                <Text
                  style={[
                    styles.itemName,
                    { color: colors.text },
                    selectedBranchId === branch.id && [
                      styles.itemNameSelected,
                      { color: colors.primary },
                    ],
                  ]}
                >
                  {branch.name}
                </Text>
                <Text
                  style={[styles.itemSubtitle, { color: colors.textLight }]}
                >
                  {branch.governorate || ""}
                </Text>
              </TouchableOpacity>
            ))}
        </ScrollView>
      </View>

      <View
        style={[
          styles.section,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <Typography variant="h3" color={colors.primary} style={styles.sectionTitle}>
          2. ملاحظات على الطلب
        </Typography>
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>ملاحظات:</Text>
          <TextInput
            style={[
              styles.input,
              styles.textArea,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            multiline
            numberOfLines={3}
            value={notes}
            onChangeText={setNotes}
            placeholder="أضف أي ملاحظات هنا..."
            placeholderTextColor={colors.textLight}
            textAlign="right"
          />
        </View>
      </View>

      <View style={styles.summaryContainer}>
        <OrderSummary subtotal={total} total={total} />
      </View>

      <TouchableOpacity
        style={[
          styles.submitButton,
          { backgroundColor: colors.primary },
          (isLoading || cartItems.length === 0) && styles.submitButtonDisabled,
        ]}
        onPress={handlePlaceOrder}
        disabled={isLoading || cartItems.length === 0}
      >
        {isLoading ? (
          <ActivityIndicator color={colors.background} />
        ) : (
          <Text style={[styles.submitButtonText, { color: colors.background }]}>
            تأكيد وإرسال الطلب
          </Text>
        )}
      </TouchableOpacity>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  backButton: {
    paddingVertical: spacing.s,
    marginBottom: spacing.m,
  },
  backButtonText: {
    fontWeight: "600",
    fontSize: 16,
  },
  title: {
    marginBottom: spacing.l,
    textAlign: "right",
  },
  section: {
    marginBottom: spacing.l,
    padding: spacing.m,
    borderRadius: spacing.m,
    borderWidth: 1,
  },
  sectionTitle: {
    marginBottom: spacing.s,
    textAlign: "right",
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: spacing.s,
    padding: spacing.s,
    marginBottom: spacing.s,
  },
  listContainer: {
    maxHeight: 150,
  },
  listItem: {
    padding: spacing.s,
    borderBottomWidth: 1,
  },
  listItemSelected: {},
  itemName: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "right",
  },
  itemNameSelected: {},
  itemSubtitle: {
    fontSize: 12,
    textAlign: "right",
  },
  inputGroup: {
    marginBottom: spacing.m,
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
    textAlign: "right",
  },
  input: {
    borderWidth: 1,
    borderRadius: spacing.s,
    padding: spacing.s,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  hint: {
    fontSize: 12,
    marginTop: 4,
    textAlign: "right",
  },
  summaryContainer: {
    marginBottom: spacing.l,
  },
  submitButton: {
    padding: spacing.m,
    borderRadius: spacing.m,
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: "bold",
  },
});
