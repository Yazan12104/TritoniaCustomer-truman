import React from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Text,
  TouchableOpacity,
} from "react-native";
import { ScreenContainer } from "../../../shared/components/ScreenContainer";
import { Typography } from "../../../shared/components/Typography";
import { useThemeColors } from "../../../shared/theme/colors";
import { spacing } from "../../../shared/theme/spacing";
import { useWalletStore } from "../store/walletStore";

export const TransactionsScreen = ({ navigation }: any) => {
  const { transactions } = useWalletStore();
  const colors = useThemeColors();

  return (
    <ScreenContainer
      scrollable={false}
      contentContainerStyle={styles.container}
    >
      <View style={styles.headerGroup}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.backButtonText, { color: colors.primary }]}>
            ← رجوع للمحفظة
          </Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Typography variant="h2" color={colors.primary}>
            سجل المعاملات
          </Typography>
        </View>
      </View>

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={[
              styles.txCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View style={styles.txInfo}>
              <Text style={[styles.txDesc, { color: colors.text }]}>
                {item.description}
              </Text>
              <Text style={[styles.txDate, { color: colors.textLight }]}>
                {new Date(item.date).toLocaleString("ar-EG", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </View>
            <Text
              style={[
                styles.txAmount,
                {
                  color:
                    item.type === "CREDIT" ? colors.success : colors.error,
                },
              ]}
            >
              {item.type === "CREDIT" ? "+" : "-"}
              {item.amount.toLocaleString()} ل.س
            </Text>
          </View>
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textLight }]}>
              لا توجد معاملات سابقة.
            </Text>
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
  headerGroup: {
    paddingHorizontal: spacing.l,
    paddingTop: spacing.m,
  },
  backButton: {
    paddingVertical: spacing.s,
    marginBottom: spacing.xs,
  },
  backButtonText: {
    fontWeight: "600",
    fontSize: 16,
  },
  header: {
    marginBottom: spacing.m,
  },
  list: {
    paddingHorizontal: spacing.l,
    paddingBottom: spacing.xxl,
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
  emptyContainer: {
    padding: spacing.xl,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
  },
});
