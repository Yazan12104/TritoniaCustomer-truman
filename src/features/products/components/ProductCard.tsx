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
import { spacing, radii } from "../../../shared/theme/spacing";

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
      <Image
        source={{
          uri:
            primaryImage || "https://via.placeholder.com/300x300?text=No+Image",
        }}
        style={[styles.image, { backgroundColor: colors.border }]}
        resizeMode="cover"
      />

      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {product.name}
        </Text>

        <Text style={[styles.price, { color: colors.primary }]}>${product.price.toFixed(2)}</Text>

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
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: spacing.m,
    overflow: "hidden",
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
  },
  image: {
    width: "100%",
    aspectRatio: 1, // نسبة عرض لارتفاع ثابتة لضمان التناسق
  },
  content: {
    padding: spacing.s,
  },
  title: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: spacing.xs,
  },
  price: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: spacing.xs,
  },
  availability: {
    marginTop: spacing.xs,
  },
  availabilityText: {
    fontSize: 11,
    fontWeight: "600",
  },
});
