// CustomersListScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  RefreshControl,
  TextInput,
} from "react-native";
import { ScreenContainer } from "../../../shared/components/ScreenContainer";
import { Typography } from "../../../shared/components/Typography";
import { useThemeColors } from "../../../shared/theme/colors";
import { spacing } from "../../../shared/theme/spacing";
import { useCustomerStore } from "../store/customerStore";
import { CustomerCard } from "../components/CustomerCard";
import { useAuthStore } from "../../auth/store/authStore";

export const CustomersListScreen = ({ navigation }: any) => {
  const {
    customers,
    pagination,
    isLoading,
    isLoadingMore,
    error,
    fetchCustomers,
    clearError,
  } = useCustomerStore();
  const { user } = useAuthStore();
  const isAdmin = user?.role === "ADMIN";
  const colors = useThemeColors();

  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const loadCustomers = (page = 1, fetchMore = false) => {
    fetchCustomers(page, pagination.limit, searchQuery, fetchMore);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      loadCustomers(1, false);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleRefresh = async () => {
    setRefreshing(true);
    setCurrentPage(1);
    await loadCustomers(1, false);
    setRefreshing(false);
  };

  const handleLoadMore = () => {
    if (!isLoading && !isLoadingMore && currentPage < pagination.pages) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      loadCustomers(nextPage, true);
    }
  };

  const handleAddCustomer = () => {
    navigation.navigate("AddCustomerScreen");
  };

  if (isLoading && customers.length === 0) {
    return (
      <ScreenContainer style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  if (error && customers.length === 0) {
    return (
      <ScreenContainer style={styles.center}>
        <Typography variant="body" color={colors.error}>
          {error}
        </Typography>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: colors.primary }]}
          onPress={() => {
            clearError();
            fetchCustomers(1, pagination.limit);
          }}
        >
          <Text style={[styles.retryButtonText, { color: "#ffffff" }]}>
            إعادة المحاولة
          </Text>
        </TouchableOpacity>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scrollable={false}>
      <View style={styles.header}>
        <Typography variant="h2" color={colors.primary}>
          عملائي
        </Typography>
        {!isAdmin && (
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.primary }]}
            onPress={handleAddCustomer}
          >
            <Text style={[styles.addButtonText, { color: "#ffffff" }]}>
              + إضافة
            </Text>
          </TouchableOpacity>
        )}
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

      <FlatList
        data={customers}
        keyExtractor={(item) => `customer-${item.id || item.customer_id}`}
        renderItem={({ item }) => (
          <CustomerCard
            customer={item}
            onPress={() =>
              navigation.navigate("CustomerDetailsScreen", {
                customerId: item.id || item.customer_id,
              })
            }
          />
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isLoadingMore ? (
            <View style={styles.loaderMore}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textLight }]}>
              لم تقم بإضافة أي عملاء بعد.
            </Text>
            <TouchableOpacity
              style={[
                styles.emptyAddButton,
                {
                  backgroundColor: colors.primary + "10",
                  borderColor: colors.primary + "30",
                },
              ]}
              onPress={handleAddCustomer}
            >
              <Text style={[styles.emptyAddButtonText, { color: colors.primary }]}>
                ➕ إضافة عميل جديد
              </Text>
            </TouchableOpacity>
          </View>
        }
      />

      {customers.length > 0 && (
        <View style={[styles.paginationInfo, { borderTopColor: colors.border }]}>
          <Text style={[styles.paginationText, { color: colors.textLight }]}>
            عرض {customers.length} من {pagination.total} عميل
          </Text>
        </View>
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
    marginBottom: spacing.s,
  },
  addButton: {
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: spacing.s,
    minWidth: 70,
    alignItems: "center",
  },
  addButtonText: {
    fontWeight: "bold",
    fontSize: 14,
  },
  list: {
    paddingHorizontal: spacing.l,
    paddingBottom: spacing.xxl,
  },
  searchContainer: {
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.s,
    marginBottom: spacing.s,
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: spacing.s,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    fontSize: 14,
  },
  loaderMore: {
    paddingVertical: spacing.m,
    alignItems: "center",
  },
  emptyContainer: {
    padding: spacing.xl,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    marginBottom: spacing.m,
  },
  emptyAddButton: {
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
    borderRadius: spacing.m,
    borderWidth: 1,
  },
  emptyAddButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  retryButton: {
    marginTop: spacing.m,
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
    borderRadius: spacing.s,
  },
  retryButtonText: {
    fontWeight: "bold",
  },
  paginationInfo: {
    alignItems: "center",
    paddingVertical: spacing.s,
    borderTopWidth: 1,
  },
  paginationText: {
    fontSize: 12,
  },
});
