import React, { useState } from "react";
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
import { useWalletStore } from "../store/walletStore";
import { useAuthStore } from "../../auth/store/authStore";

export const SalaryRequestScreen = ({ navigation }: any) => {
  const { user } = useAuthStore();
  const { summary, createSalaryRequest, isLoading } = useWalletStore();
  const colors = useThemeColors();

  const handleRequest = async () => {
    if (!summary || summary.currentBalance <= 0) {
      Alert.alert("تنبيه", "لا يوجد رصيد متاح للسحب.");
      return;
    }

    try {
      if (user?.id) {
        await createSalaryRequest();
        Alert.alert("نجاح", "تم تقديم طلب السحب بنجاح.", [
          { text: "حسناً", onPress: () => navigation.goBack() },
        ]);
      } else {
        Alert.alert("خطأ", "غير مصرح للقيام بهذه العملية.");
      }
    } catch (err: any) {
      Alert.alert("خطأ", err.message || "فشل في إرسال الطلب.");
    }
  };

  return (
    <ScreenContainer scrollable={true}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={[styles.backButtonText, { color: colors.primary }]}>
          ← رجوع للمحفظة
        </Text>
      </TouchableOpacity>

      <Typography variant="h2" color={colors.primary} style={styles.title}>
        طلب سحب رصيد
      </Typography>

      <View
        style={[
          styles.balanceInfo,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.balanceLabel, { color: colors.textLight }]}>
          الرصيد القابل للسحب:
        </Text>
        <Text style={[styles.balanceValue, { color: colors.primary }]}>
          {summary?.currentBalance.toLocaleString() || "0"} ل.س
        </Text>
      </View>

      <View style={styles.form}>
        <View
          style={[
            styles.infoBox,
            {
              backgroundColor: colors.isDark ? colors.surface : "#fff3cd",
              borderColor: colors.isDark ? colors.border : "#ffeeba",
            },
          ]}
        >
          <Text
            style={[
              styles.infoText,
              { color: colors.isDark ? colors.text : "#856404" },
            ]}
          >
            سيتم تحويل جميع الأرباح المتاحة في الرصيد إلى طلب سحب واحد. لا يمكن
            سحب جزء من الرصيد.
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.submitButton,
            { backgroundColor: colors.primary },
            (isLoading || (summary?.currentBalance || 0) <= 0) &&
              styles.submitButtonDisabled,
          ]}
          onPress={handleRequest}
          disabled={isLoading || (summary?.currentBalance || 0) <= 0}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <Text style={[styles.submitButtonText, { color: colors.background }]}>
              تقديم الطلب لكامل الرصيد
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  backButton: {
    paddingVertical: spacing.s,
    marginBottom: spacing.m,
  },
  backButtonText: {
    fontWeight: "600",
    fontSize: 16,
  },
  title: {
    marginBottom: spacing.l,
  },
  balanceInfo: {
    padding: spacing.l,
    borderRadius: spacing.m,
    borderWidth: 1,
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  balanceLabel: {
    fontSize: 16,
    marginBottom: spacing.xs,
  },
  balanceValue: {
    fontSize: 28,
    fontWeight: "bold",
  },
  form: {
    flex: 1,
  },
  infoBox: {
    padding: spacing.m,
    borderRadius: spacing.s,
    marginBottom: spacing.l,
    borderWidth: 1,
  },
  infoText: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
  },
  submitButton: {
    padding: spacing.m,
    borderRadius: spacing.m,
    alignItems: "center",
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: "bold",
  },
});
