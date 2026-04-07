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
import { useNotificationsStore } from "../store/notificationsStore";
import { useAuthStore } from "../../auth/store/authStore";
import { Notification, NotificationType } from "../types";

const TYPE_CONFIG: Record<NotificationType, { icon: string; color: string }> = {
  SYSTEM: { icon: "🔔", color: "#6b6b6b" },
  ORDER_CREATED: { icon: "🛒", color: "#1565c0" },
  ORDER_STATUS_UPDATED: { icon: "📦", color: "#00838f" },
  SALARY_REQUEST_APPROVED: { icon: "✅", color: "#2e7d32" },
  SALARY_REQUEST_REJECTED: { icon: "❌", color: "#c62828" },
  NEW_TEAM_MEMBER: { icon: "👤", color: "#6a1b9a" },
};

const timeAgo = (dateStr: string): string => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `منذ ${minutes} دقيقة`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `منذ ${hours} ساعة`;
  const days = Math.floor(hours / 24);
  return `منذ ${days} يوم`;
};

export const NotificationsScreen = ({ navigation }: any) => {
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    fetchNotifications,
    markAllAsRead,
  } = useNotificationsStore();
  const { user } = useAuthStore();
  const colors = useThemeColors();

  useEffect(() => {
    if (user) fetchNotifications(user.id);
  }, [user]);

  const [refreshing, setRefreshing] = React.useState(false);
  const onRefresh = async () => {
    if (!user) return;
    setRefreshing(true);
    await fetchNotifications(user.id);
    setRefreshing(false);
  };

  const handleMarkAllRead = async () => {
    if (user) await markAllAsRead(user.id);
  };

  const renderItem = ({ item }: { item: Notification }) => {
    const defaultConfig = { icon: "🔔", color: "#6b6b6b" };
    const config = (TYPE_CONFIG as any)[item.type] || defaultConfig;
    return (
      <TouchableOpacity
        style={[
          styles.card,
          { backgroundColor: colors.surface, borderColor: colors.border },
          !item.isRead && [styles.cardUnread, { backgroundColor: colors.primary + "10", borderColor: colors.primary + "40" }],
        ]}
        activeOpacity={0.8}
        onPress={() =>
          navigation.navigate("NotificationDetailsScreen", {
            notificationId: item.id,
          })
        }
      >
        <View style={styles.cardContent}>
          <View style={styles.cardTopRow}>
            {!item.isRead && (
              <View
                style={[styles.unreadDot, { backgroundColor: colors.primary }]}
              />
            )}
            <Text
              style={[
                styles.cardTitle,
                { color: colors.text },
                !item.isRead && styles.cardTitleUnread,
              ]}
              numberOfLines={1}
            >
              {item.title}
            </Text>
          </View>
          <Text
            style={[styles.cardBody, { color: colors.textLight }]}
            numberOfLines={2}
          >
            {item.body}
          </Text>
          <Text style={[styles.cardTime, { color: colors.textLight }]}>
            {timeAgo(item.createdAt)}
          </Text>
        </View>
        <View
          style={[
            styles.iconWrapper,
            { backgroundColor: (config.color || "#6b6b6b") + "18" },
          ]}
        >
          <Text style={styles.icon}>{config.icon}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading && notifications.length === 0) {
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
        {unreadCount > 0 && (
          <TouchableOpacity onPress={handleMarkAllRead} activeOpacity={0.7}>
            <Text style={[styles.markAllText, { color: colors.primary }]}>
              تحديد الكل كمقروء
            </Text>
          </TouchableOpacity>
        )}
        <View style={styles.headerRight}>
          {unreadCount > 0 && (
            <View style={[styles.badge, { backgroundColor: colors.error }]}>
              <Text style={[styles.badgeText, { color: colors.background }]}>
                {unreadCount}
              </Text>
            </View>
          )}
          <Typography variant="h2" color={colors.primary}>
            الإشعارات
          </Typography>
        </View>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={[styles.emptyText, { color: colors.textLight }]}>
              لا توجد إشعارات.
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.l,
    paddingTop: spacing.m,
    paddingBottom: spacing.m,
  },
  headerRight: { flexDirection: "row", alignItems: "center" },
  badge: {
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.xs,
    paddingHorizontal: 5,
  },
  badgeText: { fontSize: 12, fontWeight: "bold" },
  markAllText: { fontSize: 13, fontWeight: "600" },
  list: { paddingHorizontal: spacing.l, paddingBottom: spacing.xxl },
  card: {
    flexDirection: "row",
    borderRadius: spacing.m,
    padding: spacing.m,
    marginBottom: spacing.s,
    borderWidth: 1,
  },
  cardUnread: {},
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: spacing.m,
    flexShrink: 0,
  },
  icon: { fontSize: 20 },
  cardContent: { flex: 1 },
  cardTopRow: { flexDirection: "row", alignItems: "center", marginBottom: 2, justifyContent: "flex-end" },
  cardTitle: { flex: 1, fontSize: 15, fontWeight: "500", textAlign: "right" },
  cardTitleUnread: { fontWeight: "bold" },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
  cardBody: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 4,
    textAlign: "right",
  },
  cardTime: { fontSize: 12, textAlign: "right" },
  empty: { padding: spacing.xl, alignItems: "center" },
  emptyText: { fontSize: 16 },
});
