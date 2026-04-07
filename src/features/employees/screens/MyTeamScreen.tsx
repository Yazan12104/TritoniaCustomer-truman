import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  RefreshControl,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { ScreenContainer } from "../../../shared/components/ScreenContainer";
import { Typography } from "../../../shared/components/Typography";
import { useThemeColors } from "../../../shared/theme/colors";
import { spacing, radii } from "../../../shared/theme/spacing";
import { useEmployeesStore } from "../store/employeesStore";
import { useAuthStore } from "../../auth/store/authStore";
import { Employee } from "../types";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export const MyTeamScreen = ({ navigation }: any) => {
  const { user } = useAuthStore();
  const {
    employees,
    isLoading,
    isLoadingMore,
    pagination,
    error,
    fetchEmployees,
  } = useEmployeesStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const colors = useThemeColors();

  const canAddMember =
    user?.role === "GENERAL_SUPERVISOR" || user?.role === "SUPERVISOR";

  useFocusEffect(
    useCallback(() => {
      if (user?.employee_id) {
        fetchEmployees({
          page: 1,
          search: searchQuery,
          supervisorId: user.employee_id,
        });
      }
    }, [user?.employee_id])
  );

  const onRefresh = useCallback(async () => {
    if (!user?.employee_id) return;
    setRefreshing(true);
    try {
      await fetchEmployees({
        page: 1,
        search: searchQuery,
        supervisorId: user.employee_id,
      });
    } finally {
      setRefreshing(false);
    }
  }, [user?.employee_id, searchQuery, fetchEmployees]);

  useEffect(() => {
    if (!user?.employee_id) return;

    const timer = setTimeout(() => {
      fetchEmployees({
        page: 1,
        search: searchQuery,
        supervisorId: user.employee_id,
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, user?.employee_id]);

  const handleLoadMore = () => {
    if (
      !isLoading &&
      !isLoadingMore &&
      pagination.page < pagination.pages &&
      user?.employee_id
    ) {
      fetchEmployees(
        {
          page: pagination.page + 1,
          search: searchQuery,
          supervisorId: user.employee_id,
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
      onPress={() =>
        navigation.navigate("EmployeeDetailsScreen", { employeeId: item.id })
      }
      activeOpacity={0.7}
    >
      <MaterialCommunityIcons
        name="chevron-right"
        size={24}
        color={colors.border}
      />
      <View style={styles.cardContent}>
        <View style={styles.info}>
          <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
          <Text style={[styles.phone, { color: colors.textLight }]}>
            {item.phone}
          </Text>
          <View
            style={[
              styles.roleContainer,
              { backgroundColor: colors.background },
            ]}
          >
            <Text style={[styles.roleText, { color: colors.text }]}>
              {item.role}
            </Text>
          </View>
        </View>
        <View
          style={[
            styles.avatar,
            { backgroundColor: colors.primary + "15" },
          ]}
        >
          <Text style={[styles.avatarText, { color: colors.primary }]}>
            {item.name.charAt(0)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScreenContainer scrollable={false}>
      <View style={styles.header}>
        {canAddMember && (
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate("CreateEmployeeScreen")}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name="account-plus-outline"
              size={20}
              color={colors.background}
            />
            <Text style={[styles.addButtonText, { color: colors.background }]}>
              إضافة
            </Text>
          </TouchableOpacity>
        )}
        <Typography variant="h2" color={colors.primary}>
          فريقي
        </Typography>
      </View>

      <Text style={[styles.subtitle, { color: colors.textLight }]}>
        قائمة بالموظفين تحت إشرافك.
      </Text>

      <View style={styles.searchContainer}>
        <View
          style={[
            styles.searchBar,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="بحث في الفريق..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={colors.textLight}
            textAlign="right"
          />
          <MaterialCommunityIcons
            name="magnify"
            size={20}
            color={colors.textLight}
          />
        </View>
      </View>

      <FlatList
        data={employees}
        keyExtractor={(item) => `team-${item.id}`}
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
              <ActivityIndicator size="large" color={colors.primary} />
            ) : (
              <>
                <MaterialCommunityIcons
                  name="account-group-outline"
                  size={60}
                  color={colors.border}
                />
                <Text style={[styles.emptyText, { color: colors.textLight }]}>
                  لا يوجد أعضاء في فريقك حالياً.
                </Text>
              </>
            )}
          </View>
        }
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.s,
    marginTop: spacing.s,
  },
  subtitle: {
    marginBottom: spacing.m,
    textAlign: "right",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: radii.m,
  },
  addButtonText: {
    fontWeight: "700",
    fontSize: 14,
    marginLeft: spacing.xs,
  },
  searchContainer: {
    marginBottom: spacing.m,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radii.m,
    paddingHorizontal: spacing.m,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.s,
    fontSize: 14,
    marginRight: spacing.s,
  },
  list: {
    paddingBottom: spacing.xl,
  },
  card: {
    borderRadius: radii.l,
    padding: spacing.m,
    marginBottom: spacing.s,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "flex-end",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: spacing.m,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  info: {
    flex: 1,
    alignItems: "flex-end",
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
  },
  phone: {
    fontSize: 14,
    marginTop: 2,
  },
  roleContainer: {
    paddingHorizontal: spacing.s,
    paddingVertical: 2,
    borderRadius: radii.s,
    marginTop: spacing.xs,
  },
  roleText: {
    fontSize: 10,
    fontWeight: "700",
  },
  footerLoader: {
    paddingVertical: spacing.m,
    alignItems: "center",
  },
  empty: {
    padding: spacing.xxxl,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 16,
    marginTop: spacing.m,
    textAlign: "center",
  },
});
