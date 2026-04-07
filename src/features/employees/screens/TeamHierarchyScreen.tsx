import React, { useEffect } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { ScreenContainer } from "../../../shared/components/ScreenContainer";
import { Typography } from "../../../shared/components/Typography";
import { useThemeColors } from "../../../shared/theme/colors";
import { spacing } from "../../../shared/theme/spacing";
import { useEmployeesStore } from "../store/employeesStore";
import { EmployeeHierarchy } from "../types";

const ROLE_LABELS: Record<string, string> = {
  GENERAL_SUPERVISOR: "مشرف عام",
  SUPERVISOR: "مشرف",
  MARKETER: "مسوق",
  BRANCH_MANAGER: "مدير فرع",
};

const HierarchyNode = ({
  node,
  level = 0,
  navigation,
}: {
  node: EmployeeHierarchy;
  level?: number;
  navigation: any;
}) => {
  const colors = useThemeColors();

  const ROLE_COLORS: Record<string, string> = {
    GENERAL_SUPERVISOR: colors.primary,
    SUPERVISOR: "#7b5ea7",
    MARKETER: "#388e3c",
    BRANCH_MANAGER: "#e65100",
  };

  return (
    <View style={{ marginRight: level * 20 }}>
      <TouchableOpacity
        style={[
          styles.node,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderRightColor:
              ROLE_COLORS[node.employee.role] || colors.primary,
          },
        ]}
        onPress={() =>
          navigation.navigate("EmployeeDetailsScreen", {
            employeeId: node.employee.id,
          })
        }
        activeOpacity={0.8}
      >
        <View style={styles.nodeContent}>
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor:
                  node.employee.status === "ACTIVE"
                    ? colors.success
                    : colors.error,
              },
            ]}
          />
          <View style={styles.nodeInfo}>
            <Text style={[styles.nodeName, { color: colors.text }]}>
              {node.employee.name}
            </Text>
            <Text style={[styles.nodeRole, { color: colors.textLight }]}>
              {ROLE_LABELS[node.employee.role] || node.employee.role}
            </Text>
          </View>
          <View
            style={[
              styles.nodeAvatar,
              {
                backgroundColor:
                  ROLE_COLORS[node.employee.role] || colors.primary,
              },
            ]}
          >
            <Text style={[styles.nodeAvatarText, { color: colors.background }]}>
              {node.employee.name.charAt(0)}
            </Text>
          </View>
        </View>
        {node.subordinates.length > 0 && (
          <Text style={[styles.subCount, { color: colors.textLight }]}>
            {node.subordinates.length} مرؤوس
          </Text>
        )}
      </TouchableOpacity>
      {node.subordinates.map((sub) => (
        <HierarchyNode
          key={sub.employee.id}
          node={sub}
          level={level + 1}
          navigation={navigation}
        />
      ))}
    </View>
  );
};

export const TeamHierarchyScreen = ({ navigation }: any) => {
  const { hierarchy, isLoading, error, fetchHierarchy } = useEmployeesStore();
  const colors = useThemeColors();

  useEffect(() => {
    fetchHierarchy();
  }, []);

  if (isLoading && hierarchy.length === 0) {
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
          الهيكل التنظيمي
        </Typography>
      </View>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {hierarchy.length === 0 ? (
          <Text style={[styles.emptyText, { color: colors.textLight }]}>
            لا يوجد هيكل تنظيمي حتى الآن.
          </Text>
        ) : (
          hierarchy.map((root) => (
            <HierarchyNode
              key={root.employee.id}
              node={root}
              navigation={navigation}
            />
          ))
        )}
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  center: { justifyContent: "center", alignItems: "center" },
  container: { padding: 0, flex: 1 },
  header: {
    paddingHorizontal: spacing.l,
    paddingTop: spacing.m,
    paddingBottom: spacing.m,
  },
  scroll: { paddingHorizontal: spacing.l, paddingBottom: spacing.xxl },
  node: {
    borderRadius: spacing.m,
    padding: spacing.m,
    marginBottom: spacing.s,
    borderWidth: 1,
    borderRightWidth: 4,
  },
  nodeContent: { flexDirection: "row", alignItems: "center" },
  nodeAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: spacing.m,
  },
  nodeAvatarText: { fontSize: 16, fontWeight: "bold" },
  nodeInfo: { flex: 1 },
  nodeName: { fontSize: 15, fontWeight: "bold", textAlign: "right" },
  nodeRole: { fontSize: 12, marginTop: 2, textAlign: "right" },
  statusDot: { width: 10, height: 10, borderRadius: 5, marginRight: spacing.s },
  subCount: {
    fontSize: 12,
    marginTop: spacing.xs,
    marginRight: 36 + spacing.m,
    textAlign: "right",
  },
  emptyText: { textAlign: "center", marginTop: spacing.xl, fontSize: 16 },
});
