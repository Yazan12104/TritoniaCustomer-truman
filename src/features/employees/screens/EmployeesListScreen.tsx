import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  TextInput,
  RefreshControl,
} from "react-native";
import { ScreenContainer } from "../../../shared/components/ScreenContainer";
import { Typography } from "../../../shared/components/Typography";
import { useThemeColors } from "../../../shared/theme/colors";
import { spacing } from "../../../shared/theme/spacing";
import { useEmployeesStore } from "../store/employeesStore";
import { Employee } from "../types";
import { useAuthStore } from "../../auth/store/authStore";

const ROLE_LABELS: Record<string, string> = {
  GENERAL_SUPERVISOR: "مشرف عام",
  SUPERVISOR: "مشرف",
  MARKETER: "مسوق",
  BRANCH_MANAGER: "مدير فرع",
};

const FILTER_ROLES = [
  { value: "ALL", label: "الكل" },
  { value: "BRANCH_MANAGER", label: "مدراء الفروع" },
  { value: "GENERAL_SUPERVISOR", label: "مشرفين عامين" },
  { value: "SUPERVISOR", label: "مشرفين" },
  { value: "MARKETER", label: "مسوقين" },
];

export const EmployeesListScreen = ({ navigation }: any) => {
  const {
    employees,
    isLoading,
    isLoadingMore,
    pagination,
    error,
    fetchEmployees,
  } = useEmployeesStore();
  const { user } = useAuthStore();
  const colors = useThemeColors();

  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // Dynamic role colors for dark/light mode
  const getRoleBadgeStyle = (role: string) => {
    const roleColorMap: Record<string, string> = {
      GENERAL_SUPERVISOR: "#2196f3",
      SUPERVISOR: "#9c27b0",
      MARKETER: "#4caf50",
      BRANCH_MANAGER: "#ff9800",
    };
    const baseColor = roleColorMap[role] || colors.primary;
    return {
      backgroundColor: baseColor + "15",
      borderColor: baseColor + "30",
    };
  };

  const loadEmployees = (page = 1, loadMore = false) => {
    const branchId =
      user?.role === "BRANCH_MANAGER" ? user.branch_id : undefined;
    return fetchEmployees(
      {
        page,
        search: searchQuery,
        role: selectedRoleFilter,
        branchId,
      },
      loadMore
    );
  };

  useEffect(() => {
    loadEmployees(1);
  }, [selectedRoleFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadEmployees(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadEmployees(1);
    setRefreshing(false);
  };

  const handleLoadMore = () => {
    if (!isLoading && !isLoadingMore && pagination.page < pagination.pages) {
      const branchId =
        user?.role === "BRANCH_MANAGER" ? user.branch_id : undefined;
      fetchEmployees(
        {
          page: pagination.page + 1,
          search: searchQuery,
          role: selectedRoleFilter,
          branchId,
        },
        true
      );
    }
  };

  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  };

  const renderEmployee = ({ item }: { item: Employee }) => (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
      activeOpacity={0.8}
      onPress={() =>
        navigation.navigate("EmployeeDetailsScreen", {
          employeeId: item.id,
          employee: item,
        })
      }
    >
      <View style={styles.cardHeader}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={[styles.avatarText, { color: "#ffffff" }]}>
            {item.name.charAt(0)}
          </Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={[styles.name, { color: colors.text }]}>
            {item.name}
          </Text>
          <Text style={[styles.email, { color: colors.textLight }]}>
            {item.email}
          </Text>
        </View>
        <View
          style={[
            styles.roleBadge,
            getRoleBadgeStyle(item.role),
            { borderWidth: 1 },
          ]}
        >
          <Text
            style={[
              styles.roleText,
              { color: colors.text, fontSize: 11 },
            ]}
          >
            {ROLE_LABELS[item.role] || item.role}
          </Text>
        </View>
      </View>
      <View style={styles.cardFooter}>
        <Text style={[styles.phone, { color: colors.textLight }]}>
          {item.phone}
        </Text>
        <View
          style={[
            styles.statusDot,
            {
              backgroundColor: item.status === "ACTIVE" ? "#4caf50" : "#ef5350",
            },
          ]}
        />
      </View>
    </TouchableOpacity>
  );

  if (isLoading && employees.length === 0) {
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
          الموظفون
        </Typography>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate("CreateEmployeeScreen")}
          activeOpacity={0.8}
        >
          <Text style={[styles.addButtonText, { color: "#ffffff" }]}>
            + إضافة
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={[
            styles.searchInput,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              color: colors.text,
            },
          ]}
          placeholder="بحث بالاسم أو رقم الهاتف..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={colors.textLight}
          textAlign="right"
        />
      </View>

      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {FILTER_ROLES.map((role) => (
            <TouchableOpacity
              key={role.value}
              style={[
                styles.filterChip,
                {
                  backgroundColor:
                    selectedRoleFilter === role.value
                      ? colors.primary
                      : colors.surface,
                  borderColor:
                    selectedRoleFilter === role.value
                      ? colors.primary
                      : colors.border,
                },
              ]}
              onPress={() => setSelectedRoleFilter(role.value)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  {
                    color:
                      selectedRoleFilter === role.value
                        ? "#ffffff"
                        : colors.textLight,
                  },
                ]}
              >
                {role.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <FlatList
        data={employees}
        keyExtractor={(item) => `employee-${item.id}`}
        renderItem={renderEmployee}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            {isLoading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Text style={[styles.emptyText, { color: colors.textLight }]}>
                لا يوجد موظفون مسجلون.
              </Text>
            )}
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.l,
    paddingTop: spacing.m,
  },
  searchContainer: {
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.s,
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: spacing.s,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    fontSize: 14,
  },
  addButton: {
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.xs,
    borderRadius: spacing.m,
  },
  addButtonText: { fontWeight: "700", fontSize: 14 },
  filterContainer: {
    paddingBottom: spacing.m,
  },
  filterScroll: {
    paddingHorizontal: spacing.l,
    gap: spacing.s,
  },
  filterChip: {
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: spacing.l,
    borderWidth: 1,
    marginRight: spacing.s,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: "600",
  },
  list: { paddingHorizontal: spacing.l, paddingBottom: spacing.xxl },
  card: {
    borderRadius: spacing.m,
    padding: spacing.m,
    marginBottom: spacing.s,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.s,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.m,
  },
  avatarText: { fontSize: 18, fontWeight: "bold" },
  cardInfo: { flex: 1 },
  name: { fontSize: 16, fontWeight: "bold" },
  email: { fontSize: 13, marginTop: 2 },
  roleBadge: {
    paddingHorizontal: spacing.s,
    paddingVertical: 2,
    borderRadius: spacing.s,
  },
  roleText: { fontWeight: "600" },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  phone: { fontSize: 13 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  empty: { padding: spacing.xl, alignItems: "center" },
  emptyText: { fontSize: 16 },
  footerLoader: {
    paddingVertical: spacing.m,
    alignItems: "center",
  },
});
