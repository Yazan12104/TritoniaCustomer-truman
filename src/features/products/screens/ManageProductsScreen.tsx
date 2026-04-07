import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Text,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Image,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { RefreshControl } from "react-native";
import { Typography } from "../../../shared/components/Typography";
import { useThemeColors } from "../../../shared/theme/colors";
import { spacing, radii } from "../../../shared/theme/spacing";
import { useProductStore } from "../store/productStore";
import { productsApi } from "../api/productsApi";
import { Product, Category, ProductImage } from "../types";

type TabType = "products" | "categories";

const MAX_IMAGES = 5;

export const ManageProductsScreen = ({ navigation }: any) => {
  const { products, categories, fetchData, isLoading } = useProductStore();
  const [activeTab, setActiveTab] = useState<TabType>("products");
  const colors = useThemeColors();

  const [productModalVisible, setProductModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    quantity: "",
    category_id: "",
  });

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productImages, setProductImages] = useState<ProductImage[]>([]);
  const [imagesModalVisible, setImagesModalVisible] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [hasOrderChanged, setHasOrderChanged] = useState(false);

  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchData();
    if (Platform.OS !== "web") {
      ImagePicker.requestMediaLibraryPermissionsAsync();
      ImagePicker.requestCameraPermissionsAsync();
    }
  }, []);

  const openImagesModal = async (product: Product) => {
    setSelectedProduct(product);
    setProductImages([]);
    setHasOrderChanged(false);
    setImagesModalVisible(true);

    try {
      const images = await productsApi.getProductImages(product.id);
      const uniqueImages = images.filter(
        (img, index, self) => index === self.findIndex((t) => t.id === img.id)
      );
      setProductImages(uniqueImages);
    } catch (err) {
      console.error("Failed to load images:", err);
    }
  };

  const pickImage = async () => {
    if (productImages.length >= MAX_IMAGES) {
      Alert.alert("تنبيه", `لا يمكن إضافة أكثر من ${MAX_IMAGES} صور للمنتج`);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      uploadImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    if (productImages.length >= MAX_IMAGES) {
      Alert.alert("تنبيه", `لا يمكن إضافة أكثر من ${MAX_IMAGES} صور للمنتج`);
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      uploadImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri: string) => {
    if (!selectedProduct) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("image", {
        uri: uri,
        name: `product_${selectedProduct.id}_${Date.now()}.jpg`,
        type: "image/jpeg",
      } as any);

      const newImage = await productsApi.uploadProductImage(
        selectedProduct.id,
        formData
      );
      setProductImages([...productImages, newImage]);
      Alert.alert("نجاح", "تم رفع الصورة بنجاح");
    } catch (err: any) {
      Alert.alert("خطأ", err.message || "فشل في رفع الصورة");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDeleteImage = (image: ProductImage) => {
    Alert.alert("تأكيد الحذف", "هل أنت متأكد من حذف هذه الصورة؟", [
      { text: "إلغاء", style: "cancel" },
      {
        text: "حذف",
        style: "destructive",
        onPress: async () => {
          try {
            await productsApi.deleteProductImage(image.id);
            setProductImages(
              productImages.filter((img) => img.id !== image.id)
            );
            Alert.alert("نجاح", "تم حذف الصورة بنجاح");
          } catch (err: any) {
            Alert.alert("خطأ", err.message || "فشل في حذف الصورة");
          }
        },
      },
    ]);
  };

  const handleReorderImage = (image: ProductImage, newOrder: number) => {
    if (newOrder < 0 || newOrder >= productImages.length) return;

    const newImages = [...productImages];
    const oldIndex = newImages.findIndex((img) => img.id === image.id);
    if (oldIndex !== -1) {
      const [moved] = newImages.splice(oldIndex, 1);
      newImages.splice(newOrder, 0, moved);

      const updatedImages = newImages.map((img, idx) => ({
        ...img,
        sort_order: idx,
      }));

      setProductImages(updatedImages);
      setHasOrderChanged(true);
    }
  };

  const handleSaveOrder = async () => {
    if (!selectedProduct) return;

    setSubmitting(true);
    try {
      const imageIds = productImages.map((img) => img.id);
      await productsApi.reorderImages(imageIds);
      setHasOrderChanged(false);
      Alert.alert("نجاح", "تمت مزامنة ترتيب الصور بنجاح");
      fetchData();
    } catch (err: any) {
      Alert.alert("خطأ", err.message || "فشل في حفظ الترتيب الجديد");
    } finally {
      setSubmitting(false);
    }
  };

  const renderImageItem = ({
    item,
    index,
  }: {
    item: ProductImage;
    index: number;
  }) => (
    <View
      style={[
        styles.imageItem,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <Image source={{ uri: item.image_url }} style={styles.imagePreview} />
      <View style={styles.imageActions}>
        <View style={styles.orderButtons}>
          <TouchableOpacity
            style={[
              styles.orderButton,
              { backgroundColor: colors.background, borderColor: colors.border },
              index === 0 && [
                styles.orderButtonDisabled,
                { opacity: 0.5 },
              ],
            ]}
            onPress={() => handleReorderImage(item, index - 1)}
            disabled={index === 0}
          >
            <Text style={[styles.orderButtonText, { color: colors.primary }]}>
              ↑
            </Text>
          </TouchableOpacity>
          <Text style={[styles.orderText, { color: colors.text }]}>
            {index + 1}
          </Text>
          <TouchableOpacity
            style={[
              styles.orderButton,
              { backgroundColor: colors.background, borderColor: colors.border },
              index === productImages.length - 1 && [
                styles.orderButtonDisabled,
                { opacity: 0.5 },
              ],
            ]}
            onPress={() => handleReorderImage(item, index + 1)}
            disabled={index === productImages.length - 1}
          >
            <Text style={[styles.orderButtonText, { color: colors.primary }]}>
              ↓
            </Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={[styles.deleteImageButton, { backgroundColor: colors.error }]}
          onPress={() => handleDeleteImage(item)}
        >
          <Text
            style={[
              styles.deleteImageButtonText,
              { color: colors.background },
            ]}
          >
            حذف
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const resetCategoryForm = () => {
    setCategoryName("");
    setEditingCategory(null);
  };

  const openAddCategoryModal = () => {
    resetCategoryForm();
    setCategoryModalVisible(true);
  };

  const openEditCategoryModal = (category: Category) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setCategoryModalVisible(true);
  };

  const handleCategorySubmit = async () => {
    if (!categoryName.trim()) {
      Alert.alert("تنبيه", "الرجاء إدخال اسم القسم");
      return;
    }

    setSubmitting(true);
    try {
      if (editingCategory) {
        await productsApi.updateCategory(
          editingCategory.id,
          categoryName.trim()
        );
        Alert.alert("نجاح", "تم تحديث القسم بنجاح");
      } else {
        await productsApi.createCategory(categoryName.trim());
        Alert.alert("نجاح", "تم إضافة القسم بنجاح");
      }

      setCategoryModalVisible(false);
      resetCategoryForm();
      fetchData();
    } catch (err: any) {
      Alert.alert("خطأ", err.message || "فشل في حفظ القسم");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCategory = (category: Category) => {
    Alert.alert(
      "تأكيد الحذف",
      `هل أنت متأكد من حذف القسم "${category.name}"؟\nملاحظة: المنتجات المرتبطة بهذا القسم ستتأثر.`,
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "حذف",
          style: "destructive",
          onPress: async () => {
            try {
              await productsApi.deleteCategory(category.id);
              Alert.alert("نجاح", "تم حذف القسم بنجاح");
              fetchData();
            } catch (err: any) {
              Alert.alert("خطأ", err.message || "فشل في حذف القسم");
            }
          },
        },
      ]
    );
  };

  const renderCategoryItem = ({ item }: { item: Category }) => (
    <View
      style={[
        styles.productItem,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <View style={styles.productActions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
          onPress={() => openEditCategoryModal(item)}
        >
          <Text style={[styles.actionButtonText, { color: colors.background }]}>
            تعديل
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.error }]}
          onPress={() => handleDeleteCategory(item)}
        >
          <Text style={[styles.actionButtonText, { color: colors.background }]}>
            حذف
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.productInfo}>
        <Text
          style={[styles.productName, { color: colors.text, textAlign: "right" }]}
        >
          {item.name}
        </Text>
      </View>
    </View>
  );

  const resetProductForm = () => {
    setProductForm({
      name: "",
      description: "",
      price: "",
      quantity: "",
      category_id: "",
    });
    setEditingProduct(null);
  };

  const openAddProductModal = () => {
    resetProductForm();
    setProductModalVisible(true);
  };

  const openEditProductModal = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description || "",
      price: product.price.toString(),
      quantity: product.quantity.toString(),
      category_id: product.category_id,
    });
    setProductModalVisible(true);
  };

  const handleProductSubmit = async () => {
    if (!productForm.name.trim()) {
      Alert.alert("تنبيه", "الرجاء إدخال اسم المنتج");
      return;
    }
    if (!productForm.price || Number(productForm.price) <= 0) {
      Alert.alert("تنبيه", "الرجاء إدخال سعر صحيح");
      return;
    }
    if (!productForm.category_id) {
      Alert.alert("تنبيه", "الرجاء اختيار قسم");
      return;
    }

    setSubmitting(true);
    try {
      const data = {
        name: productForm.name.trim(),
        description: productForm.description.trim(),
        price: Number(productForm.price),
        quantity: Number(productForm.quantity) || 0,
        category_id: productForm.category_id,
      };

      if (editingProduct) {
        await productsApi.updateProduct(editingProduct.id, data);
        Alert.alert("نجاح", "تم تحديث المنتج بنجاح");
      } else {
        await productsApi.createProduct(data);
        Alert.alert("نجاح", "تم إضافة المنتج بنجاح");
      }

      setProductModalVisible(false);
      resetProductForm();
      fetchData();
    } catch (err: any) {
      Alert.alert("خطأ", err.message || "فشل في حفظ المنتج");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = (product: Product) => {
    Alert.alert("تأكيد الحذف", `هل أنت متأكد من حذف المنتج "${product.name}"؟`, [
      { text: "إلغاء", style: "cancel" },
      {
        text: "حذف",
        style: "destructive",
        onPress: async () => {
          try {
            await productsApi.deleteProduct(product.id);
            Alert.alert("نجاح", "تم حذف المنتج بنجاح");
            fetchData();
          } catch (err: any) {
            Alert.alert("خطأ", err.message || "فشل في حذف المنتج");
          }
        },
      },
    ]);
  };

  const renderProductItem = ({ item }: { item: Product }) => {
    const imageCount = item.image_count || item.images?.length || 0;
    return (
      <View
        style={[
          styles.productItem,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <View style={styles.productActions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.info || colors.primary }]}
            onPress={() => openImagesModal(item)}
          >
            <Text
              style={[styles.actionButtonText, { color: colors.background }]}
            >
              صور
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={() => openEditProductModal(item)}
          >
            <Text
              style={[styles.actionButtonText, { color: colors.background }]}
            >
              تعديل
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.error }]}
            onPress={() => handleDeleteProduct(item)}
          >
            <Text
              style={[styles.actionButtonText, { color: colors.background }]}
            >
              حذف
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.productInfo}>
          <Text
            style={[
              styles.productName,
              { color: colors.text, textAlign: "right" },
            ]}
          >
            {item.name}
          </Text>
          <Text
            style={[
              styles.productPrice,
              { color: colors.primary, textAlign: "right" },
            ]}
          >
            {item.price.toLocaleString()} ل.س
          </Text>
          <Text
            style={[
              styles.productQuantity,
              { color: colors.textLight, textAlign: "right" },
            ]}
          >
            الكمية: {item.quantity}
          </Text>
          <Text
            style={[
              styles.productCategory,
              { color: colors.textLight, textAlign: "right" },
            ]}
          >
            القسم:{" "}
            {categories.find((c) => c.id === item.category_id)?.name ||
              "غير محدد"}
          </Text>
          <Text
            style={[
              styles.productImagesCount,
              { color: colors.textLight, textAlign: "right" },
            ]}
          >
            📷 {imageCount} / {MAX_IMAGES} صور
          </Text>
        </View>
      </View>
    );
  };

  const ProductList = () => (
    <FlatList
      data={products}
      keyExtractor={(item) => item.id}
      renderItem={renderProductItem}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.textLight }]}>
            لا توجد منتجات
          </Text>
          <Text style={[styles.emptySubText, { color: colors.textLight }]}>
            اضغط على زر الإضافة لإنشاء منتج جديد
          </Text>
        </View>
      }
    />
  );

  const CategoryList = () => (
    <FlatList
      data={categories}
      keyExtractor={(item) => item.id}
      renderItem={renderCategoryItem}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.textLight }]}>
            لا توجد أقسام
          </Text>
          <Text style={[styles.emptySubText, { color: colors.textLight }]}>
            اضغط على زر الإضافة لإنشاء قسم جديد
          </Text>
        </View>
      }
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[
              styles.tab,
              { borderColor: colors.border },
              activeTab === "products" && [
                styles.activeTab,
                { borderBottomColor: colors.primary },
              ],
            ]}
            onPress={() => setActiveTab("products")}
          >
            <Text
              style={[
                styles.tabText,
                { color: colors.textLight },
                activeTab === "products" && [
                  styles.activeTabText,
                  { color: colors.primary },
                ],
              ]}
            >
              المنتجات
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              { borderColor: colors.border },
              activeTab === "categories" && [
                styles.activeTab,
                { borderBottomColor: colors.primary },
              ],
            ]}
            onPress={() => setActiveTab("categories")}
          >
            <Text
              style={[
                styles.tabText,
                { color: colors.textLight },
                activeTab === "categories" && [
                  styles.activeTabText,
                  { color: colors.primary },
                ],
              ]}
            >
              الأقسام
            </Text>
          </TouchableOpacity>
        </View>
        <Typography variant="h2" color={colors.primary}>
          إدارة النظام
        </Typography>
      </View>

      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: colors.primary }]}
        onPress={
          activeTab === "products" ? openAddProductModal : openAddCategoryModal
        }
      >
        <Text style={[styles.addButtonText, { color: colors.background }]}>
          + {activeTab === "products" ? "إضافة منتج" : "إضافة قسم"}
        </Text>
      </TouchableOpacity>

      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : activeTab === "products" ? (
        <ProductList />
      ) : (
        <CategoryList />
      )}

      <Modal
        visible={productModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setProductModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalContent, { backgroundColor: colors.surface }]}
          >
            <ScrollView showsVerticalScrollIndicator={false}>
              <Typography
                variant="h3"
                color={colors.primary}
                style={styles.modalTitle}
              >
                {editingProduct ? "تعديل المنتج" : "إضافة منتج جديد"}
              </Typography>

              <Text style={[styles.label, { color: colors.text }]}>
                اسم المنتج *
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
                value={productForm.name}
                onChangeText={(text) =>
                  setProductForm({ ...productForm, name: text })
                }
                placeholder="أدخل اسم المنتج"
                placeholderTextColor={colors.textLight}
                textAlign="right"
              />

              <Text style={[styles.label, { color: colors.text }]}>الوصف</Text>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
                value={productForm.description}
                onChangeText={(text) =>
                  setProductForm({ ...productForm, description: text })
                }
                placeholder="أدخل وصف المنتج"
                placeholderTextColor={colors.textLight}
                multiline
                numberOfLines={3}
                textAlign="right"
              />

              <Text style={[styles.label, { color: colors.text }]}>
                السعر *
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
                value={productForm.price}
                onChangeText={(text) =>
                  setProductForm({ ...productForm, price: text })
                }
                placeholder="أدخل السعر"
                placeholderTextColor={colors.textLight}
                keyboardType="numeric"
                textAlign="right"
              />

              <Text style={[styles.label, { color: colors.text }]}>الكمية</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
                value={productForm.quantity}
                onChangeText={(text) =>
                  setProductForm({ ...productForm, quantity: text })
                }
                placeholder="أدخل الكمية المتوفرة"
                placeholderTextColor={colors.textLight}
                keyboardType="numeric"
                textAlign="right"
              />

              <Text style={[styles.label, { color: colors.text }]}>القسم *</Text>
              <View style={styles.categoryContainer}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryOption,
                      {
                        backgroundColor: colors.background,
                        borderColor: colors.border,
                      },
                      productForm.category_id === category.id && [
                        styles.categoryOptionActive,
                        {
                          backgroundColor: colors.primary,
                          borderColor: colors.primary,
                        },
                      ],
                    ]}
                    onPress={() =>
                      setProductForm({
                        ...productForm,
                        category_id: category.id,
                      })
                    }
                  >
                    <Text
                      style={[
                        styles.categoryOptionText,
                        { color: colors.text },
                        productForm.category_id === category.id && [
                          styles.categoryOptionTextActive,
                          { color: colors.background },
                        ],
                      ]}
                    >
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: colors.border }]}
                  onPress={() => {
                    setProductModalVisible(false);
                    resetProductForm();
                  }}
                >
                  <Text style={[styles.cancelButtonText, { color: colors.text }]}>
                    إلغاء
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: colors.primary }]}
                  onPress={handleProductSubmit}
                  disabled={submitting}
                >
                  <Text
                    style={[
                      styles.submitButtonText,
                      { color: colors.background },
                    ]}
                  >
                    {submitting
                      ? "جاري الحفظ..."
                      : editingProduct
                      ? "تحديث"
                      : "إضافة"}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={categoryModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCategoryModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: colors.surface, maxHeight: "40%" },
            ]}
          >
            <Typography
              variant="h3"
              color={colors.primary}
              style={styles.modalTitle}
            >
              {editingCategory ? "تعديل القسم" : "إضافة قسم جديد"}
            </Typography>

            <Text style={[styles.label, { color: colors.text }]}>
              اسم القسم *
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              value={categoryName}
              onChangeText={setCategoryName}
              placeholder="أدخل اسم القسم"
              placeholderTextColor={colors.textLight}
              textAlign="right"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.border }]}
                onPress={() => {
                  setCategoryModalVisible(false);
                  resetCategoryForm();
                }}
              >
                <Text style={[styles.cancelButtonText, { color: colors.text }]}>
                  إلغاء
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                onPress={handleCategorySubmit}
                disabled={submitting}
              >
                <Text
                  style={[
                    styles.submitButtonText,
                    { color: colors.background },
                  ]}
                >
                  {submitting
                    ? "جاري الحفظ..."
                    : editingCategory
                    ? "تحديث"
                    : "إضافة"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={imagesModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setImagesModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: colors.surface, maxHeight: "80%" },
            ]}
          >
            <Typography
              variant="h3"
              color={colors.primary}
              style={styles.modalTitle}
            >
              إدارة صور: {selectedProduct?.name}
            </Typography>

            <Text style={[styles.label, { color: colors.text }]}>
              الصور ({productImages.length}/{MAX_IMAGES})
            </Text>

            <FlatList
              data={productImages}
              keyExtractor={(item) => item.id}
              renderItem={renderImageItem}
              contentContainerStyle={styles.imagesList}
              ListEmptyComponent={
                <View style={styles.emptyImagesContainer}>
                  <Text
                    style={[styles.emptyImagesText, { color: colors.textLight }]}
                  >
                    لا توجد صور حالياً
                  </Text>
                </View>
              }
            />

            <View style={styles.imagePickerButtons}>
              <TouchableOpacity
                style={[
                  styles.pickerButton,
                  { backgroundColor: colors.background, borderColor: colors.border },
                ]}
                onPress={takePhoto}
                disabled={uploadingImage || productImages.length >= MAX_IMAGES}
              >
                <Text style={[styles.pickerButtonText, { color: colors.text }]}>
                  📷 كاميرا
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.pickerButton,
                  { backgroundColor: colors.background, borderColor: colors.border },
                ]}
                onPress={pickImage}
                disabled={uploadingImage || productImages.length >= MAX_IMAGES}
              >
                <Text style={[styles.pickerButtonText, { color: colors.text }]}>
                  🖼️ معرض
                </Text>
              </TouchableOpacity>
            </View>

            {hasOrderChanged && (
              <TouchableOpacity
                style={[
                  styles.saveOrderButton,
                  { backgroundColor: colors.success },
                ]}
                onPress={handleSaveOrder}
                disabled={submitting}
              >
                <Text
                  style={[
                    styles.saveOrderButtonText,
                    { color: colors.background },
                  ]}
                >
                  {submitting ? "جاري الحفظ..." : "حفظ ترتيب الصور"}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[
                styles.closeModalButton,
                { backgroundColor: colors.border },
              ]}
              onPress={() => setImagesModalVisible(false)}
            >
              <Text style={[styles.closeModalButtonText, { color: colors.text }]}>
                إغلاق
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.l,
    paddingTop: spacing.xl,
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: "transparent",
  },
  tab: {
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderBottomWidth: 2,
    borderColor: "transparent",
    marginRight: spacing.m,
  },
  activeTab: {},
  tabText: {
    fontSize: 16,
    fontWeight: "600",
  },
  activeTabText: {
    fontWeight: "bold",
  },
  addButton: {
    marginHorizontal: spacing.l,
    marginVertical: spacing.m,
    padding: spacing.m,
    borderRadius: radii.m,
    alignItems: "center",
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    paddingHorizontal: spacing.l,
    paddingBottom: spacing.xl,
  },
  productItem: {
    flexDirection: "row",
    padding: spacing.m,
    borderRadius: radii.l,
    marginBottom: spacing.m,
    borderWidth: 1,
    alignItems: "center",
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 2,
  },
  productQuantity: {
    fontSize: 14,
    marginBottom: 2,
  },
  productCategory: {
    fontSize: 14,
    marginBottom: 2,
  },
  productImagesCount: {
    fontSize: 12,
  },
  productActions: {
    flexDirection: "column",
    gap: spacing.s,
    marginRight: spacing.m,
  },
  actionButton: {
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: radii.s,
    alignItems: "center",
    minWidth: 80,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  editButton: {},
  deleteButton: {},
  imagesButton: {},
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    marginTop: spacing.xxxl,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  emptySubText: {
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.l,
  },
  modalContent: {
    width: "100%",
    borderRadius: radii.xl,
    padding: spacing.l,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    marginBottom: spacing.l,
    textAlign: "center",
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: spacing.s,
    marginTop: spacing.m,
    textAlign: "right",
  },
  input: {
    borderRadius: radii.m,
    padding: spacing.m,
    borderWidth: 1,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  categoryContainer: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: spacing.s,
    marginTop: spacing.s,
  },
  categoryOption: {
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: radii.round,
    borderWidth: 1,
  },
  categoryOptionActive: {},
  categoryOptionText: {
    fontSize: 14,
  },
  categoryOptionTextActive: {
    fontWeight: "bold",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.xl,
    gap: spacing.m,
  },
  modalButton: {
    flex: 1,
    padding: spacing.m,
    borderRadius: radii.m,
    alignItems: "center",
  },
  cancelButton: {},
  submitButton: {},
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  imagesList: {
    paddingVertical: spacing.m,
  },
  imageItem: {
    flexDirection: "row-reverse",
    padding: spacing.s,
    borderRadius: radii.m,
    marginBottom: spacing.s,
    borderWidth: 1,
    alignItems: "center",
  },
  imagePreview: {
    width: 60,
    height: 60,
    borderRadius: radii.s,
  },
  imageActions: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.m,
  },
  deleteImageButton: {
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: radii.s,
  },
  deleteImageButtonText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  orderButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.s,
  },
  orderButton: {
    width: 30,
    height: 30,
    borderRadius: radii.s,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  orderButtonDisabled: {},
  orderButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  orderText: {
    fontSize: 14,
    fontWeight: "bold",
    minWidth: 20,
    textAlign: "center",
  },
  imagePickerButtons: {
    flexDirection: "row",
    gap: spacing.m,
    marginTop: spacing.m,
  },
  pickerButton: {
    flex: 1,
    padding: spacing.m,
    borderRadius: radii.m,
    borderWidth: 1,
    alignItems: "center",
  },
  pickerButtonText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  saveOrderButton: {
    width: "100%",
    padding: spacing.m,
    borderRadius: radii.m,
    alignItems: "center",
    marginTop: spacing.m,
  },
  saveOrderButtonText: {
    fontWeight: "bold",
    fontSize: 16,
  },
  closeModalButton: {
    width: "100%",
    padding: spacing.m,
    borderRadius: radii.m,
    alignItems: "center",
    marginTop: spacing.m,
  },
  closeModalButtonText: {
    fontWeight: "bold",
    fontSize: 16,
  },
  emptyImagesContainer: {
    padding: spacing.xl,
    alignItems: "center",
  },
  emptyImagesText: {
    fontSize: 16,
  },
});
