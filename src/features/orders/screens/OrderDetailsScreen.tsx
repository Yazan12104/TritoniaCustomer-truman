import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Alert,
} from "react-native";
import { ScreenContainer } from "../../../shared/components/ScreenContainer";
import { Typography } from "../../../shared/components/Typography";
import { useThemeColors } from "../../../shared/theme/colors";
import { spacing } from "../../../shared/theme/spacing";
import { ordersApi } from "../api/ordersApi";
import { Order } from "../types";
import { useAuthStore } from "../../auth/store/authStore";

export const OrderDetailsScreen = ({ route, navigation }: any) => {
  const { orderId } = route.params;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuthStore();
  const colors = useThemeColors();

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const data = await ordersApi.getOrderDetails(orderId);
      setOrder(data);
    } catch (err: any) {
      setError(err.message || "فشل تحميل التفاصيل");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [orderId]);

  const handleApprove = async () => {
    Alert.alert(
      "تأكيد الموافقة",
      "هل أنت متأكد من الموافقة على هذا الطلب؟ سيتم توزيع العمولات فوراً.",
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "موافقة",
          onPress: async () => {
            try {
              setActionLoading(true);
              await ordersApi.approveOrder(orderId);
              Alert.alert("نجاح", "تمت الموافقة على الطلب بنجاح");
              fetchDetails();
            } catch (err: any) {
              Alert.alert("خطأ", err.message || "فشل تنفيذ العملية");
            } finally {
              setActionLoading(false);
            }
          },
        },
      ],
    );
  };

  const handleReject = async () => {
    Alert.alert("تأكيد الرفض", "هل أنت متأكد من رفض هذا الطلب؟", [
      { text: "إلغاء", style: "cancel" },
      {
        text: "رفض",
        style: "destructive",
        onPress: async () => {
          try {
            setActionLoading(true);
            await ordersApi.rejectOrder(orderId);
            Alert.alert("نجاح", "تم رفض الطلب");
            fetchDetails();
          } catch (err: any) {
            Alert.alert("خطأ", err.message || "فشل تنفيذ العملية");
          } finally {
            setActionLoading(false);
          }
        },
      },
    ]);
  };

  const handleCancel = async () => {
    Alert.alert(
      "تأكيد إلغاء الطلب",
      "هل أنت متأكد من إلغاء هذا الطلب؟ سيتم إعادة الكميات إلى المخزون.",
      [
        { text: "رجوع", style: "cancel" },
        {
          text: "إلغاء الطلب",
          style: "destructive",
          onPress: async () => {
            try {
              setActionLoading(true);
              await ordersApi.cancelOrder(orderId);
              Alert.alert("نجاح", "تم إلغاء الطلب بنجاح");
              fetchDetails();
            } catch (err: any) {
              Alert.alert("خطأ", err.message || "فشل إلغاء الطلب");
            } finally {
              setActionLoading(false);
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <ScreenContainer style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  if (error || !order) {
    return (
      <ScreenContainer style={styles.center}>
        <Typography variant="body" color={colors.error}>
          {error || "الطلب غير موجود"}
        </Typography>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={[styles.backButtonText, { color: colors.primary }]}>
            رجوع
          </Text>
        </TouchableOpacity>
      </ScreenContainer>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return colors.success;
      case "REJECTED":
        return colors.error;
      case "PENDING":
        return colors.primary;
      case "CANCELLED":
        return colors.textLight;
      default:
        return colors.textLight;
    }
  };

  const canReject =
    user?.role === "BRANCH_MANAGER" &&
    user?.branch_id === order.branch_id &&
    order.status === "PENDING";

  const canCancel = order.status === "PENDING";

  return (
    <ScreenContainer scrollable={true}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={[styles.backButtonText, { color: colors.primary }]}>
          ← رجوع
        </Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <Typography variant="h2" color={colors.text}>
          تفاصيل الطلب
        </Typography>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(order.status) + "20" },
          ]}
        >
          <Text
            style={[styles.statusText, { color: getStatusColor(order.status) }]}
          >
            {order.status === "PENDING"
              ? "قيد الانتظار"
              : order.status === "APPROVED"
                ? "تمت الموافقة"
                : order.status === "REJECTED"
                  ? "مرفوض"
                  : order.status === "CANCELLED"
                    ? "ملغي"
                    : order.status}
          </Text>
        </View>
      </View>

      <Text style={[styles.idText, { color: colors.textLight }]}>
        ID: {order.id}
      </Text>
      <Text style={[styles.date, { color: colors.textLight }]}>
        تاريخ الطلب: {new Date(order.created_at).toLocaleString()}
      </Text>

      <View
        style={[
          styles.section,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <Typography
          variant="h3"
          color={colors.primary}
          style={styles.sectionTitle}
        >
          بيانات العميل والفرع
        </Typography>
        <Text style={[styles.infoRow, { color: colors.text }]}>
          العميل:{" "}
          <Text style={[styles.infoValue, { color: colors.primary }]}>
            {order.customer_name}
          </Text>
        </Text>
        <Text style={[styles.infoRow, { color: colors.text }]}>
          الفرع:{" "}
          <Text style={[styles.infoValue, { color: colors.primary }]}>
            {order.branch_name}
          </Text>
        </Text>
        {order.delivery_point_name && (
          <Text style={[styles.infoRow, { color: colors.text }]}>
            نقطة التسليم:{" "}
            <Text style={[styles.infoValue, { color: colors.primary }]}>
              {order.delivery_point_name}
            </Text>
          </Text>
        )}
        <Text style={[styles.infoRow, { color: colors.text }]}>
          المسوق:{" "}
          <Text style={[styles.infoValue, { color: colors.primary }]}>
            {order.marketer_name}
          </Text>
        </Text>
      </View>

      <View
        style={[
          styles.section,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <Typography
          variant="h3"
          color={colors.primary}
          style={styles.sectionTitle}
        >
          عناصر الطلب
        </Typography>
        {order.items?.map((item, index) => (
          <View
            key={item.id || index}
            style={[styles.itemRow, { borderBottomColor: colors.border }]}
          >
            <View style={styles.itemInfo}>
              <Text style={[styles.itemName, { color: colors.text }]}>
                {item.product_name}
              </Text>
              <Text style={[styles.itemQty, { color: colors.textLight }]}>
                الكمية: {item.quantity}
              </Text>
            </View>
            <View style={styles.itemMetrics}>
              <Text style={[styles.itemPrice, { color: colors.textLight }]}>
                {item.price} ل.س
              </Text>
              <Text style={[styles.itemTotal, { color: colors.primary }]}>
                {(item.price * item.quantity).toLocaleString()} ل.س
              </Text>
            </View>
          </View>
        ))}
      </View>

      {order.notes && (
        <View
          style={[
            styles.section,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Typography
            variant="h3"
            color={colors.primary}
            style={styles.sectionTitle}
          >
            ملاحظات
          </Typography>
          <Text style={[styles.notesText, { color: colors.text }]}>
            {order.notes}
          </Text>
        </View>
      )}

      {/* {order.status === "APPROVED" &&
        order.transactions &&
        order.transactions.length > 0 && (
          <View
            style={[
              styles.section,
              styles.commissionSection,
              {
                backgroundColor: colors.success + "05",
                borderColor: colors.success + "40",
              },
            ]}
          >
            <Typography
              variant="h3"
              color={colors.success}
              style={styles.sectionTitle}
            >
              توزيع العمولات
            </Typography>
            {order.transactions.map((tx, idx) => (
              <View key={idx} style={styles.txRow}>
                <Text style={[styles.txName, { color: colors.text }]}>
                  {tx.employee_name}
                </Text>
                <Text style={[styles.txAmount, { color: colors.success }]}>
                  +{tx.amount.toLocaleString()} ل.س
                </Text>
              </View>
            ))}
          </View>
        )} */}

      {/* {order.status === "PENDING" &&
        order.preview_transactions &&
        order.preview_transactions.length > 0 && (
          <View
            style={[
              styles.section,
              styles.previewSection,
              {
                backgroundColor: colors.primary + "03",
                borderColor: colors.primary + "40",
              },
            ]}
          >
            <Typography
              variant="h3"
              color={colors.primary}
              style={styles.sectionTitle}
            >
              توزيع الأرباح المتوقع
            </Typography>
            {order.preview_transactions.map((tx, idx) => (
              <View key={idx} style={styles.txRow}>
                <Text style={[styles.txName, { color: colors.text }]}>
                  {tx.employee_name}
                </Text>
                <Text style={[styles.txAmount, { color: colors.success }]}>
                  +{tx.amount.toLocaleString()} ل.س
                </Text>
              </View>
            ))}
            <Text style={[styles.previewHint, { color: colors.textLight }]}>
              * هذه القيم تقريبية وسيتم تأكيدها عند الموافقة.
            </Text>
          </View>
        )} */}

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      <View
        style={[
          styles.summaryContainer,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: colors.text }]}>
            المبلغ الإجمالي (الأساسي):
          </Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>
            {order.total_price.toLocaleString()} ل.س
          </Text>
        </View>
        <View
          style={[
            styles.summaryRow,
            styles.soldRow,
            { borderTopColor: colors.border },
          ]}
        >
          <Text
            style={[
              styles.summaryLabel,
              styles.soldLabel,
              { color: colors.primary },
            ]}
          >
            سعر البيع الإجمالي:
          </Text>
          <Text
            style={[
              styles.summaryValue,
              styles.soldValue,
              { color: colors.primary },
            ]}
          >
            {order.sold_price.toLocaleString()} ل.س
          </Text>
        </View>
      </View>

      {canCancel && (
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.textLight }]}
            onPress={handleCancel}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.actionButtonText}>إلغاء الطلب</Text>
            )}
          </TouchableOpacity>

          {canReject && (
            <>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  { backgroundColor: colors.success },
                ]}
                onPress={handleApprove}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.actionButtonText}>موافقة على الطلب</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.error }]}
                onPress={handleReject}
                disabled={actionLoading}
              >
                <Text style={styles.actionButtonText}>رفض الطلب</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}

      {order.status !== "PENDING" && (
        <View
          style={[
            styles.completedContainer,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.completedText, { color: colors.text }]}>
            {order.status === "APPROVED"
              ? "✅ تمت الموافقة على هذا الطلب"
              : order.status === "REJECTED"
                ? "❌ تم رفض هذا الطلب"
                : order.status === "CANCELLED"
                  ? "🚫 تم إلغاء هذا الطلب"
                  : ""}
          </Text>
        </View>
      )}

      <View style={{ height: spacing.xl }} />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  backButton: {
    paddingVertical: spacing.s,
    marginBottom: spacing.m,
  },
  backButtonText: {
    fontWeight: "600",
    fontSize: 16,
  },
  header: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  statusBadge: {
    paddingHorizontal: spacing.s,
    paddingVertical: 4,
    borderRadius: spacing.s,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  idText: {
    fontSize: 12,
    textAlign: "right",
  },
  date: {
    marginBottom: spacing.l,
    fontSize: 14,
    textAlign: "right",
  },
  section: {
    padding: spacing.m,
    borderRadius: spacing.m,
    marginBottom: spacing.m,
    borderWidth: 1,
  },
  commissionSection: {},
  previewSection: {
    borderStyle: "dashed",
  },
  sectionTitle: {
    marginBottom: spacing.s,
    textAlign: "right",
  },
  infoRow: {
    fontSize: 16,
    textAlign: "right",
    marginBottom: 4,
  },
  infoValue: {
    fontWeight: "bold",
  },
  itemRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.s,
    paddingBottom: spacing.s,
    borderBottomWidth: 1,
  },
  itemInfo: {
    alignItems: "flex-end",
  },
  itemMetrics: {
    alignItems: "flex-start",
  },
  itemName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  itemQty: {
    fontSize: 14,
  },
  itemPrice: {
    fontSize: 14,
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: "bold",
  },
  txRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  txName: {
    fontSize: 14,
  },
  txAmount: {
    fontSize: 14,
    fontWeight: "bold",
  },
  previewHint: {
    fontSize: 11,
    textAlign: "right",
    marginTop: spacing.s,
    fontStyle: "italic",
  },
  notesText: {
    textAlign: "right",
  },
  divider: {
    height: 1,
    marginVertical: spacing.m,
  },
  summaryContainer: {
    padding: spacing.m,
    borderRadius: spacing.m,
    borderWidth: 1,
  },
  summaryRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.s,
  },
  summaryLabel: {
    fontSize: 16,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "bold",
  },
  soldRow: {
    marginTop: spacing.s,
    paddingTop: spacing.s,
    borderTopWidth: 1,
  },
  soldLabel: {
    fontSize: 18,
    fontWeight: "bold",
  },
  soldValue: {
    fontSize: 20,
    fontWeight: "bold",
  },
  actionsContainer: {
    marginTop: spacing.xl,
    gap: spacing.m,
  },
  actionButton: {
    height: 54,
    borderRadius: spacing.m,
    justifyContent: "center",
    alignItems: "center",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  completedContainer: {
    marginTop: spacing.xl,
    padding: spacing.l,
    borderRadius: spacing.m,
    borderWidth: 1,
    alignItems: "center",
  },
  completedText: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});
