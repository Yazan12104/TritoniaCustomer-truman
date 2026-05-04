import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { ScreenContainer } from "../../../shared/components/ScreenContainer";
import { Typography } from "../../../shared/components/Typography";
import { useThemeColors } from "../../../shared/theme/colors";
import { spacing } from "../../../shared/theme/spacing";
import { ordersApi } from "../api/ordersApi";
import { Order } from "../types";

import { OrderFilterBar, TimeFilter } from "../components/OrderFilterBar";

export const AllOrdersScreen = ({ navigation }: any) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [period, setPeriod] = useState<TimeFilter>("recent");
  const [customStart, setCustomStart] = useState<string>("");
  const [customEnd, setCustomEnd] = useState<string>("");
  const LIMIT = 10;
  const colors = useThemeColors();

  const fetchOrders = async (
    pageNumber = 1,
    periodVal = period,
    start = customStart,
    end = customEnd,
    isRefresh = false,
  ) => {
    try {
      if (pageNumber === 1 && !isRefresh) setLoading(true);

      const result = await ordersApi.getOrders({
        page: pageNumber,
        limit: LIMIT,
        time_filter: periodVal,
        start_date: start || undefined,
        end_date: end || undefined,
      });

      if (pageNumber === 1) {
        setOrders(result.orders);
      } else {
        setOrders((prev) => [...prev, ...result.orders]);
      }

      setHasMore(result.orders.length === LIMIT && result.orders.length > 0);
      setPage(pageNumber);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchOrders(1);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchOrders(1, period, customStart, customEnd, true);
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore && !loading) {
      setLoadingMore(true);
      fetchOrders(page + 1, period, customStart, customEnd);
    }
  };

  const handlePeriodChange = (
    newPeriod: TimeFilter,
    start?: string,
    end?: string,
  ) => {
    setPeriod(newPeriod);
    if (newPeriod === "custom") {
      setCustomStart(start || "");
      setCustomEnd(end || "");
    }
    fetchOrders(1, newPeriod, start || "", end || "");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return colors.success;
      case "DELIVERED":
        return "#0891b2";
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

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "تمت_الموافقة";
      case "DELIVERED":
        return "تم_التسليم";
      case "REJECTED":
        return "مرفوض";
      case "PENDING":
        return "قيد_الانتظار";
      case "CANCELLED":
        return "ملغي";
      default:
        return status;
    }
  };

  const renderOrderItem = ({ item }: { item: Order }) => (
    <TouchableOpacity
      style={[
        styles.orderCard,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
      onPress={() =>
        navigation.navigate("OrderDetailsScreen", { orderId: item.id })
      }
    >
      <View style={styles.orderHeader}>
        <Typography variant="h3">طلب #{item.id.substring(0, 8)}</Typography>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) + "20" },
          ]}
        >
          <Text
            style={[styles.statusText, { color: getStatusColor(item.status) }]}
          >
            {getStatusLabel(item.status)}
          </Text>
        </View>
      </View>

      <View style={styles.orderInfo}>
        <Text style={[styles.infoLabel, { color: colors.textLight }]}>
          العميل:{" "}
          <Text style={[styles.infoValue, { color: colors.text }]}>
            {item.customer_name || "غير معروف"}
          </Text>
        </Text>
        <Text style={[styles.infoLabel, { color: colors.textLight }]}>
          المسوق:{" "}
          <Text style={[styles.infoValue, { color: colors.text }]}>
            {item.marketer_name || "غير معروف"}
          </Text>
        </Text>
        <Text style={[styles.infoLabel, { color: colors.textLight }]}>
          التاريخ:{" "}
          <Text style={[styles.infoValue, { color: colors.text }]}>
            {new Date(item.created_at).toLocaleDateString()}
          </Text>
        </Text>
      </View>

      <View style={[styles.orderFooter, { borderTopColor: colors.border }]}>
        <Text style={[styles.priceLabel, { color: colors.text }]}>
          السعر المباع:
        </Text>
        <Text style={[styles.priceValue, { color: colors.primary }]}>
          {item.sold_price} ل.س
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  };

  return (
    <ScreenContainer scrollable={false}>
      <Typography variant="h1" color={colors.primary} style={styles.title}>
        جميع الطلبات
      </Typography>

      <OrderFilterBar
        selectedFilter={period}
        onFilterChange={handlePeriodChange}
      />

      {loading && page === 1 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={renderOrderItem}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Typography variant="body" color={colors.textLight}>
                لا يوجد طلبات حالياً.
              </Typography>
            </View>
          }
        />
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    paddingHorizontal: spacing.m,
    marginBottom: spacing.m,
  },
  list: {
    padding: spacing.m,
  },
  orderCard: {
    borderRadius: spacing.m,
    padding: spacing.m,
    marginBottom: spacing.m,
    borderWidth: 1,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.s,
  },
  statusBadge: {
    paddingHorizontal: spacing.s,
    paddingVertical: 4,
    borderRadius: spacing.s,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  orderInfo: {
    marginBottom: spacing.m,
  },
  infoLabel: {
    fontSize: 14,
    marginBottom: 2,
    textAlign: "right",
  },
  infoValue: {
    fontWeight: "500",
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    paddingTop: spacing.s,
  },
  priceLabel: {
    fontSize: 14,
  },
  priceValue: {
    fontSize: 18,
    fontWeight: "bold",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: spacing.xl,
  },
  footerLoader: {
    paddingVertical: spacing.m,
    alignItems: "center",
  },
});
