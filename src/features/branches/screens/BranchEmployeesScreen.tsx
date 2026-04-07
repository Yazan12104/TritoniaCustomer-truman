import React from "react";
import {
  View,
  StyleSheet,
  Text,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { ScreenContainer } from "../../../shared/components/ScreenContainer";
import { Typography } from "../../../shared/components/Typography";
import { useThemeColors } from "../../../shared/theme/colors";
import { spacing } from "../../../shared/theme/spacing";
import { BranchEmployee } from "../types";

export const BranchEmployeesScreen = ({ route, navigation }: any) => {
  const { branchName, employees } = route.params;
  const colors = useThemeColors();

  const renderEmployee = ({ item: employee }: { item: BranchEmployee }) => (
    <View
      style={[
        styles.employeeCard,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <View
        style={[
          styles.roleBadge,
          getRoleStyle(employee.role, colors),
          { marginRight: spacing.m },
        ]}
      >
        <Text style={[styles.roleText, { color: colors.text }]}>
          {translateRole(employee.role)}
        </Text>
      </View>
      <View style={styles.info}>
        <Text style={[styles.name, { color: colors.text }]}>
          {employee.full_name}
        </Text>
        <Text style={[styles.phone, { color: colors.textLight }]}>
          {employee.phone}
        </Text>
      </View>
      <View style={[styles.avatar, { backgroundColor: colors.border }]}>
        <Text style={[styles.avatarText, { color: colors.textLight }]}>
          {employee.full_name.charAt(0)}
        </Text>
      </View>
    </View>
  );

  return (
    <ScreenContainer scrollable={false}>
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => navigation.goBack()}
      >
        <Text style={[styles.backText, { color: colors.primary }]}>
          ← تفاصيل {branchName}
        </Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <Typography variant="h2" color={colors.primary}>
          قائمة الموظفين
        </Typography>
        <Typography variant="body" color={colors.textLight}>
          إجمالي الموظفين: {employees.length}
        </Typography>
      </View>

      <FlatList
        data={employees}
        renderItem={renderEmployee}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </ScreenContainer>
  );
};

const translateRole = (role: string) => {
  const map: any = {
    ADMIN: "مدير نظام",
    BRANCH_MANAGER: "مدير فرع",
    SUPERVISOR: "مشرف",
    GENERAL_SUPERVISOR: "مشرف عام",
    MARKETER: "مسوق",
  };
  return map[role] || role;
};

const getRoleStyle = (role: string, colors: any) => {
  switch (role) {
    case "BRANCH_MANAGER":
      return { backgroundColor: colors.primary + "30" };
    case "SUPERVISOR":
      return { backgroundColor: colors.primary + "20" };
    case "GENERAL_SUPERVISOR":
      return { backgroundColor: colors.primary + "15" };
    case "MARKETER":
      return { backgroundColor: colors.primary + "10" };
    default:
      return { backgroundColor: colors.border };
  }
};

const styles = StyleSheet.create({
  backBtn: { paddingVertical: spacing.s, marginBottom: spacing.m },
  backText: { fontWeight: "600" },
  header: { marginBottom: spacing.l },
  list: { paddingBottom: spacing.xl },
  employeeCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.m,
    borderRadius: spacing.m,
    marginBottom: spacing.s,
    borderWidth: 1,
  },
  roleBadge: {
    paddingHorizontal: spacing.s,
    paddingVertical: 2,
    borderRadius: spacing.s,
  },
  roleText: { fontSize: 11, fontWeight: "700" },
  info: { flex: 1, marginRight: spacing.m },
  name: { fontSize: 16, fontWeight: "700", textAlign: "right" },
  phone: { fontSize: 13, marginTop: 2, textAlign: "right" },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontWeight: "bold" },
});
