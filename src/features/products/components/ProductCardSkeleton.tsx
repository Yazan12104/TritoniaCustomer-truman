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
        <View style={styles.headerRow}>
          <View style={styles.titleContainer}>
            <Skeleton
              width="100%"
              height={16}
              style={{ marginBottom: spacing.xs }}
            />
            <Skeleton
              width="60%"
              height={16}
            />
          </View>
          <Skeleton width={50} height={20} borderRadius={4} />
        </View>
        <Skeleton width="40%" height={20} style={{ marginTop: spacing.m }} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    borderRadius: spacing.xs, // Match sharper corners
    overflow: "hidden",
    flex: 1, 
    borderWidth: 1,
    height: 175, // Scaled up to match ProductCard (~50% more than 117)
    width: "100%",
  },
  imagePlaceholder: {
    width: "33.33%",
  },
  content: {
    flex: 1,
    padding: spacing.m,
    justifyContent: "space-between",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  titleContainer: {
    flex: 1,
    marginRight: spacing.s,
  }
});
