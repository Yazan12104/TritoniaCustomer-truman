import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Text,
  Alert,
} from "react-native";
import { ScreenContainer } from "../../../shared/components/ScreenContainer";
import { Typography } from "../../../shared/components/Typography";
import { useThemeColors } from "../../../shared/theme/colors";
import { spacing } from "../../../shared/theme/spacing";
import { productsApi } from "../api/productsApi";
import { Product } from "../types";
import { ProductImageCarousel } from "../components/ProductImageCarousel";
import { useCartStore } from "../../orders/store/cartStore";
import { useAuthStore } from "../../auth/store/authStore";

export const ProductDetailsScreen = ({ route, navigation }: any) => {
  const { productId } = route.params;
  const { user } = useAuthStore();
  const colors = useThemeColors();

  const [product, setProduct] = useState<Product | null>(null);
  const [images, setImages] = useState<Product["images"]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToCart } = useCartStore();

  const canAddToCart =
    user?.role === "SUPERVISOR" ||
    user?.role === "GENERAL_SUPERVISOR" ||
    user?.role === "MARKETER" ||
    user?.role === "CUSTOMER";

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
          } else if (user?.role === "CUSTOMER") {
            navigation.navigate("CartTab", { screen: "CartScreen" });
          } else {
            navigation.navigate("CartTab");
          }
        },
      },
    ]);
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
        <ProductImageCarousel images={images || []} height={300} />
      </View>

      <View style={styles.detailsContainer}>
        <Typography variant="h1" color={colors.text} style={{ textAlign: "left" }}>
          {product.name}
        </Typography>
        <Typography
          variant="h2"
          color={colors.primary}
          style={[styles.price, { textAlign: "left" }]}
        >
          {product.price.toLocaleString()} ل.س
        </Typography>

        <View style={[styles.infoRow, { justifyContent: "flex-start" }]}>
          <Text style={[styles.infoLabel, { color: colors.textLight } , ]}>
            الحالة:
          </Text>
          
          
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

        </View>

        <View style={[styles.infoRow, { justifyContent: "flex-start" }]}>
          <Text style={[styles.infoLabel, { color: colors.textLight }]}>
            الكمية المتوفرة:
          </Text>
        
         <Text style={[styles.infoValue, { color: colors.text }]}>
            {product.quantity}
          </Text>

        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <Typography
          variant="h3"
          color={colors.text}
          style={[styles.sectionTitle, { textAlign: "left" }]}
        >
          الوصف
        </Typography>
        <Text style={[styles.description, { color: colors.textLight } , {textAlign: "left"}]}>
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
    fontSize: 20,
  },
  imageContainer: {
    width: "100%",
  },
  detailsContainer: {
    flex: 1,
    paddingHorizontal: spacing.l,
    paddingBottom: spacing.l,
    marginTop: spacing.m,
  },
  price: {
    marginVertical: spacing.s,
    fontWeight: "700",
    fontSize: 25,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingVertical: spacing.xs,
    alignItems: "center",
  },
  infoLabel: {
    fontSize: 14,
    marginLeft: spacing.s
  },
  infoValue: {
    fontWeight: "600",
    fontSize: 14,
    marginLeft: spacing.s
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
