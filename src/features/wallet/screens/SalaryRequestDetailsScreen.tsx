import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
} from "react-native";
import { ScreenContainer } from "../../../shared/components/ScreenContainer";
import { Typography } from "../../../shared/components/Typography";
import { useThemeColors } from "../../../shared/theme/colors";
import { spacing } from "../../../shared/theme/spacing";
import { walletApi } from "../api/walletApi";
import { useWalletStore } from "../store/walletStore";
import { useAuthStore } from "../../auth/store/authStore";
import { SalaryRequest, SalaryRequestTransaction } from "../types";

export const SalaryRequestDetailsScreen = ({ route, navigation }: any) => {
  const { requestId } = route.params;
  const [request, setRequest] = useState<SalaryRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();
  const { removeTransactionFromRequest } = useWalletStore();
  const colors = useThemeColors();

  const canRemoveTransactions =
    user?.role === "ADMIN" || user?.role === "BRANCH_MANAGER";

  useEffect(() => {
    fetchDetails();
  }, [requestId]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await walletApi.getSalaryRequestDetails(requestId);
      setRequest(data);
    } catch (err: any) {
      console.error("Error fetching salary request details:", err);
      setError(err.message || "فشل تحميل التفاصيل");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveTransaction = (transaction: SalaryRequestTransaction) => {
    if (!request || request.status !== "PENDING") return;

    Alert.alert(
      "تأكيد الإزالة",
      `هل أنت متأكد من إزالة هذه المعاملة من الطلب؟\nالمبلغ: ${transaction.amount.toLocaleString()} ل.س`,
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "إزالة",
          style: "destructive",
          onPress: async () => {
            try {
              await removeTransactionFromRequest(requestId, transaction.id);
              Alert.alert("نجاح", "تم إزالة المعاملة بنجاح");
              await fetchDetails();
            } catch (err: any) {
              Alert.alert("خطأ", err.message || "فشل إزالة المعاملة");
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return colors.success;
      case "REJECTED":
        return colors.error;
      case "PENDING":
        return colors.primary;
      default:
        return colors.textLight;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "مقبول";
      case "REJECTED":
        return "مرفوض";
      case "PENDING":
        return "قيد الانتظار";
      default:
        return status;
    }
  };

  const renderTransaction = ({ item }: { item: SalaryRequestTransaction }) => {
    const profit =
      item.total_sold_price && item.total_main_price
        ? item.total_sold_price - item.total_main_price
        : 0;

    const showRemoveButton =
      canRemoveTransactions && request?.status === "PENDING";
    const hasOrderId = !!item.order_id;

    return (
      <View
        style={[
          styles.transactionCard,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <View style={[styles.transactionHeader, { borderBottomColor: colors.border }]}>
          {hasOrderId ? (
            <TouchableOpacity
              style={styles.orderIdButton}
              onPress={() =>
                navigation.navigate("OrderDetailsScreen", {
                  orderId: item.order_id!,
                })
              }
              activeOpacity={0.7}
            >
              <Text style={[styles.orderIdLabel, { color: colors.textLight }]}>
                طلب رقم:
              </Text>
              <Text style={[styles.orderIdValue, { color: colors.primary }]}>
                {item.order_id!.substring(0, 8)}
              </Text>
            </TouchableOpacity>
          ) : (
            <Text style={[styles.transactionLabel, { color: colors.textLight }]}>
              طلب رقم: N/A
            </Text>
          )}
          <Text style={[styles.transactionAmount, { color: colors.primary }]}>
            {item.amount.toLocaleString()} ل.س
          </Text>
        </View>

        <View style={styles.transactionDetails}>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textLight }]}>
              السعر الأساسي:
            </Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {item.total_main_price?.toLocaleString() || "0"} ل.س
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textLight }]}>
              سعر البيع:
            </Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {item.total_sold_price?.toLocaleString() || "0"} ل.س
            </Text>
          </View>

          {profit !== 0 && (
            <View
              style={[
                styles.detailRow,
                styles.profitRow,
                { backgroundColor: colors.background },
              ]}
            >
              <Text style={[styles.profitLabel, { color: colors.text }]}>
                الربح:
              </Text>
              <Text
                style={[
                  styles.profitValue,
                  { color: profit > 0 ? colors.success : colors.error },
                ]}
              >
                {profit.toLocaleString()} ل.س
              </Text>
            </View>
          )}

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textLight }]}>
              التاريخ:
            </Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {new Date(item.created_at).toLocaleDateString("ar-EG", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </Text>
          </View>
        </View>

        {showRemoveButton && (
          <TouchableOpacity
            style={[styles.removeButton, { borderTopColor: colors.border }]}
            onPress={() => handleRemoveTransaction(item)}
            activeOpacity={0.7}
          >
            <Text style={[styles.removeButtonText, { color: colors.error }]}>
              إزالة المعاملة
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <ScreenContainer style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  if (error || !request) {
    return (
      <ScreenContainer style={styles.center}>
        <Typography variant="body" color={colors.error}>
          {error || "التفاصيل غير متاحة"}
        </Typography>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: colors.primary }]}
          onPress={fetchDetails}
        >
          <Text style={[styles.retryButtonText, { color: colors.background }]}>
            إعادة المحاولة
          </Text>
        </TouchableOpacity>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scrollable={false}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.backButtonText, { color: colors.primary }]}>
            ← رجوع للطلبات
          </Text>
        </TouchableOpacity>

        <Typography variant="h2" color={colors.primary}>
          تفاصيل طلب الراتب
        </Typography>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.infoCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textLight }]}>
              الموظف:
            </Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {request.employeeName}
            </Text>
          </View>

          {request.role && (
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textLight }]}>
                المنصب:
              </Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {request.role}
              </Text>
            </View>
          )}

          {request.branch && (
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textLight }]}>
                الفرع:
              </Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {request.branch}
              </Text>
            </View>
          )}

          {request.phone && (
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textLight }]}>
                الهاتف:
              </Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {request.phone}
              </Text>
            </View>
          )}

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textLight }]}>
              المبلغ المطلوب:
            </Text>
            <Text style={[styles.amountValue, { color: colors.primary }]}>
              {request.amount.toLocaleString()} ل.س
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textLight }]}>
              الحالة:
            </Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(request.status) + "20" },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  { color: getStatusColor(request.status) },
                ]}
              >
                {getStatusText(request.status)}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textLight }]}>
              تاريخ الطلب:
            </Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {new Date(request.requestDate).toLocaleDateString("ar-EG", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Text>
          </View>
        </View>

        <View style={styles.transactionsSection}>
          <Typography variant="h3" style={styles.sectionTitle}>
            المعاملات المالية ({request.transactions?.length || 0})
          </Typography>

          {request.transactions && request.transactions.length > 0 ? (
            <FlatList
              data={request.transactions}
              keyExtractor={(item) => item.id}
              renderItem={renderTransaction}
              scrollEnabled={false}
              contentContainerStyle={styles.transactionsList}
            />
          ) : (
            <View style={styles.emptyTransactions}>
              <Text style={[styles.emptyText, { color: colors.textLight }]}>
                لا توجد معاملات مالية
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    paddingHorizontal: spacing.l,
    paddingTop: spacing.m,
    paddingBottom: spacing.m,
  },
  backButton: {
    paddingVertical: spacing.s,
    marginBottom: spacing.xs,
  },
  backButtonText: {
    fontWeight: "600",
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  infoCard: {
    padding: spacing.l,
    borderRadius: spacing.m,
    borderWidth: 1,
    marginHorizontal: spacing.l,
    marginBottom: spacing.m,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.s,
  },
  infoLabel: {
    fontSize: 14,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  amountValue: {
    fontSize: 24,
    fontWeight: "bold",
  },
  divider: {
    height: 1,
    marginVertical: spacing.m,
  },
  statusBadge: {
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.xs,
    borderRadius: spacing.s,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  transactionsSection: {
    paddingHorizontal: spacing.l,
    paddingBottom: spacing.xxl,
  },
  sectionTitle: {
    marginBottom: spacing.m,
  },
  transactionsList: {
    paddingBottom: spacing.m,
  },
  transactionCard: {
    padding: spacing.m,
    borderRadius: spacing.m,
    marginBottom: spacing.m,
    borderWidth: 1,
  },
  transactionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.s,
    paddingBottom: spacing.s,
    borderBottomWidth: 1,
  },
  orderIdButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs / 2,
    flex: 1,
  },
  orderIdLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  orderIdValue: {
    fontSize: 14,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  transactionLabel: {
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: "bold",
  },
  transactionDetails: {
    gap: spacing.xs,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailLabel: {
    fontSize: 13,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: "500",
  },
  profitRow: {
    padding: spacing.xs,
    borderRadius: spacing.xs,
    marginVertical: spacing.xs / 2,
  },
  profitLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  profitValue: {
    fontSize: 13,
    fontWeight: "bold",
  },
  emptyTransactions: {
    padding: spacing.xl,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
  },
  removeButton: {
    marginTop: spacing.m,
    paddingTop: spacing.s,
    borderTopWidth: 1,
    paddingVertical: spacing.s,
    alignItems: "center",
  },
  removeButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  retryButton: {
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
    borderRadius: spacing.m,
    marginTop: spacing.m,
  },
  retryButtonText: {
    fontWeight: "bold",
    fontSize: 16,
  },
});
