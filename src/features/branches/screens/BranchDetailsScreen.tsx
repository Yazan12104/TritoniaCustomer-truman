import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Switch,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import { ScreenContainer } from "../../../shared/components/ScreenContainer";
import { Typography } from "../../../shared/components/Typography";
import { useThemeColors } from "../../../shared/theme/colors";
import { spacing } from "../../../shared/theme/spacing";
import { branchesApi } from "../api/branchesApi";
import { useBranchesStore } from "../store/branchesStore";
import { Branch } from "../types";

export const BranchDetailsScreen = ({ route, navigation }: any) => {
  const { branchId } = route.params;
  const [branch, setBranch] = useState<Branch | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const colors = useThemeColors();

  const { updateBranchStatus } = useBranchesStore();

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const data = await branchesApi.getBranchById(branchId);
        setBranch(data);
        setIsActive(data.status === "ACTIVE");
      } catch (err: any) {
        setError(err.message || "فشل تحميل تفاصيل الفرع");
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [branchId]);

  const handleCopy = async (text: string) => {
    await Clipboard.setStringAsync(text);
    Alert.alert("نجاح", "تم نسخ الرقم إلى الحافظة.");
  };

  const toggleBranchStatus = async () => {
    if (!branch) return;

    const newStatus = isActive ? "INACTIVE" : "ACTIVE";
    const actionText = newStatus === "ACTIVE" ? "تنشيط" : "تعطيل";

    Alert.alert("تأكيد", `هل أنت متأكد من ${actionText} هذا الفرع؟`, [
      { text: "إلغاء", style: "cancel" },
      {
        text: "تأكيد",
        onPress: async () => {
          setUpdatingStatus(true);
          try {
            await updateBranchStatus(branch.id, newStatus);
            setIsActive(!isActive);
            setBranch({ ...branch, status: newStatus });
            Alert.alert("نجاح", `تم ${actionText} الفرع بنجاح`);
          } catch (error: any) {
            Alert.alert("خطأ", error.message || "فشل تحديث حالة الفرع");
          } finally {
            setUpdatingStatus(false);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <ScreenContainer style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  if (error || !branch) {
    return (
      <ScreenContainer style={styles.center}>
        <Typography variant="body" color={colors.error}>
          {error || "الفرع غير موجود"}
        </Typography>
        <TouchableOpacity
          style={styles.retryBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.retryText, { color: colors.primary }]}>
            العودة للخلف
          </Text>
        </TouchableOpacity>
      </ScreenContainer>
    );
  }

  const managers =
    branch.employees?.filter((e) => e.role === "BRANCH_MANAGER") || [];

  return (
    <ScreenContainer scrollable={true}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={[styles.backButtonText, { color: colors.primary }]}>
          ← فروع المحافظات
        </Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <View
          style={[
            styles.iconCircle,
            { backgroundColor: colors.primary + "10" },
          ]}
        >
          <Text style={styles.mainIcon}>📍</Text>
        </View>
        <Typography variant="h2" color={colors.primary}>
          {branch.name}
        </Typography>
        <Typography variant="caption" color={colors.textLight}>
          ID: {branch.id}
        </Typography>

        <View
          style={[
            styles.statusContainer,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: isActive ? colors.success + "20" : colors.error + "20" },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: isActive ? colors.success : colors.error },
              ]}
            >
              {isActive ? "● نشط" : "○ غير نشط"}
            </Text>
          </View>
          <View style={styles.switchContainer}>
            <Text style={[styles.switchLabel, { color: colors.textLight }]}>
              تغيير الحالة:
            </Text>
            <Switch
              value={isActive}
              onValueChange={toggleBranchStatus}
              disabled={updatingStatus}
              trackColor={{ false: "#767577", true: colors.primary }}
              thumbColor={isActive ? "#f4f3f4" : "#f4f3f4"}
            />
            {updatingStatus && (
              <ActivityIndicator
                size="small"
                color={colors.primary}
                style={styles.switchLoading}
              />
            )}
          </View>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCardBtn}>
          <StatCard
            label="إجمالي الطلبات"
            value={branch.orders_count?.toString() || "0"}
            icon="📦"
          />
        </View>
        <TouchableOpacity
          style={styles.statCardBtn}
          onPress={() =>
            navigation.navigate("BranchEmployeesScreen", {
              branchName: branch.name,
              employees: branch.employees || [],
            })
          }
        >
          <StatCard
            label="الموظفين"
            value={branch.employees?.length.toString() || "0"}
            icon="👥"
          />
          <Text style={[styles.clickHint, { color: colors.primary }]}>
            عرض الكل ←
          </Text>
        </TouchableOpacity>
      </View>

      <Typography variant="h3" color={colors.text} style={styles.sectionTitle}>
        مدراء الفرع
      </Typography>
      {managers.length === 0 ? (
        <View
          style={[
            styles.emptyBox,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.emptyText, { color: colors.textLight }]}>
            لا يوجد مدراء معينين لهذا الفرع حالياً.
          </Text>
        </View>
      ) : (
        managers.map((manager, index) => (
          <View
            key={`${manager.id}-${index}`}
            style={[
              styles.managerCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View
              style={[
                styles.managerAvatar,
                { backgroundColor: colors.primary },
              ]}
            >
              <Text style={[styles.avatarText, { color: colors.background }]}>
                {manager.full_name.charAt(0)}
              </Text>
            </View>
            <View style={styles.managerInfo}>
              <Text style={[styles.managerName, { color: colors.text }]}>
                {manager.full_name}
              </Text>
              <Text style={[styles.managerPhone, { color: colors.textLight }]}>
                {manager.phone}
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.copyBtn,
                { backgroundColor: colors.background, borderColor: colors.border },
              ]}
              onPress={() => handleCopy(manager.phone)}
              activeOpacity={0.7}
            >
              <Text style={styles.copyIcon}>📋</Text>
              <Text style={[styles.copyText, { color: colors.primary }]}>
                نسخ
              </Text>
            </TouchableOpacity>
          </View>
        ))
      )}

      <View style={{ height: spacing.xl }} />
    </ScreenContainer>
  );
};

const StatCard = ({ label, value, icon }: any) => {
  const colors = useThemeColors();
  return (
    <View
      style={[
        styles.statCardInner,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={[styles.statValue, { color: colors.primary }]}>
        {value}
      </Text>
      <Text style={[styles.statLabel, { color: colors.textLight }]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  center: { justifyContent: "center", alignItems: "center" },
  retryBtn: { marginTop: spacing.m, padding: spacing.m },
  retryText: { fontWeight: "700" },
  backButton: { paddingVertical: spacing.s, marginBottom: spacing.m },
  backButtonText: { fontWeight: "600", fontSize: 16 },
  header: { alignItems: "center", marginBottom: spacing.xl },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.m,
  },
  mainIcon: { fontSize: 40 },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginTop: spacing.m,
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
    borderRadius: spacing.m,
    borderWidth: 1,
  },
  statusBadge: {
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: spacing.m,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.s,
  },
  switchLabel: {
    fontSize: 14,
    marginLeft: spacing.s,
  },
  switchLoading: {
    marginLeft: spacing.xs,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.xl,
  },
  statCardBtn: { flex: 1, marginHorizontal: spacing.xs },
  statCardInner: {
    borderRadius: spacing.m,
    padding: spacing.m,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    elevation: 2,
    width: "100%",
    minHeight: 110,
  },
  clickHint: {
    fontSize: 10,
    textAlign: "center",
    marginTop: 4,
    fontWeight: "bold",
  },
  statIcon: { fontSize: 24, marginBottom: 4 },
  statValue: { fontSize: 20, fontWeight: "bold" },
  statLabel: { fontSize: 12, marginTop: 2 },
  sectionTitle: { marginBottom: spacing.m, marginTop: spacing.m, textAlign: "right" },
  managerCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.m,
    borderRadius: spacing.m,
    marginBottom: spacing.s,
    borderWidth: 1,
  },
  managerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: spacing.m,
  },
  avatarText: { fontWeight: "bold", fontSize: 18 },
  managerInfo: { flex: 1 },
  managerName: { fontSize: 16, fontWeight: "700" },
  managerPhone: { fontSize: 14, marginTop: 2 },
  copyBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.s,
    paddingVertical: 6,
    borderRadius: spacing.s,
    borderWidth: 1,
  },
  copyIcon: { fontSize: 14, marginLeft: 4 },
  copyText: { fontSize: 12, fontWeight: "700" },
  emptyBox: {
    padding: spacing.xl,
    alignItems: "center",
    borderRadius: spacing.m,
    borderWidth: 1,
  },
  emptyText: { textAlign: "center" },
});
