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

export const TeamDashboardScreen = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const colors = useThemeColors();
  const [stats, setStats] = useState({
    profits: 0,
    lastOrders: [] as StatItem[],
    mostOrderingCustomers: [] as StatItem[],
  });

  const fetchStats = async () => {
    try {
      const [profits, orders, customers] = await Promise.all([
        dashboardApi.getEmployeeProfits(),
        dashboardApi.getEmployeeLastOrders(),
        dashboardApi.getEmployeeMostOrderingCustomers(),
      ]);

      setStats({
        profits:
          typeof profits === "number" ? profits : parseFloat(profits) || 0,
        lastOrders: orders,
        mostOrderingCustomers: customers,
      });
    } catch (e) {
      console.log("Failed to fetch team stats", e);
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
    secondaryLabelKey?: string,
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
                  <View style={styles.labelContainer}>
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
                    {secondaryLabelKey && item[secondaryLabelKey] && (
                      <Text
                        style={[
                          styles.secondaryLabel,
                          { color: colors.textLight },
                        ]}
                      >
                        {item[secondaryLabelKey]}
                      </Text>
                    )}
                  </View>
                  <Text style={[styles.rowValue, { color: colors.primary }]}>
                    {typeof item[valueKey] === "number"
                      ? item[valueKey].toLocaleString()
                      : item[valueKey]}{" "}
                    {valueSuffix}
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
          لوحة تحكم المشرف
        </Typography>
        <Text style={[styles.subtext, { color: colors.textLight }]}>
          إحصائيات مبيعاتك وعمولات الفريق
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
          <>
            <View
              style={[
                styles.profitCard,
                {
                  backgroundColor: colors.isDark
                    ? colors.success + "10"
                    : colors.surface,
                  borderColor: colors.isDark
                    ? colors.success + "30"
                    : colors.success + "40",
                  shadowColor: colors.success,
                },
              ]}
            >
              <View style={styles.profitHeader}>
                <Typography variant="body" color={colors.textLight}>
                  إجمالي الأرباح المشتركة
                </Typography>
                <Text style={{ fontSize: 24 }}>🤝</Text>
              </View>
              <Typography
                variant="h1"
                color={colors.success}
                style={styles.profitAmount}
              >
                {stats.profits.toLocaleString()}{" "}
                <Text style={styles.currencySymbol}>ل.س</Text>
              </Typography>
            </View>

            <View style={styles.gridContainer}>
              {renderStatCard(
                "العملاء الأكثر طلباً",
                stats.mostOrderingCustomers,
                "name",
                "orders_count",
                "طلب",
              )}
              {renderStatCard(
                "آخر الطلبات",
                stats.lastOrders,
                "customer_name",
                "total_sold_price",
                "ل.س",
                "status",
              )}
            </View>
          </>
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
  profitCard: {
    padding: spacing.l,
    borderRadius: spacing.l,
    marginBottom: spacing.m,
    borderWidth: 1,
    alignItems: "center",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  profitHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.s,
    marginBottom: spacing.s,
  },
  profitAmount: {
    fontWeight: "bold",
    fontSize: 28,
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: "normal",
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
  gridContainer: {
    flexDirection: "column",
    flexWrap: "wrap",
    justifyContent: "space-between",
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
    minHeight: 48,
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
  labelContainer: {
    flex: 1,
    alignItems: "flex-end",
    marginLeft: spacing.s,
  },
  rowLabel: {
    fontSize: 12,
    textAlign: "right",
  },
  secondaryLabel: {
    fontSize: 10,
    marginTop: 2,
    textAlign: "right",
    opacity: 0.8,
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
