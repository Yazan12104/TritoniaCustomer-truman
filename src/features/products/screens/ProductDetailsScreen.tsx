import React, { useEffect, useState, useRef } from "react";
import {
  View,
  StyleSheet,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Text,
  Alert,
  FlatList,
  Dimensions,
} from "react-native";
import { ScreenContainer } from "../../../shared/components/ScreenContainer";
import { Typography } from "../../../shared/components/Typography";
import { useThemeColors } from "../../../shared/theme/colors";
import { spacing } from "../../../shared/theme/spacing";
import { productsApi } from "../api/productsApi";
import { Product, ProductImage } from "../types";
import { useCartStore } from "../../orders/store/cartStore";
import { useAuthStore } from "../../auth/store/authStore";

const { width } = Dimensions.get("window");

export const ProductDetailsScreen = ({ route, navigation }: any) => {
  const { productId } = route.params;
  const { user } = useAuthStore();
  const colors = useThemeColors();

  const [product, setProduct] = useState<Product | null>(null);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const flatListRef = useRef<FlatList>(null);
  const { addToCart } = useCartStore();

  const canAddToCart =
    user?.role === "SUPERVISOR" ||
    user?.role === "GENERAL_SUPERVISOR" ||
    user?.role === "MARKETER";

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const data = await productsApi.getProductDetails(productId);
        setProduct(data);
        setImages(data.images || []);
      } catch (err: any) {
        setError(err.message || "فشل تحميل التفاصيل");
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [productId]);

  const handleAddToCart = () => {
    if (!product || !canAddToCart) return;
    addToCart(product);
    Alert.alert("تمت الإضافة للسلة", `تمت إضافة ${product.name} إلى السلة بنجاح.`, [
      { text: "متابعة التسوق" },
      {
        text: "عرض السلة",
        onPress: () => {
          if (
            user?.role === "SUPERVISOR" ||
            user?.role === "GENERAL_SUPERVISOR"
          ) {
            navigation.navigate("StoreTab", { screen: "CartScreen" });
          } else {
            navigation.navigate("CartTab");
          }
        },
      },
    ]);
  };

  const renderImageItem = ({ item }: { item: ProductImage }) => (
    <View style={styles.imageSlide}>
      <Image
        source={{
          uri:
            item.image_url ||
            "https://via.placeholder.com/600x400?text=No+Image",
        }}
        style={styles.fullImage}
        resizeMode="cover"
      />
    </View>
  );

  const renderImageIndicator = () => {
    if (images.length <= 1) return null;
    return (
      <View style={styles.indicatorContainer}>
        {images.map((_, index) => (
          <View
            key={index}
            style={[
              styles.indicatorDot,
              { backgroundColor: colors.background + "80" },
              activeImageIndex === index && [
                styles.indicatorDotActive,
                { backgroundColor: colors.primary },
              ],
            ]}
          />
        ))}
      </View>
    );
  };

  const onScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / width);
    const safeIndex = Math.max(0, Math.min(index, images.length - 1));
    if (safeIndex !== activeImageIndex) {
      setActiveImageIndex(safeIndex);
    }
  };

  const onMomentumScrollEnd = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / width);
    const safeIndex = Math.max(0, Math.min(index, images.length - 1));

    if (safeIndex !== activeImageIndex) {
      setActiveImageIndex(safeIndex);
    }

    const expectedOffset = safeIndex * width;
    if (Math.abs(offsetX - expectedOffset) > 1) {
      flatListRef.current?.scrollToOffset({
        offset: expectedOffset,
        animated: true,
      });
    }
  };

  const scrollToImage = (index: number) => {
    if (index >= 0 && index < images.length) {
      flatListRef.current?.scrollToOffset({
        offset: index * width,
        animated: true,
      });
      setActiveImageIndex(index);
    }
  };

  if (loading) {
    return (
      <ScreenContainer style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  if (error || !product) {
    return (
      <ScreenContainer style={styles.center}>
        <Typography variant="body" color={colors.error}>
          {error || "المنتج غير موجود"}
        </Typography>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={[styles.backButtonText, { color: colors.primary }]}>
          ← رجوع
        </Text>
      </TouchableOpacity>

      <View style={styles.imageContainer}>
        {images.length > 0 ? (
          <>
            <FlatList
              ref={flatListRef}
              data={images}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              renderItem={renderImageItem}
              keyExtractor={(item, index) => `${item.id}-${index}`}
              onScroll={onScroll}
              onMomentumScrollEnd={onMomentumScrollEnd}
              scrollEventThrottle={16}
              style={styles.imageList}
              initialNumToRender={3}
              maxToRenderPerBatch={3}
              windowSize={5}
              removeClippedSubviews={true}
            />
            {renderImageIndicator()}

            <View style={styles.imageCounter}>
              <Text
                style={[styles.imageCounterText, { color: colors.background }]}
              >
                {activeImageIndex + 1} / {images.length}
              </Text>
            </View>

            {images.length > 1 && (
              <>
                <TouchableOpacity
                  style={[styles.navButton, styles.prevButton]}
                  onPress={() => scrollToImage(activeImageIndex + 1)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.navButtonText, { color: colors.background }]}>‹</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.navButton, styles.nextButton]}
                  onPress={() => scrollToImage(activeImageIndex - 1)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.navButtonText, { color: colors.background }]}>›</Text>
                </TouchableOpacity>
              </>
            )}
          </>
        ) : (
          <View
            style={[styles.noImageContainer, { backgroundColor: colors.border }]}
          >
            <Image
              source={{
                uri: "https://via.placeholder.com/600x400?text=No+Image",
              }}
              style={styles.fullImage}
              resizeMode="cover"
            />
            <Text style={[styles.noImageText, { color: colors.textLight }]}>
              لا توجد صور
            </Text>
          </View>
        )}
      </View>

      <View style={styles.detailsContainer}>
        <Typography variant="h1" color={colors.text} style={{ textAlign: "right" }}>
          {product.name}
        </Typography>
        <Typography
          variant="h2"
          color={colors.primary}
          style={[styles.price, { textAlign: "right" }]}
        >
          {product.price.toLocaleString()} ل.س
        </Typography>

        <View style={styles.infoRow}>
          <Text
            style={[
              styles.infoValue,
              product.in_stock
                ? { color: colors.success }
                : { color: colors.error },
            ]}
          >
            {product.in_stock ? "متوفر" : "غير متوفر"}
          </Text>
          <Text style={[styles.infoLabel, { color: colors.textLight }]}>
            الحالة:
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={[styles.infoValue, { color: colors.text }]}>
            {product.quantity}
          </Text>
          <Text style={[styles.infoLabel, { color: colors.textLight }]}>
            الكمية المتوفرة:
          </Text>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <Typography
          variant="h3"
          color={colors.text}
          style={[styles.sectionTitle, { textAlign: "right" }]}
        >
          الوصف
        </Typography>
        <Text style={[styles.description, { color: colors.textLight }]}>
          {product.description || "لا يوجد وصف لهذا المنتج"}
        </Text>
      </View>

      {canAddToCart && (
        <View
          style={[styles.actionContainer, { borderTopColor: colors.border }]}
        >
          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: colors.primary },
              !product.in_stock && { backgroundColor: colors.border },
            ]}
            onPress={handleAddToCart}
            activeOpacity={0.8}
            disabled={!product.in_stock}
          >
            <Text
              style={[styles.actionButtonText, { color: colors.background }]}
            >
              {product.in_stock ? "أضف إلى السلة" : "غير متوفر"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  center: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  backButton: {
    paddingVertical: spacing.s,
    marginBottom: spacing.m,
    paddingHorizontal: spacing.l,
    alignItems: "flex-end",
  },
  backButtonText: {
    fontWeight: "600",
    fontSize: 16,
  },
  imageContainer: {
    position: "relative",
    height: 300,
    width: "100%",
  },
  imageList: {
    flex: 1,
  },
  imageSlide: {
    width: width,
    height: 300,
  },
  fullImage: {
    width: "100%",
    height: "100%",
  },
  noImageContainer: {
    width: "100%",
    height: 300,
    justifyContent: "center",
    alignItems: "center",
  },
  noImageText: {
    position: "absolute",
    fontSize: 14,
  },
  indicatorContainer: {
    position: "absolute",
    bottom: spacing.m,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  indicatorDotActive: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  imageCounter: {
    position: "absolute",
    top: spacing.m,
    left: spacing.m,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xs,
    borderRadius: spacing.s,
  },
  imageCounterText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  navButton: {
    position: "absolute",
    top: "50%",
    transform: [{ translateY: -20 }],
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  prevButton: {
    right: spacing.m,
  },
  nextButton: {
    left: spacing.m,
  },
  navButtonText: {
    fontSize: 28,
    fontWeight: "bold",
    lineHeight: 32,
  },
  detailsContainer: {
    flex: 1,
    paddingHorizontal: spacing.l,
    paddingBottom: spacing.l,
    marginTop: spacing.m,
  },
  price: {
    marginVertical: spacing.s,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingVertical: spacing.xs,
    alignItems: "center"
  },
  infoLabel: {
    fontSize: 14,
    marginLeft: spacing.s
  },
  infoValue: {
    fontWeight: "600",
    fontSize: 14,
  },
  divider: {
    height: 1,
    marginVertical: spacing.m,
  },
  sectionTitle: {
    marginBottom: spacing.s,
  },
  description: {
    lineHeight: 22,
    fontSize: 16,
    textAlign: "right"
  },
  actionContainer: {
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
    borderTopWidth: 1,
  },
  actionButton: {
    padding: spacing.m,
    borderRadius: spacing.m,
    alignItems: "center",
  },
  actionButtonText: {
    fontWeight: "bold",
    fontSize: 16,
  },
});