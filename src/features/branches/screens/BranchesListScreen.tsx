import React, { useEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { ScreenContainer } from "../../../shared/components/ScreenContainer";
import { Typography } from "../../../shared/components/Typography";
import { useThemeColors } from "../../../shared/theme/colors";
import { spacing } from "../../../shared/theme/spacing";
import { useBranchesStore } from "../store/branchesStore";

export const BranchesListScreen = ({ navigation }: any) => {
  const {
    branches,
    governorates,
    isLoading,
    error,
    fetchBranches,
    fetchGovernorates,
  } = useBranchesStore();
  const colors = useThemeColors();

  useEffect(() => {
    fetchGovernorates();
    fetchBranches();
  }, []);

  const getGovernorateName = (id: string) => {
    return governorates.find((g) => g.id === id)?.name || "-";
  };

  if (isLoading && branches.length === 0) {
    return (
      <ScreenContainer style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  if (error) {
    return (
      <ScreenContainer style={styles.center}>
        <Typography variant="body" color={colors.error}>
          {error}
        </Typography>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      scrollable={false}
      contentContainerStyle={styles.container}
    >
      <View style={styles.header}>
        <Typography variant="h2" color={colors.primary}>
          الفروع
        </Typography>
      </View>

      <FlatList
        data={branches}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.branchCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
            activeOpacity={0.8}
            onPress={() =>
              navigation.navigate("BranchDetailsScreen", {
                branchId: item.id,
                branch: item,
              })
            }
          >
            <View style={styles.branchHeader}>
              <Text style={[styles.branchName, { color: colors.text }]}>
                {item.name}
              </Text>
              <View
                style={[
                  styles.statusBadge,
                  item.status === "ACTIVE"
                    ? { backgroundColor: colors.success + "20" }
                    : { backgroundColor: colors.error + "20" },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    {
                      color:
                        item.status === "ACTIVE"
                          ? colors.success
                          : colors.error,
                    },
                  ]}
                >
                  {item.status === "ACTIVE" ? "● نشط" : "○ غير نشط"}
                </Text>
              </View>
            </View>
            <Text style={[styles.branchGovernorate, { color: colors.primary }]}>
              📍 {getGovernorateName(item.governorate_id)}
            </Text>
            <Text style={[styles.branchAddress, { color: colors.textLight }]}>
              {item.address}
            </Text>
            <Text style={[styles.branchPhone, { color: colors.textLight }]}>
              {item.phone}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textLight }]}>
              لا توجد فروع مسجلة.
            </Text>
          </View>
        }
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  center: { justifyContent: "center", alignItems: "center" },
  container: { padding: 0 },
  header: {
    paddingHorizontal: spacing.l,
    paddingTop: spacing.m,
    paddingBottom: spacing.m,
  },
  list: {
    paddingHorizontal: spacing.l,
    paddingBottom: spacing.xxl,
  },
  branchCard: {
    borderRadius: spacing.m,
    padding: spacing.m,
    marginBottom: spacing.s,
    borderWidth: 1,
  },
  branchHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  branchName: {
    fontSize: 16,
    fontWeight: "bold",
    flex: 1,
    textAlign: "right",
  },
  statusBadge: {
    paddingHorizontal: spacing.s,
    paddingVertical: 2,
    borderRadius: spacing.s,
  },
  statusText: { fontSize: 12, fontWeight: "600" },
  branchGovernorate: {
    fontSize: 14,
    marginBottom: 2,
    textAlign: "right",
  },
  branchAddress: {
    fontSize: 13,
    marginBottom: 2,
    textAlign: "right",
  },
  branchPhone: {
    fontSize: 13,
    textAlign: "right",
  },
  emptyContainer: { padding: spacing.xl, alignItems: "center" },
  emptyText: { fontSize: 16 },
});
