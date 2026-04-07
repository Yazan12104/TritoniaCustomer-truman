import React from "react";
import { Text, StyleSheet } from "react-native";
import { Typography } from "../../../shared/components/Typography";
import { useThemeColors } from "../../../shared/theme/colors";
import { ScreenContainer } from "../../../shared/components/ScreenContainer";
import { spacing } from "../../../shared/theme/spacing";

export const MyCustomersScreen = () => {
  const colors = useThemeColors();

  return (
    <ScreenContainer>
      <Typography variant="h2" color={colors.primary}>
        زبائني
      </Typography>
      <Text style={[styles.description, { color: colors.text }]}>
        إدارة الزبائن المرتبطين بك.
      </Text>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  description: {
    marginTop: spacing.m,
    fontSize: 16,
    textAlign: "right",
  },
});
