import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  FlatList,
  RefreshControl,
} from "react-native";
import { ScreenContainer } from "../../../shared/components/ScreenContainer";
import { Typography } from "../../../shared/components/Typography";
import { useThemeColors } from "../../../shared/theme/colors";
import { spacing } from "../../../shared/theme/spacing";
import { useWalletStore } from "../store/walletStore";
import { useAuthStore } from "../../auth/store/authStore";

export const MyWalletScreen = ({ navigation }: any) => {
  const { user } = useAuthStore();
  const { summary, isLoading, error, fetchWalletData, transactions } =
    useWalletStore();
  const [refreshing, setRefreshing] = useState(false);
  const colors = useThemeColors();

  const loadWalletData = async () => {
    if (user?.id) {
      await fetchWalletData(user.id);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWalletData();
    setRefreshing(false);
  };

  useEffect(() => {
    loadWalletData();
  }, [user]);

  const data = [
    { type: "header", key: "header" },
    { type: "balanceCard", key: "balanceCard" },
    { type: "statsRow", key: "statsRow" },
    { type: "actionsContainer", key: "actionsContainer" },
    { type: "transactionsHeader", key: "transactionsHeader" },
    ...transactions
      .slice(0, 3)
      .map((tx, index) => ({ type: "transaction", key: tx.id, transaction: tx })),
    { type: "emptyTransactions", key: "emptyTransactions" },
  ];

  const renderItem = ({ item }: { item: any }) => {
    switch (item.type) {
      case "header":
        return (
          <Typography variant="h2" color={colors.primary} style={styles.title}>
            محفظتي
          </Typography>
        );

      case "balanceCard":
        return (
          <View
            style={[styles.balanceCard, { backgroundColor: colors.primary, shadowColor: colors.primary }]}
          >
            <Text style={[styles.balanceLabel, { color: "#ffffff", opacity: 0.9 }]}>
              الرصيد المتاح
            </Text>
            <Text style={[styles.balanceValue, { color: "#ffffff" }]}>
              {summary?.currentBalance.toLocaleString()} ل.س
            </Text>
          </View>
        );

      case "statsRow":
        return (
          <View style={styles.statsRow}>
            <View
              style={[
                styles.statBox,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.statLabel, { color: colors.textLight }]}>
                إجمالي الأرباح
              </Text>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {summary?.totalEarned.toLocaleString()} ل.س
              </Text>
            </View>
            <View
              style={[
                styles.statBox,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.statLabel, { color: colors.textLight }]}>
                إجمالي المسحوبات
              </Text>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {summary?.totalWithdrawn.toLocaleString()} ل.س
              </Text>
            </View>
          </View>
        );

      case "actionsContainer":
        return (
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: colors.primary },
              ]}
              onPress={() => navigation.navigate("SalaryRequestScreen")}
              activeOpacity={0.8}
            >
              <Text style={[styles.actionButtonText, { color: "#ffffff" }]}>
                طلب سحب رصيد
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.outlineButton,
                { borderColor: colors.primary },
              ]}
              onPress={() => navigation.navigate("TransactionsScreen")}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.actionButtonText,
                  styles.outlineButtonText,
                  { color: colors.primary },
                ]}
              >
                عرض المعاملات
              </Text>
            </TouchableOpacity>
          </View>
        );

      case "transactionsHeader":
        return (
          <Typography
            variant="h3"
            color={colors.text}
            style={styles.sectionTitle}
          >
            أحدث المعاملات
          </Typography>
        );

      case "transaction":
        const tx = item.transaction;
        return (
          <View
            key={tx.id}
            style={[
              styles.txCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View style={styles.txInfo}>
              <Text style={[styles.txDesc, { color: colors.text }]}>
                {tx.description}
              </Text>
              <Text style={[styles.txDate, { color: colors.textLight }]}>
                {new Date(tx.date).toLocaleDateString()}
              </Text>
            </View>
            <Text
              style={[
                styles.txAmount,
                { color: tx.type === "CREDIT" ? colors.success : colors.error },
              ]}
            >
              {tx.type === "CREDIT" ? "+" : "-"}
              {tx.amount.toLocaleString()} ل.س
            </Text>
          </View>
        );

      case "emptyTransactions":
        if (transactions.length === 0) {
          return (
            <Text style={[styles.emptyText, { color: colors.textLight }]}>
              لا توجد معاملات مسجلة.
            </Text>
          );
        }
        return null;

      default:
        return null;
    }
  };

  if (isLoading && !summary && !refreshing) {
    return (
      <ScreenContainer scrollable={false} style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  if (error && !refreshing) {
    return (
      <ScreenContainer scrollable={false} style={styles.center}>
        <Typography variant="body" color={colors.error}>
          {error}
        </Typography>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scrollable={false}>
      <FlatList
        data={data}
        keyExtractor={(item) => item.key}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    padding: spacing.l,
    flexGrow: 1,
  },
  title: {
    marginBottom: spacing.l,
  },
  balanceCard: {
    padding: spacing.xl,
    borderRadius: spacing.m,
    alignItems: "center",
    marginBottom: spacing.m,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  balanceLabel: {
    fontSize: 16,
    marginBottom: spacing.s,
  },
  balanceValue: {
    fontSize: 28,
    fontWeight: "bold",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.l,
  },
  statBox: {
    flex: 1,
    padding: spacing.m,
    borderRadius: spacing.m,
    borderWidth: 1,
    alignItems: "center",
    marginHorizontal: spacing.xs,
  },
  statLabel: {
    fontSize: 12,
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
  },
  actionsContainer: {
    marginBottom: spacing.xl,
  },
  actionButton: {
    padding: spacing.m,
    borderRadius: spacing.m,
    alignItems: "center",
    marginBottom: spacing.s,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  outlineButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
  },
  outlineButtonText: {},
  sectionTitle: {
    marginBottom: spacing.m,
  },
  emptyText: {
    textAlign: "center",
    marginTop: spacing.m,
  },
  txCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.m,
    borderRadius: spacing.m,
    marginBottom: spacing.s,
    borderWidth: 1,
  },
  txInfo: {
    flex: 1,
  },
  txDesc: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
    textAlign: "right",
  },
  txDate: {
    fontSize: 12,
    textAlign: "right",
  },
  txAmount: {
    fontSize: 16,
    fontWeight: "bold",
  },
});