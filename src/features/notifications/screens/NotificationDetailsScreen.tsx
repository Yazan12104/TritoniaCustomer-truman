import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { ScreenContainer } from "../../../shared/components/ScreenContainer";
import { Typography } from "../../../shared/components/Typography";
import { useThemeColors } from "../../../shared/theme/colors";
import { spacing } from "../../../shared/theme/spacing";
import { useNotificationsStore } from "../store/notificationsStore";
import { Notification, NotificationType } from "../types";

const TYPE_CONFIG: Record<
  NotificationType,
  { icon: string; label: string; color: string }
> = {
  SYSTEM: { icon: "🔔", label: "عام", color: "#6b6b6b" },
  ORDER_CREATED: { icon: "🛒", label: "طلب جديد", color: "#1565c0" },
  ORDER_STATUS_UPDATED: {
    icon: "📦",
    label: "تحديث حالة الطلب",
    color: "#00838f",
  },
  SALARY_REQUEST_APPROVED: {
    icon: "✅",
    label: "موافقة على السحب",
    color: "#2e7d32",
  },
  SALARY_REQUEST_REJECTED: {
    icon: "❌",
    label: "رفض طلب السحب",
    color: "#c62828",
  },
  NEW_TEAM_MEMBER: {
    icon: "👤",
    label: "عضو جديد في الفريق",
    color: "#6a1b9a",
  },
};

const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleString("ar-IQ", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const NotificationDetailsScreen = ({ route, navigation }: any) => {
  const { notificationId } = route.params;
  const { notifications, markAsRead } = useNotificationsStore();
  const [notification, setNotification] = useState<Notification | null>(null);
  const colors = useThemeColors();

  useEffect(() => {
    const found = notifications.find((n) => n.id === notificationId);
    if (found) {
      setNotification(found);
      if (!found.isRead) {
        markAsRead(notificationId);
      }
    }
  }, [notificationId, notifications]);

  if (!notification) {
    return (
      <ScreenContainer style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  const defaultConfig = { icon: "🔔", label: "عام", color: "#6b6b6b" };
  const config = (TYPE_CONFIG as any)[notification.type] || defaultConfig;

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
          styles.typeHeader,
          { backgroundColor: (config.color || "#6b6b6b") + "15" },
        ]}
      >
        <Text style={styles.typeIcon}>{config.icon}</Text>
        <Text style={[styles.typeLabel, { color: config.color }]}>
          {config.label}
        </Text>
      </View>

      <Typography variant="h2" color={colors.text} style={styles.title}>
        {notification.title}
      </Typography>

      <Text style={[styles.date, { color: colors.textLight }]}>
        {formatDate(notification.createdAt)}
      </Text>

      <View
        style={[
          styles.bodyCard,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.bodyText, { color: colors.text }]}>
          {notification.body}
        </Text>
      </View>

      {notification.orderId && (
        <View style={[styles.linkRow, { borderBottomColor: colors.border }]}>
          <Text style={[styles.linkValue, { color: colors.primary }]}>
            #{notification.orderId}
          </Text>
          <Text style={[styles.linkLabel, { color: colors.textLight }]}>
            رقم الطلب:
          </Text>
        </View>
      )}
      {notification.salaryRequestId && (
        <View style={[styles.linkRow, { borderBottomColor: colors.border }]}>
          <Text style={[styles.linkValue, { color: colors.primary }]}>
            #{notification.salaryRequestId}
          </Text>
          <Text style={[styles.linkLabel, { color: colors.textLight }]}>
            رقم طلب السحب:
          </Text>
        </View>
      )}
      {notification.employeeId && (
        <View style={[styles.linkRow, { borderBottomColor: colors.border }]}>
          <Text style={[styles.linkValue, { color: colors.primary }]}>
            #{notification.employeeId}
          </Text>
          <Text style={[styles.linkLabel, { color: colors.textLight }]}>
            معرف الموظف:
          </Text>
        </View>
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  center: { justifyContent: "center", alignItems: "center" },
  backButton: { paddingVertical: spacing.s, marginBottom: spacing.m },
  backButtonText: { fontWeight: "600", fontSize: 16 },
  typeHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    padding: spacing.m,
    borderRadius: spacing.m,
    marginBottom: spacing.m,
  },
  typeIcon: { fontSize: 28, marginLeft: spacing.m },
  typeLabel: { fontSize: 15, fontWeight: "700" },
  title: { marginBottom: spacing.xs, textAlign: "right" },
  date: { fontSize: 13, marginBottom: spacing.l, textAlign: "right" },
  bodyCard: {
    borderRadius: spacing.m,
    padding: spacing.m,
    borderWidth: 1,
    marginBottom: spacing.m,
  },
  bodyText: { fontSize: 16, lineHeight: 26, textAlign: "right" },
  linkRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingVertical: spacing.s,
    borderBottomWidth: 1,
  },
  linkLabel: {
    width: 130,
    fontWeight: "700",
    fontSize: 14,
    textAlign: "right",
  },
  linkValue: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    textAlign: "right",
  },
});
