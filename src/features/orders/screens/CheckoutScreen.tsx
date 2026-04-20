import React, { useState, useEffect, useMemo } from "react";
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
import { useOrderStore } from "../store/orderStore";
import { useAuthStore } from "../../auth/store/authStore";
import { ordersApi } from "../api/ordersApi";
import { useBranchesStore, Branch } from "../../branches/store/branchesStore";
import { useDeliveryPointsStore } from "../../branches/store/deliveryPointsStore";
import { DeliveryPoint } from "../../branches/types";
import { apiClient } from "../../../core/api/apiClient";

export const CheckoutScreen = ({ navigation }: any) => {
  const { cartItems, total, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const { branches, fetchBranches } = useBranchesStore();
  const {
    selectedBranchId,
    setBranchId,
    selectedDeliveryPoint,
    setDeliveryPoint,
    createOrder,
    isLoading,
    error,
    resetError,
  } = useOrderStore();
  const { deliveryPoints, fetchDeliveryPointsForBranch } = useDeliveryPointsStore();
  const colors = useThemeColors();

  const [notes, setNotes] = useState("");

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponResult, setCouponResult] = useState<{
    available: boolean;
    discount_percentage?: number;
    code?: string;
    reason?: string;
  } | null>(null);
  const [couponError, setCouponError] = useState("");

  useEffect(() => {
    fetchBranches();
  }, []);

  useEffect(() => {
    if (selectedBranchId) {
      fetchDeliveryPointsForBranch(selectedBranchId);
      setDeliveryPoint(null);
    }
  }, [selectedBranchId]);

  // Reset coupon when code changes
  useEffect(() => {
    if (couponResult) {
      setCouponResult(null);
      setCouponError("");
    }
  }, [couponCode]);

  const deliveryFee = selectedDeliveryPoint ? parseFloat(selectedDeliveryPoint.fee) : 0;

  // Calculate discount
  const discountPercentage = couponResult?.available ? (couponResult.discount_percentage || 0) : 0;
  const discountAmount = discountPercentage > 0 ? Number((total * (discountPercentage / 100)).toFixed(2)) : 0;
  const subtotalAfterDiscount = Number(Math.max(0, total - discountAmount).toFixed(2));
  const totalWithDeliveryFee = subtotalAfterDiscount + deliveryFee;

  const handleCheckCoupon = async () => {
    const trimmed = couponCode.trim();
    if (!trimmed) {
      setCouponError("يرجى إدخال كود الخصم");
      return;
    }

    setCouponLoading(true);
    setCouponError("");
    setCouponResult(null);

    try {
      const data = await ordersApi.checkCoupon(trimmed);
      setCouponResult(data);

      if (!data.available) {
        if (data.reason === "already_used") {
          setCouponError("لقد استخدمت هذا الكوبون مسبقاً.");
        } else {
          setCouponError("كود الخصم غير صالح أو منتهي الصلاحية.");
        }
      }
    } catch (err: any) {
      setCouponError(err.message || "فشل التحقق من كود الخصم");
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode("");
    setCouponResult(null);
    setCouponError("");
  };

  const handlePlaceOrder = async () => {
    if (!user?.id) {
      Alert.alert("تنبيه", "يرجى تسجيل الدخول أولاً.");
      return;
    }
    if (!selectedBranchId) {
      Alert.alert("تنبيه", "يرجى اختيار الفرع أولاً.");
      return;
    }
    if (!selectedDeliveryPoint) {
      Alert.alert("تنبيه", "يرجى اختيار نقطة التسليم.");
      return;
    }

    const orderPayload: any = {
      customer_id: user.id,
      branch_id: selectedBranchId,
      sold_price: total + deliveryFee, // Send original total + delivery (backend applies discount)
      notes: notes,
      items: cartItems.map((item) => ({
        product_id: item.productId,
        quantity: item.quantity,
      })),
    };

    // Add coupon code if valid
    if (couponResult?.available && couponCode.trim()) {
      orderPayload.coupon_code = couponCode.trim();
    }

    const orderId = await createOrder(orderPayload);

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

      {/* 1. Branch Selection */}
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

      {/* 2. Delivery Point Selection */}
      {selectedBranchId && (
        <View
          style={[
            styles.section,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Typography variant="h3" color={colors.primary} style={styles.sectionTitle}>
            2. اختيار نقطة التسليم
          </Typography>
          <ScrollView style={styles.listContainer} nestedScrollEnabled={true}>
            {deliveryPoints.map((point: DeliveryPoint) => (
              <TouchableOpacity
                key={point.id}
                style={[
                  styles.listItem,
                  { borderBottomColor: colors.border },
                  selectedDeliveryPoint?.id === point.id && [
                    styles.listItemSelected,
                    { backgroundColor: colors.primary + "15" },
                  ],
                ]}
                onPress={() => setDeliveryPoint(point)}
              >
                <Text
                  style={[
                    styles.itemName,
                    { color: colors.text },
                    selectedDeliveryPoint?.id === point.id && [
                      styles.itemNameSelected,
                      { color: colors.primary },
                    ],
                  ]}
                >
                  {point.name}
                </Text>
                <Text
                  style={[styles.itemSubtitle, { color: colors.textLight }]}
                >
                  رسوم التوصيل: {parseFloat(point.fee).toLocaleString('ar-EG')} ل.س
                </Text>
              </TouchableOpacity>
            ))}
            {deliveryPoints.length === 0 && (
              <Text style={[styles.emptyMessage, { color: colors.textLight }]}>
                لا توجد نقاط تسليم متاحة لهذا الفرع
              </Text>
            )}
          </ScrollView>
        </View>
      )}

      {/* 3. Coupon Code */}
      <View
        style={[
          styles.section,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <Typography variant="h3" color={colors.primary} style={styles.sectionTitle}>
          3. كود الخصم (اختياري)
        </Typography>

        {couponResult?.available ? (
          // Coupon applied successfully
          <View style={[styles.couponApplied, { backgroundColor: colors.primary + "10", borderColor: colors.primary + "30" }]}>
            <View style={styles.couponAppliedHeader}>
              <View style={styles.couponAppliedInfo}>
                <Text style={[styles.couponAppliedCode, { color: colors.primary }]}>
                  ✓ {couponResult.code}
                </Text>
                <Text style={[styles.couponAppliedDiscount, { color: colors.text }]}>
                  خصم {couponResult.discount_percentage}% على المبلغ الإجمالي
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.removeCouponBtn, { borderColor: colors.error + "40" }]}
                onPress={handleRemoveCoupon}
              >
                <Text style={{ color: colors.error, fontSize: 13, fontWeight: "600" }}>إزالة</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          // Coupon input
          <View style={styles.couponInputRow}>
            <TextInput
              style={[
                styles.couponInput,
                {
                  backgroundColor: colors.background,
                  borderColor: couponError ? colors.error : colors.border,
                  color: colors.text,
                },
              ]}
              value={couponCode}
              onChangeText={(text) => setCouponCode(text.toUpperCase())}
              placeholder="أدخل كود الخصم..."
              placeholderTextColor={colors.textLight}
              textAlign="right"
              autoCapitalize="characters"
              editable={!couponLoading}
            />
            <TouchableOpacity
              style={[
                styles.couponCheckBtn,
                { backgroundColor: colors.primary },
                couponLoading && { opacity: 0.6 },
              ]}
              onPress={handleCheckCoupon}
              disabled={couponLoading}
            >
              {couponLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.couponCheckBtnText}>تحقق</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {couponError ? (
          <Text style={[styles.couponErrorText, { color: colors.error }]}>
            {couponError}
          </Text>
        ) : null}

        <Text style={[styles.couponHint, { color: colors.textLight }]}>
          الخصم يُطبّق على المبلغ الإجمالي قبل إضافة أجور التوصيل.
        </Text>
      </View>

      {/* 4. Notes */}
      <View
        style={[
          styles.section,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <Typography variant="h3" color={colors.primary} style={styles.sectionTitle}>
          4. ملاحظات على الطلب
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

      {/* Order Summary */}
      <View style={styles.summaryContainer}>
        <OrderSummary
          subtotal={total}
          total={totalWithDeliveryFee}
          deliveryFee={deliveryFee}
          discountPercentage={discountPercentage}
          discountAmount={discountAmount}
        />
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
  emptyMessage: {
    fontSize: 14,
    textAlign: "center",
    padding: spacing.m,
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
  // Coupon styles
  couponInputRow: {
    flexDirection: "row-reverse",
    gap: spacing.s,
    alignItems: "center",
  },
  couponInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: spacing.s,
    padding: spacing.s,
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 1,
  },
  couponCheckBtn: {
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s + 2,
    borderRadius: spacing.s,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 70,
  },
  couponCheckBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  couponErrorText: {
    fontSize: 13,
    textAlign: "right",
    marginTop: spacing.s,
  },
  couponHint: {
    fontSize: 11,
    textAlign: "right",
    marginTop: spacing.s,
  },
  couponApplied: {
    borderRadius: spacing.s,
    borderWidth: 1,
    padding: spacing.m,
  },
  couponAppliedHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
  },
  couponAppliedInfo: {
    flex: 1,
  },
  couponAppliedCode: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "right",
    marginBottom: 2,
  },
  couponAppliedDiscount: {
    fontSize: 13,
    textAlign: "right",
  },
  removeCouponBtn: {
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.xs,
    borderRadius: spacing.s,
    borderWidth: 1,
    marginLeft: spacing.s,
  },
});
