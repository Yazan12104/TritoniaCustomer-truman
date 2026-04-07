import React from "react";
import { Text, StyleSheet } from "react-native";
import { Typography } from "../../../shared/components/Typography";
import { useThemeColors } from "../../../shared/theme/colors";
import { ScreenContainer } from "../../../shared/components/ScreenContainer";
import { spacing } from "../../../shared/theme/spacing";

export const CatalogBrowserScreen = () => {
  const colors = useThemeColors();

  return (
    <ScreenContainer>
      <Typography variant="h2" color={colors.primary}>
        كتالوج المنتجات
      </Typography>
      <Text style={[styles.description, { color: colors.text }]}>
        تصفح المنتجات وأضفها إلى السلة.
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
