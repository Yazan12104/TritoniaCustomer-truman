import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { Typography } from "../../../shared/components/Typography";
import { useThemeColors } from "../../../shared/theme/colors";
import { spacing } from "../../../shared/theme/spacing";
import { dashboardApi, StatItem } from "../api/dashboardApi";

export const BranchDashboardScreen = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const colors = useThemeColors();
  const [stats, setStats] = useState({
    mostOrderingMarketers: [] as StatItem[],
    mostOrderingCustomers: [] as StatItem[],
  });

  const fetchStats = async () => {
    try {
      const [marketers, customers] = await Promise.all([
        dashboardApi.getBranchMostOrderingMarketers(),
        dashboardApi.getBranchMostOrderingCustomers(),
      ]);

      setStats({
        mostOrderingMarketers: marketers,
        mostOrderingCustomers: customers,
      });
    } catch (e) {
      console.log("Failed to fetch branch stats", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchStats();
  }, []);

  const renderStatCard = (
    title: string,
    data: StatItem[],
    labelKey: string,
    valueKey: string,
    valueSuffix: string = "",
  ) => {
    // Calculate max value for progress bar normalization
    const maxValue =
      data.length > 0
        ? Math.max(...data.map((item) => Number(item[valueKey]) || 0))
        : 0;

    return (
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: colors.isDark ? colors.border + "20" : colors.border,
            shadowColor: colors.text,
          },
        ]}
      >
        <Typography
          variant="h3"
          color={colors.primary}
          style={styles.cardTitle}
        >
          {title}
        </Typography>
        {data.length === 0 ? (
          <Text style={[styles.emptyText, { color: colors.textLight }]}>
            لا توجد بيانات متاحة
          </Text>
        ) : (
          data.map((item, index) => {
            const value = Number(item[valueKey]) || 0;
            const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;

            return (
              <View
                key={index}
                style={[
                  styles.row,
                  {
                    borderBottomColor: colors.isDark
                      ? colors.border + "10"
                      : colors.border + "50",
                  },
                ]}
              >
                {/* Progress Bar Background */}
                <View
                  style={[
                    styles.progressBar,
                    {
                      width: `${percentage}%`,
                      backgroundColor:
                        colors.primary + (colors.isDark ? "15" : "08"),
                    },
                  ]}
                />

                <View style={styles.rowContent}>
                  <View style={styles.labelWrapper}>
                    <Text
                      style={[
                        styles.rowLabel,
                        {
                          color: colors.text,
                          fontWeight: index === 0 ? "bold" : "normal",
                        },
                      ]}
                      numberOfLines={1}
                    >
                      {index === 0 && <Text style={{ fontSize: 13 }}>⭐ </Text>}
                      {index + 1}. {item[labelKey] || "غير متوفر"}
                    </Text>
                  </View>
                  <Text style={[styles.rowValue, { color: colors.primary }]}>
                    {value.toLocaleString()} {valueSuffix}
                  </Text>
                </View>
              </View>
            );
          })
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          { backgroundColor: colors.surface, borderBottomColor: colors.border },
        ]}
      >
        <Typography variant="h2" color={colors.text}>
          لوحة تحكم الفرع
        </Typography>
        <Text style={[styles.subtext, { color: colors.textLight }]}>
          إحصائيات الفرع ونظرة عامة على الطلبات
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {loading ? (
          <ActivityIndicator
            size="large"
            color={colors.primary}
            style={styles.loader}
          />
        ) : (
          <View style={styles.gridContainer}>
            {renderStatCard(
              "المسوقين الأكثر طلباً (في الفرع)",
              stats.mostOrderingMarketers,
              "name",
              "orders_count",
              "طلب",
            )}
            {renderStatCard(
              "العملاء الأكثر طلباً (في الفرع)",
              stats.mostOrderingCustomers,
              "name",
              "orders_count",
              "طلب",
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: spacing.l,
    paddingTop: spacing.xxl,
    borderBottomWidth: 1,
  },
  subtext: {
    marginTop: spacing.xs,
    textAlign: "right",
  },
  scrollContent: {
    padding: spacing.m,
    paddingBottom: spacing.xxxl,
  },
  loader: {
    marginTop: spacing.xxl,
  },
  gridContainer: {
    flexDirection: "column",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    padding: spacing.m,
    borderRadius: spacing.m,
    marginBottom: spacing.m,
    borderWidth: 1,
    width: "100%", // تغيير من 48% إلى 100%
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    overflow: "hidden",
  },
  cardTitle: {
    marginBottom: spacing.m,
    textAlign: "center",
    fontSize: 13,
    fontWeight: "bold",
  },
  row: {
    position: "relative",
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingVertical: spacing.s,
    borderBottomWidth: 1,
    minHeight: 44,
  },
  progressBar: {
    position: "absolute",
    right: 0,
    top: 4,
    bottom: 4,
    borderRadius: 4,
  },
  rowContent: {
    flex: 1,
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 1,
    paddingHorizontal: spacing.xs,
  },
  labelWrapper: {
    flex: 1,
    marginLeft: spacing.s,
  },
  rowLabel: {
    fontSize: 12,
    textAlign: "right",
  },
  rowValue: {
    fontWeight: "bold",
    fontSize: 12,
  },
  emptyText: {
    textAlign: "center",
    paddingVertical: spacing.m,
  },
});
