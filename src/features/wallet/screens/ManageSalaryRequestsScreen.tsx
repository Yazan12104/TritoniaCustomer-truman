import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { ScreenContainer } from "../../../shared/components/ScreenContainer";
import { Typography } from "../../../shared/components/Typography";
import { useThemeColors } from "../../../shared/theme/colors";
import { spacing } from "../../../shared/theme/spacing";
import { useWalletStore } from "../store/walletStore";
import { useAuthStore } from "../../auth/store/authStore";

export const ManageSalaryRequestsScreen = ({ navigation }: any) => {
  const { user } = useAuthStore();
  const {
    salaryRequests,
    approveRequest,
    rejectRequest,
    fetchWalletData,
    fetchSalaryRequests,
    requestsPagination,
    isLoading,
    isLoadingMoreRequests,
  } = useWalletStore();
  const [refreshing, setRefreshing] = useState(false);
  const colors = useThemeColors();

  useEffect(() => {
    if (user?.id) {
      fetchWalletData(user.id);
    }
  }, [user, fetchWalletData]);

  const onRefresh = async () => {
    setRefreshing(true);
    if (user?.id) await fetchWalletData(user.id);
    setRefreshing(false);
  };

  const handleApprove = async (id: string, name: string) => {
    Alert.alert(
      "تأكيد الموافقة",
      `هل أنت متأكد من الموافقة على طلب سحب الرصيد لـ ${name || "الموظف"}؟`,
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "موافقة",
          onPress: async () => {
            try {
              await approveRequest(id);
              Alert.alert("نجاح", "تمت الموافقة على الطلب بنجاح");
              if (user?.id) await fetchWalletData(user.id);
            } catch (err: any) {
              Alert.alert("خطأ", err.message || "فشل الموافقة على الطلب");
            }
          },
          style: "default",
        },
      ]
    );
  };

  const handleReject = async (id: string, name: string) => {
    Alert.alert(
      "تأكيد الرفض",
      `هل أنت متأكد من رفض طلب سحب الرصيد لـ ${
        name || "الموظف"
      }؟ سيتم إرجاع الرصيد لمحفظته.`,
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "رفض",
          onPress: async () => {
            try {
              await rejectRequest(id);
              Alert.alert("نجاح", "تم رفض الطلب بنجاح");
              if (user?.id) await fetchWalletData(user.id);
            } catch (err: any) {
              Alert.alert("خطأ", err.message || "فشل رفض الطلب");
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  const handleLoadMore = () => {
    if (
      !isLoading &&
      !isLoadingMoreRequests &&
      requestsPagination.page < requestsPagination.pages
    ) {
      fetchSalaryRequests(
        requestsPagination.page + 1,
        requestsPagination.limit,
        true
      );
    }
  };

  const pendingRequests = salaryRequests.filter(
    (req) => req.status === "PENDING"
  );
  const pastRequests = salaryRequests.filter((req) => req.status !== "PENDING");

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
      onPress={() =>
        navigation.navigate("SalaryRequestDetailsScreen", { requestId: item.id })
      }
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <Text style={[styles.employeeName, { color: colors.text }]}>
          {item.employeeName || "موظف غير معروف"}
        </Text>
        <Text style={[styles.amount, { color: colors.primary }]}>
          {item.amount.toLocaleString()} ل.س
        </Text>
      </View>
      <Text style={[styles.infoText, { color: colors.textLight }]}>
        رقم الطلب: {item.id.substring(0, 8)}
      </Text>
      <Text style={[styles.infoText, { color: colors.textLight }]}>
        التاريخ: {new Date(item.requestDate).toLocaleDateString()}
      </Text>
      {item.status === "PENDING" ? (
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.btn, styles.approveBtn, { backgroundColor: colors.success }]}
            onPress={(e) => {
              e.stopPropagation();
              handleApprove(item.id, item.employeeName);
            }}
          >
            <Text style={[styles.btnText, { color: "#ffffff" }]}>موافقة</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btn, styles.rejectBtn, { backgroundColor: colors.error }]}
            onPress={(e) => {
              e.stopPropagation();
              handleReject(item.id, item.employeeName);
            }}
          >
            <Text style={[styles.btnText, { color: "#ffffff" }]}>رفض</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: colors.background, borderColor: colors.border },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              {
                color:
                  item.status === "APPROVED" ? colors.success : colors.error,
              },
            ]}
          >
            {item.status === "APPROVED" ? "مقبول" : "مرفوض"}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <ScreenContainer scrollable={false}>
      {isLoading && salaryRequests.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={[...pendingRequests, ...pastRequests]}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshing={refreshing}
          onRefresh={onRefresh}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isLoadingMoreRequests ? (
              <View style={{ paddingVertical: spacing.m, alignItems: "center" }}>
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            ) : null
          }
          ListHeaderComponent={
            <Typography
              variant="h2"
              color={colors.primary}
              style={styles.title}
            >
              إدارة طلبات الراتب
            </Typography>
          }
          ListEmptyComponent={
            <Text style={[styles.empty, { color: colors.textLight }]}>
              لا توجد طلبات سحب حالياً.
            </Text>
          }
        />
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  title: { marginBottom: spacing.m },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  list: { padding: spacing.m, paddingBottom: spacing.xxl },
  empty: {
    textAlign: "center",
    marginTop: spacing.xl,
  },
  card: {
    padding: spacing.m,
    borderRadius: spacing.s,
    borderWidth: 1,
    marginBottom: spacing.m,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  employeeName: { fontSize: 16, fontWeight: "bold" },
  amount: { fontSize: 18, fontWeight: "bold" },
  infoText: { fontSize: 12, marginTop: 2, textAlign: "right" },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.m,
    gap: spacing.s,
  },
  btn: {
    flex: 1,
    padding: spacing.s,
    borderRadius: spacing.xs,
    alignItems: "center",
  },
  approveBtn: {},
  rejectBtn: {},
  btnText: { fontWeight: "bold" },
  statusBadge: {
    marginTop: spacing.m,
    padding: spacing.s,
    borderRadius: spacing.xs,
    alignItems: "center",
    borderWidth: 1,
  },
  statusText: { fontWeight: "bold" },
});
