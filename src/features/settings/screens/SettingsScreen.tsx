import React from "react";
import { View, StyleSheet, TouchableOpacity, Text, Switch } from "react-native";
import { ScreenContainer } from "../../../shared/components/ScreenContainer";
import { Typography } from "../../../shared/components/Typography";
import { useAuthStore } from "../../auth/store/authStore";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { useThemeColors } from "../../../shared/theme/colors";
import { spacing, radii } from "../../../shared/theme/spacing";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useThemeStore } from "../../../shared/store/themeStore";

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "مدير النظام",
  BRANCH_MANAGER: "مدير فرع",
  GENERAL_SUPERVISOR: "مشرف عام",
  SUPERVISOR: "مشرف",
  MARKETER: "مسوق",
};

export const SettingsScreen = () => {
  const { logout, user } = useAuthStore();
  const navigation = useNavigation<NavigationProp<any>>();
  const colors = useThemeColors();
  const { isDarkMode, toggleDarkMode } = useThemeStore();

  const initials = (user?.name || "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <ScreenContainer scrollable={true}>
      <View style={styles.container}>
        <Typography variant="h2" style={styles.title}>
          الإعدادات
        </Typography>

        {/* Profile Card */}
        <TouchableOpacity
          style={[
            styles.profileCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
          onPress={() => navigation.navigate("ProfileScreen")}
          activeOpacity={0.8}
        >
          <View style={styles.profileLeft}>
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <Text style={[styles.avatarText, { color: "#ffffff" }]}>
                {initials}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: colors.text }]}>
                {user?.name || "المستخدم"}
              </Text>
              <Text style={[styles.profileRole, { color: colors.primary }]}>
                {ROLE_LABELS[user?.role || ""] || user?.role}
              </Text>
              <Text style={[styles.profilePhone, { color: colors.textLight }]}>
                {user?.phone}
              </Text>
            </View>
          </View>
          <MaterialCommunityIcons
            name="chevron-left"
            size={24}
            color={colors.textLight}
          />
        </TouchableOpacity>

        {/* Section Label */}
        <Text style={[styles.sectionLabel, { color: colors.textLight }]}>
          عام
        </Text>

        <View
          style={[
            styles.section,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          {user?.role === "BRANCH_MANAGER" && (
            <>
              <SettingsRow
                icon="account-plus"
                label="إضافة موظف"
                onPress={() => navigation.navigate("CreateEmployeeScreen")}
              />
              <SettingsRow
                icon="cash-clock"
                label="إدارة طلبات الراتب"
                onPress={() => navigation.navigate("ManageSalaryRequestsScreen")}
              />
            </>
          )}

          {(user?.role === "SUPERVISOR" ||
            user?.role === "GENERAL_SUPERVISOR") && (
            <>
              <SettingsRow
                icon="wallet-outline"
                label="المحفظة المالية"
                onPress={() => navigation.navigate("MyWalletScreen")}
              />
            </>
          )}

          <SettingsRow
            icon="account-circle-outline"
            label="الملف الشخصي"
            onPress={() => navigation.navigate("ProfileScreen")}
          />

          {/* Night Mode Toggle */}
          <View
            style={[styles.row, { borderBottomColor: colors.border + "40" }]}
          >
            <View style={styles.rowLeft}>
              <View
                style={[
                  styles.rowIcon,
                  { backgroundColor: colors.primary + "12" },
                ]}
              >
                <MaterialCommunityIcons
                  name="weather-night"
                  size={20}
                  color={colors.primary}
                />
              </View>
              <Text style={[styles.rowLabel, { color: colors.text }]}>
                الوضع الليلي
              </Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={toggleDarkMode}
              trackColor={{ false: "#767577", true: colors.primary }}
              thumbColor={isDarkMode ? "#f4f3f4" : "#f4f3f4"}
            />
          </View>

          <SettingsRow
            icon="information-outline"
            label="حول التطبيق"
            onPress={() => navigation.navigate("AboutAppScreen")}
          />
        </View>

        {/* Section Label */}
        <Text style={[styles.sectionLabel, { color: colors.textLight }]}>
          الحساب
        </Text>

        <View
          style={[
            styles.section,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <TouchableOpacity
            onPress={logout}
            style={styles.logoutBtn}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name="logout"
              size={20}
              color={colors.error}
            />
            <Text style={[styles.logoutText, { color: colors.error }]}>
              تسجيل الخروج
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenContainer>
  );
};

const SettingsRow = ({
  icon,
  label,
  onPress,
}: {
  icon: string;
  label: string;
  onPress: () => void;
}) => {
  const colors = useThemeColors();
  return (
    <TouchableOpacity
      style={[styles.row, { borderBottomColor: colors.border + "40" }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.rowLeft}>
        <View
          style={[styles.rowIcon, { backgroundColor: colors.primary + "12" }]}
        >
          <MaterialCommunityIcons
            name={icon as any}
            size={20}
            color={colors.primary}
          />
        </View>
        <Text style={[styles.rowLabel, { color: colors.text }]}>{label}</Text>
      </View>
      <MaterialCommunityIcons
        name="chevron-left"
        size={20}
        color={colors.textLight}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: spacing.l },
  title: { marginBottom: spacing.l, textAlign: "right" },

  profileCard: {
    borderRadius: radii.l,
    padding: spacing.m,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.l,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  profileLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.m,
    flex: 1,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 20, fontWeight: "bold" },
  profileInfo: { flex: 1, alignItems: "flex-end" },
  profileName: { fontSize: 16, fontWeight: "700" },
  profileRole: { fontSize: 13, fontWeight: "600", marginTop: 2 },
  profilePhone: { fontSize: 12, marginTop: 2 },

  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    textAlign: "right",
    marginBottom: spacing.s,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  section: {
    borderRadius: radii.l,
    borderWidth: 1,
    marginBottom: spacing.l,
    overflow: "hidden",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.m,
    borderBottomWidth: 1,
  },
  rowLeft: { flexDirection: "row", alignItems: "center", gap: spacing.m },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  rowLabel: { fontSize: 15, fontWeight: "600" },

  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.s,
    paddingVertical: spacing.m,
  },
  logoutText: { fontSize: 15, fontWeight: "700" },
});
