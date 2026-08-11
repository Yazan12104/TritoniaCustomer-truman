import React, { useEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Text,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { ScreenContainer } from "../../../shared/components/ScreenContainer";
import { Typography } from "../../../shared/components/Typography";
import { useThemeColors } from "../../../shared/theme/colors";
import { spacing } from "../../../shared/theme/spacing";
import { useProductStore } from "../store/productStore";
import { CategoryBadge } from "../components/CategoryBadge";
import { ProductCard } from "../components/ProductCard";
import { useAuthStore } from "../../auth/store/authStore";
import { ProductCardSkeleton } from "../components/ProductCardSkeleton";
import { Skeleton } from "../../../shared/components/Skeleton";
import { useCartStore } from "../../orders/store/cartStore";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export const ProductsListScreen = ({ navigation }: any) => {
  const {
    categories,
    products,
    isLoading,
    isLoadingMore,
    error,
    fetchData,
    activeCategoryId,
    setActiveCategory,
    pagination,
  } = useProductStore();
  const { user } = useAuthStore();
  const { cartItems } = useCartStore();
  const colors = useThemeColors();
  const [refreshing, setRefreshing] = React.useState(false);

  const isAdmin = user?.role === "ADMIN";
  const isSupervisor =
    user?.role === "SUPERVISOR" || user?.role === "GENERAL_SUPERVISOR";

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData(1, false, { force: true });
    setRefreshing(false);
  };

  const handleLoadMore = () => {
    if (!pagination || isLoading || isLoadingMore) return;
    if (pagination.page >= pagination.pages) return;

    fetchData(pagination.page + 1, true);
  };

  const handleSelectCategory = (categoryId: string | null) => {
    setActiveCategory(categoryId);
  };

  if (isLoading && categories.length === 0) {
    return (
      <ScreenContainer scrollable={false} contentContainerStyle={styles.container}>
        <View style={{ paddingHorizontal: spacing.l, paddingTop: spacing.m }}>
          <Skeleton
            width="40%"
            height={30}
            style={{ marginBottom: spacing.l }}
          />
          <View style={{ flexDirection: "row", marginBottom: spacing.m }}>
            {[1, 2, 3, 4].map((i) => (
              <Skeleton
                key={i}
                width={60}
                height={30}
                borderRadius={15}
                style={{ marginRight: spacing.s }}
              />
            ))}
          </View>
          <View style={styles.gridSkeletonContainer}>
            {[1, 2, 3, 4].map((i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </View>
        </View>
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
      <Typography variant="h2" color={colors.primary} style={styles.header}>
        المنتجات
      </Typography>

      <View style={styles.categoriesContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[{ id: null, name: "الكل" }, ...categories]}
          keyExtractor={(item) => item.id || "all"}
          renderItem={({ item }) => (
            <CategoryBadge
              label={item.name}
              isActive={activeCategoryId === item.id}
              onPress={() => handleSelectCategory(item.id)}
            />
          )}
          contentContainerStyle={styles.categoriesList}
        />
      </View>

      {isAdmin && (
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate("ManageProductsScreen")}
          activeOpacity={0.8}
        >
          <Text style={[styles.fabText, { color: "#ffffff" }]}>+</Text>
        </TouchableOpacity>
      )}

      {isSupervisor && (
        <TouchableOpacity
          style={[styles.cartFab, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate("CartScreen")}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons
            name="cart-outline"
            size={26}
            color={"#ffffff"}
          />
          {cartItems.length > 0 && (
            <View style={[styles.badge, { backgroundColor: colors.error, borderColor: colors.background }]}>
              <Text style={[styles.badgeText, { color: "#ffffff" }]}>{cartItems.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      )}

      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        numColumns={1}
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <ProductCard
              product={item}
              onPress={() =>
                navigation.navigate("ProductDetailsScreen", {
                  productId: item.id,
                })
              }
            />
          </View>
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.productList}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.emptyContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Typography variant="body" color={colors.textLight}>
                لا توجد منتجات في هذا القسم.
              </Typography>
            </View>
          )
        }
        ListFooterComponent={
          isLoadingMore ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : null
        }
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { justifyContent: "center", alignItems: "center", flex: 1 },
  header: { paddingHorizontal: spacing.s, marginBottom: spacing.m },
  categoriesContainer: { marginBottom: spacing.m },
  categoriesList: { paddingHorizontal: spacing.s },
  productList: { paddingHorizontal: spacing.s, paddingBottom: spacing.xxl },
  cardWrapper: {
    marginBottom: spacing.m,
  },
  gridSkeletonContainer: {
    gap: spacing.m,
  },
  emptyContainer: { padding: spacing.xl, alignItems: "center" },
  footerLoader: { paddingVertical: spacing.m, alignItems: "center" },
  fab: {
    position: "absolute",
    bottom: spacing.xl,
    right: spacing.l,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    zIndex: 10,
  },
  fabText: { fontSize: 24, fontWeight: "bold" },
  cartFab: {
    position: "absolute",
    bottom: spacing.xl,
    right: spacing.l,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    zIndex: 10,
  },
  badge: {
    position: "absolute",
    top: -5,
    right: -5,
    borderRadius: 12,
    minWidth: 22,
    height: 22,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
    borderWidth: 2,
  },
  badgeText: { fontSize: 10, fontWeight: "bold" },
});
