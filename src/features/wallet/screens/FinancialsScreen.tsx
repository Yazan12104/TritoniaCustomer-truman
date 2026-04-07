import React from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { Typography } from "../../../shared/components/Typography";
import { useThemeColors } from "../../../shared/theme/colors";
import { ScreenContainer } from "../../../shared/components/ScreenContainer";
import { spacing } from "../../../shared/theme/spacing";

export const FinancialsScreen = ({ navigation }: any) => {
  const colors = useThemeColors();

  return (
    <ScreenContainer>
      <Typography variant="h1" color={colors.primary} style={styles.title}>
        الإدارة المالية
      </Typography>

      <View style={styles.grid}>
        <TouchableOpacity
          style={[
            styles.menuCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
          onPress={() => navigation.navigate("ManageCommissionsScreen")}
        >
          <View
            style={[
              styles.iconPlaceholder,
              { backgroundColor: colors.primary + "20" },
            ]}
          >
            <Text style={[styles.iconText, { color: colors.primary }]}>%</Text>
          </View>
          <Typography variant="h3">إعدادات العمولات</Typography>
          <Typography
            variant="body"
            color={colors.textLight}
            style={styles.cardDesc}
          >
            ضبط نسب الأرباح للمنتجات والشركة.
          </Typography>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.menuCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
          onPress={() => navigation.navigate("ManageSalaryRequestsScreen")}
        >
          <View
            style={[
              styles.iconPlaceholder,
              { backgroundColor: colors.primary + "20" },
            ]}
          >
            <Text style={[styles.iconText, { color: colors.primary }]}>SYP</Text>
          </View>
          <Typography variant="h3">طلبات الرواتب</Typography>
          <Typography
            variant="body"
            color={colors.textLight}
            style={styles.cardDesc}
          >
            مراجعة وصرف المستحقات.
          </Typography>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  title: {
    marginBottom: spacing.l,
    paddingHorizontal: spacing.m,
  },
  grid: {
    padding: spacing.m,
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: spacing.m,
  },
  menuCard: {
    width: "47%",
    borderRadius: spacing.m,
    padding: spacing.m,
    borderWidth: 1,
    alignItems: "center",
    elevation: 2,
  },
  iconPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.s,
  },
  iconText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  cardDesc: {
    textAlign: "center",
    fontSize: 12,
    marginTop: 4,
  },
});
