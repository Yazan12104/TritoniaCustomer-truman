import React from "react";
import { View, StyleSheet } from "react-native";
import { Skeleton } from "../../../shared/components/Skeleton";
import { spacing } from "../../../shared/theme/spacing";
import { useThemeColors } from "../../../shared/theme/colors";

export const ProductCardSkeleton = () => {
  const colors = useThemeColors();

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border + "50" }]}>
      <View style={styles.imagePlaceholder}>
        <Skeleton height="100%" borderRadius={0} />
      </View>
      <View style={styles.content}>
        <Skeleton
          width="80%"
          height={14}
          style={{ marginBottom: spacing.xs }}
        />
        <Skeleton
          width="50%"
          height={18}
          style={{ marginBottom: spacing.xs }}
        />
        <Skeleton width="40%" height={12} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: spacing.m,
    overflow: "hidden",
    flex: 1, // Use flex: 1 to match the cardWrapper in the list 
    borderWidth: 1,
    minHeight: 180,
  },
  imagePlaceholder: {
    width: "100%",
    aspectRatio: 1,
  },
  content: {
    padding: spacing.s,
  },
});
