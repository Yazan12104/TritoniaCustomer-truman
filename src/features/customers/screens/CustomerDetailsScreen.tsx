// CustomerDetailsScreen.tsx
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
import { useCustomerStore } from "../store/customerStore";
import { Order, OrderItem } from "../types";
import { useAuthStore } from "../../auth/store/authStore";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export const CustomerDetailsScreen = ({ route, navigation }: any) => {
  const { customerId } = route.params;
  const {
    selectedCustomer,
    isLoading,
    error,
    fetchCustomerDetails,
    clearSelectedCustomer,
  } = useCustomerStore();
  const { user } = useAuthStore();
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const colors = useThemeColors();

  useEffect(() => {
    const loadCustomer = async () => {
      setLoadingOrders(true);
      await fetchCustomerDetails(customerId);
      setLoadingOrders(false);
    };

    loadCustomer();

    return () => {
      clearSelectedCustomer();
    };
  }, [customerId]);

  const toggleOrderExpand = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const formatPrice = (price: number) => {
    return `${price.toLocaleString()} ل.س`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ar-EG");
  };

  const renderOrderItem = ({ item }: { item: OrderItem }) => (
    <View style={styles.orderItem}>
      <Text style={[styles.productName, { color: colors.text }]}>
        {item.product_name || "منتج"}
      </Text>
      <View style={styles.orderItemDetails}>
        <Text style={[styles.quantity, { color: colors.textLight }]}>
          الكمية: {item.quantity}
        </Text>
        <Text style={[styles.price, { color: colors.primary }]}>
          {formatPrice(item.price || 0)}
        </Text>
      </View>
    </View>
  );

  const renderOrder = ({ item: order }: { item: Order }) => {
    const isExpanded = expandedOrder === order.id;
    const orderTotal =
      order.total_amount ||
      order.items?.reduce((sum, i) => sum + (i.price || 0), 0) ||
      0;

    return (
      <View
        style={[
          styles.orderCard,
          { backgroundColor: colors.background, borderColor: colors.border },
        ]}
      >
        <TouchableOpacity
          style={styles.orderHeader}
          onPress={() => toggleOrderExpand(order.id)}
          activeOpacity={0.7}
        >
          <View style={styles.orderHeaderLeft}>
            <Text style={[styles.orderNumber, { color: colors.text }]}>
              طلب #{order.order_number || order.id.slice(-6)}
            </Text>
            {order.status && (
              <View
                style={[
                  styles.statusBadge,
                  getStatusStyle(order.status),
                ]}
              >
                <Text style={[styles.statusText, { color: colors.text }]}>
                  {getStatusText(order.status)}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.orderHeaderRight}>
            <Text style={[styles.orderTotal, { color: colors.primary }]}>
              {formatPrice(orderTotal)}
            </Text>
            <Text style={[styles.expandIcon, { color: colors.textLight }]}>
              {isExpanded ? "▲" : "▼"}
            </Text>
          </View>
        </TouchableOpacity>

        <View style={styles.orderMeta}>
          <Text style={[styles.orderDate, { color: colors.textLight }]}>
            {formatDate(order.created_at || "")}
          </Text>
        </View>

        {isExpanded && order.items && order.items.length > 0 && (
          <View
            style={[
              styles.orderItemsContainer,
              { borderTopColor: colors.border },
            ]}
          >
            <Text style={[styles.itemsTitle, { color: colors.textLight }]}>
              المنتجات:
            </Text>
            {order.items.map((item, index) => (
              <View key={item.id || index}>
                {renderOrderItem({ item })}
                {index < (order.items?.length || 0) - 1 && (
                  <View
                    style={[styles.divider, { backgroundColor: colors.border }]}
                  />
                )}
              </View>
            ))}
          </View>
        )}

        {isExpanded && (!order.items || order.items.length === 0) && (
          <Text style={[styles.noItems, { color: colors.textLight }]}>
            لا توجد منتجات في هذا الطلب
          </Text>
        )}
      </View>
    );
  };

  const getStatusStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "delivered":
        return { backgroundColor: "#4CAF50" + "20" };
      case "pending":
        return { backgroundColor: "#FF9800" + "20" };
      case "cancelled":
        return { backgroundColor: "#F44336" + "20" };
      default:
        return { backgroundColor: colors.border };
    }
  };

  const getStatusText = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "delivered":
        return "مكتمل";
      case "pending":
        return "قيد المعالجة";
      case "cancelled":
        return "ملغي";
      default:
        return status;
    }
  };

  if (isLoading && !selectedCustomer) {
    return (
      <ScreenContainer style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  if (error || !selectedCustomer) {
    return (
      <ScreenContainer style={styles.center}>
        <Typography variant="body" color={colors.error}>
          {error || "العميل غير موجود"}
        </Typography>
        <TouchableOpacity
          style={styles.backButtonInline}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.backButtonText, { color: colors.primary }]}>
            ← رجوع
          </Text>
        </TouchableOpacity>
      </ScreenContainer>
    );
  }

  const customer = selectedCustomer;
  const displayName = customer.full_name || customer.name || "";
  const initials = displayName.substring(0, 2).toUpperCase();
  const hasOrders = customer.orders && customer.orders.length > 0;
  const isAdmin = user?.role === "ADMIN";
  const customerUserId = customer.customer_user_id || customer.user_id;

  const handleApplyAsEmployee = () => {
    if (!customerUserId) {
      Alert.alert("خطأ", "معرف المستخدم غير متوفر.");
      return;
    }
    navigation.navigate("ApplyEmployeeScreen", { userId: customerUserId });
  };

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

      <View
        style={[
          styles.headerCard,
          {
            backgroundColor: colors.surface,
            shadowColor: colors.text,
            borderColor: colors.border,
          },
        ]}
      >
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={[styles.avatarText, { color: colors.background }]}>
            {initials}
          </Text>
        </View>
        <Typography variant="h2" color={colors.text}>
          {displayName}
        </Typography>
        <Text style={[styles.date, { color: colors.textLight }]}>
          تاريخ الإضافة:{" "}
          {customer.createdAt
            ? new Date(customer.createdAt).toLocaleDateString()
            : "غير متوفر"}
        </Text>
      </View>

      {isAdmin && (
        <TouchableOpacity
          style={[
            styles.applyEmployeeButton,
            { backgroundColor: colors.primary },
          ]}
          onPress={handleApplyAsEmployee}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons
            name="account-convert"
            size={20}
            color={colors.background}
          />
          <Text
            style={[
              styles.applyEmployeeButtonText,
              { color: colors.background },
            ]}
          >
            تطبيق كموظف
          </Text>
        </TouchableOpacity>
      )}

      <View style={[styles.infoSection, { backgroundColor: colors.surface }]}>
        <Typography
          variant="h3"
          color={colors.text}
          style={[styles.sectionTitle, { borderBottomColor: colors.border }]}
        >
          معلومات الاتصال
        </Typography>

        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: colors.textLight }]}>
            الهاتف:
          </Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>
            {customer.phone || "غير متوفر"}
          </Text>
        </View>

        {customer.governorate && (
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textLight }]}>
              المحافظة:
            </Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {customer.governorate}
            </Text>
          </View>
        )}
      </View>

      {(customer.referred_by_name || customer.first_marketer_name) && (
        <View style={[styles.infoSection, { backgroundColor: colors.surface }]}>
          <Typography
            variant="h3"
            color={colors.text}
            style={[styles.sectionTitle, { borderBottomColor: colors.border }]}
          >
            معلومات الإحالة
          </Typography>

          {customer.referred_by_name && (
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textLight }]}>
                تمت الإضافة بواسطة:
              </Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {customer.referred_by_name}
                {customer.referred_by_phone &&
                  ` (${customer.referred_by_phone})`}
              </Text>
            </View>
          )}

          {customer.first_marketer_name &&
            customer.first_marketer_name !== customer.referred_by_name && (
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.textLight }]}>
                  المسوق الأول:
                </Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {customer.first_marketer_name}
                  {customer.first_marketer_phone &&
                    ` (${customer.first_marketer_phone})`}
                </Text>
              </View>
            )}
        </View>
      )}

      <View style={[styles.infoSection, { backgroundColor: colors.surface }]}>
        <Typography
          variant="h3"
          color={colors.text}
          style={[styles.sectionTitle, { borderBottomColor: colors.border }]}
        >
          الطلبات
        </Typography>

        {!hasOrders && (
          <Text style={[styles.noOrders, { color: colors.textLight }]}>
            لا توجد طلبات لهذا العميل
          </Text>
        )}

        {hasOrders && (
          <View style={styles.ordersList}>
            {customer.orders?.map((order, index) => (
              <View key={order.id || index}>
                {renderOrder({ item: order })}
                {index < (customer.orders?.length || 0) - 1 && (
                  <View
                    style={[
                      styles.orderDivider,
                      { backgroundColor: colors.border },
                    ]}
                  />
                )}
              </View>
            ))}
          </View>
        )}
        {loadingOrders && (
          <View style={styles.loadingOrders}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={[styles.loadingOrdersText, { color: colors.textLight }]}>
              جاري تحميل الطلبات...
            </Text>
          </View>
        )}
      </View>
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
  backButton: {
    paddingVertical: spacing.s,
    marginBottom: spacing.m,
  },
  backButtonInline: {
    marginTop: spacing.l,
    padding: spacing.m,
  },
  backButtonText: {
    fontWeight: "600",
    fontSize: 16,
  },
  headerCard: {
    alignItems: "center",
    padding: spacing.l,
    borderRadius: spacing.m,
    marginBottom: spacing.l,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.m,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: "bold",
  },
  date: {
    marginTop: spacing.xs,
    fontSize: 12,
  },
  applyEmployeeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.m,
    borderRadius: spacing.m,
    marginBottom: spacing.l,
    gap: spacing.s,
  },
  applyEmployeeButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  infoSection: {
    padding: spacing.m,
    borderRadius: spacing.m,
    marginBottom: spacing.m,
  },
  sectionTitle: {
    marginBottom: spacing.m,
    borderBottomWidth: 1,
    paddingBottom: spacing.xs,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: spacing.m,
  },
  infoLabel: {
    flex: 1,
    fontWeight: "600",
  },
  infoValue: {
    flex: 2,
  },
  ordersList: {
    marginTop: spacing.xs,
  },
  orderCard: {
    borderRadius: spacing.s,
    padding: spacing.m,
    marginBottom: spacing.s,
    borderWidth: 1,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderHeaderLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.s,
  },
  orderHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.s,
  },
  orderNumber: {
    fontSize: 14,
    fontWeight: "bold",
  },
  statusBadge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: spacing.xs,
  },
  statusText: {
    fontSize: 10,
  },
  orderTotal: {
    fontSize: 14,
    fontWeight: "bold",
  },
  expandIcon: {
    fontSize: 12,
  },
  orderMeta: {
    marginTop: spacing.xs,
  },
  orderDate: {
    fontSize: 11,
  },
  orderItemsContainer: {
    marginTop: spacing.m,
    paddingTop: spacing.s,
    borderTopWidth: 1,
  },
  itemsTitle: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: spacing.s,
  },
  orderItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.xs,
  },
  productName: {
    fontSize: 13,
    flex: 2,
  },
  orderItemDetails: {
    flexDirection: "row",
    gap: spacing.m,
  },
  quantity: {
    fontSize: 12,
  },
  price: {
    fontSize: 12,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    marginVertical: spacing.xs,
  },
  orderDivider: {
    height: 1,
    marginVertical: spacing.s,
  },
  noItems: {
    fontSize: 12,
    textAlign: "center",
    marginTop: spacing.m,
  },
  noOrders: {
    fontSize: 14,
    textAlign: "center",
    paddingVertical: spacing.l,
  },
  loadingOrders: {
    padding: spacing.l,
    alignItems: "center",
    gap: spacing.s,
  },
  loadingOrdersText: {
    fontSize: 12,
  },
});
