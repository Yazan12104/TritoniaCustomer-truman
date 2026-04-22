import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from "react-native";
import { Product } from "../types";
import { useThemeColors } from "../../../shared/theme/colors";
import { spacing } from "../../../shared/theme/spacing";
import { Typography } from "../../../shared/components/Typography";

interface ProductCardProps {
  product: Product;
  onPress: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onPress,
}) => {
  const colors = useThemeColors();
  const primaryImage =
    product.images?.find((img) => img.sort_order === 0)?.image_url ||
    product.images?.[0]?.image_url;

  return (
    <TouchableOpacity 
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border + "50" }]} 
      onPress={onPress} 
      activeOpacity={0.9}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{
            uri:
              primaryImage || "https://via.placeholder.com/300x300?text=No+Image",
          }}
          style={styles.image}
          resizeMode="contain"
        />
      </View>

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Typography variant="h3" color={colors.text} style={styles.title} numberOfLines={2}>
            {product.name}
          </Typography>
          <View style={styles.availability}>
            <Text
              style={[
                styles.availabilityText,
                product.in_stock ? { color: colors.success } : { color: colors.error },
              ]}
            >
              {product.in_stock ? "متوفر" : "غير متوفر"}
            </Text>
          </View>
        </View>

        <Text style={[styles.price, { color: colors.primary }]}>S.P {product.price.toFixed(2)}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    borderRadius: spacing.xs, // sharper corners
    overflow: "hidden",
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    height: 175, // Scaled up ~50% from 117
    direction: "rtl",
  },
  imageContainer: {
    width: "43.33%",
    padding: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#bbb", // Often white background helps product images pop
    overflow: "hidden", // Ensure zoomed image doesn't bleed
  },
  image: {
    width: "117%", // Zoom in a bit to fill the extra height
    height: "190%", // Keep ratio, zoom in
  },
  content: {
    flex: 1,
    padding: spacing.m,
    justifyContent: "space-between",
    direction: "rtl",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.xs,
  },
  title: {
    flex: 1,
    fontWeight: "bold",
    marginRight: spacing.s,
    textAlign: "left",
  },
  price: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: spacing.s,
    textAlign: "left",
  },
  availability: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  availabilityText: {
    fontSize: 12,
    fontWeight: "bold",
  },
});
