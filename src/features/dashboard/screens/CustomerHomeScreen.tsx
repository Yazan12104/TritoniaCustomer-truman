import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Typography } from "../../../shared/components/Typography";
import { useAuthStore } from "../../auth/store/authStore";
import { useThemeColors } from "../../../shared/theme/colors";
import { spacing } from "../../../shared/theme/spacing";
import { dashboardApi, StatItem } from "../api/dashboardApi";

export const CustomerHomeScreen = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const colors = useThemeColors();
  const [stats, setStats] = useState({
    lastOrders: [] as StatItem[],
    mostSoldProducts: [] as StatItem[],
  });

  const fetchStats = async () => {
    setLoading(true);
    try {
      const [orders, products] = await Promise.all([
        dashboardApi.getCustomerLastOrders(),
        dashboardApi.getCustomerMostSoldProducts(),
      ]);

      setStats({
        lastOrders: orders,
        mostSoldProducts: products,
      });
    } catch (e) {
      console.log("Failed to fetch customer stats", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const formatDateTimePlus3 = (input: unknown) => {
    const date = input instanceof Date ? input : new Date(input as any);
    if (Number.isNaN(date.getTime())) return "غير متوفر";

    const plus3 = new Date(date.getTime() + 3 * 60 * 60 * 1000);
    const pad2 = (n: number) => String(n).padStart(2, "0");

    const yyyy = plus3.getUTCFullYear();
    const mm = pad2(plus3.getUTCMonth() + 1);
    const dd = pad2(plus3.getUTCDate());
    const hour24 = plus3.getUTCHours();
    const ampm = hour24 >= 12 ? "PM" : "AM";
    const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
    const hh = pad2(hour12);
    const min = pad2(plus3.getUTCMinutes());
    const ss = pad2(plus3.getUTCSeconds());

    return `${yyyy}-${mm}-${dd}  ${hh}:${min}:${ss} ${ampm}`;
  };

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
            const isCreatedAtLabel = labelKey === "created_at" || labelKey === "createdAt";
            const isNameLabel = labelKey === "name";
            const labelValue = isCreatedAtLabel
              ? formatDateTimePlus3(item[labelKey])
              : (item[labelKey] || "غير متوفر");
            const displayText = (() => {
              if (isCreatedAtLabel) return `\u200E${index + 1}. ${labelValue}\u200E`;
              if (isNameLabel) {
                const LRI = "\u2066";
                const RLI = "\u2067";
                const PDI = "\u2069";
                const star = index === 0 ? `${LRI}⭐${PDI} ` : "";
                return `${star}${LRI}${index + 1}.${PDI} ${RLI}${labelValue}${PDI}`;
              }
              const star = index === 0 || index ===1 ? "⭐ " : "";
              return `${star}${index + 1}. ${labelValue}`;
            })();

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
                        (isCreatedAtLabel || isNameLabel) && { writingDirection: "ltr", textAlign: "left" },
                      ]}
                      numberOfLines={1}
                    >
                      {displayText}
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
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View
        style={[
          styles.header,
          { backgroundColor: colors.surface, borderBottomColor: colors.border },
        ]}
      >
        <Typography variant="h2" color={colors.primary}>
          الرئيسية
        </Typography>
        <Typography variant="body" color={colors.textLight}>
          مرحباً {user?.name}
        </Typography>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
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
            style={{ marginTop: spacing.xxl }}
          />
        ) : (
          <View style={styles.gridContainer}>
            {renderStatCard(
              "آخر طلباتك",
              stats.lastOrders,
              "created_at",
              "total_sold_price",
              "ل.س",
            )}
            {renderStatCard(
              "أكثر المنتجات طلباً",
              stats.mostSoldProducts,
              "name",
              "total_quantity",
              "قطعة",
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
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
  content: {
    padding: spacing.m,
    paddingBottom: spacing.xxxl,
  },
  gridContainer: {
    flexDirection: "column",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    padding: spacing.m,
    borderRadius: spacing.m,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: spacing.m,
    borderWidth: 1,
    width: "100%",
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
