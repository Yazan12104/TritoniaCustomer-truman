import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  FlatList,
  Modal,
  TextInput,
  Alert,
  ScrollView,
} from "react-native";
import { ScreenContainer } from "../../../shared/components/ScreenContainer";
import { Typography } from "../../../shared/components/Typography";
import { useThemeColors } from "../../../shared/theme/colors";
import { spacing, radii } from "../../../shared/theme/spacing";
import { commissionsApi, CommissionSetting } from "../api/commissionsApi";
import { productsApi } from "../../products/api/productsApi";
import { Product } from "../../products/types";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type TabType = "default" | "custom";

export const ManageCommissionsScreen = () => {
  const [commissions, setCommissions] = useState<CommissionSetting[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("default");
  const colors = useThemeColors();

  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [companyPct, setCompanyPct] = useState("0");
  const [gsPct, setGsPct] = useState("0");
  const [supPct, setSupPct] = useState("0");
  const [productSearch, setProductSearch] = useState("");

  const fetchData = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      else setRefreshing(true);

      const [commRes, prodRes] = await Promise.all([
        commissionsApi.list({ limit: 100 }),
        productsApi.getProducts({ limit: 200 }),
      ]);

      setCommissions(commRes.data);
      if (prodRes && prodRes.products) {
        setProducts(prodRes.products);
      }
    } catch (err: any) {
      Alert.alert("خطأ", "فشل تحميل البيانات");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    fetchData(true);
  };

  // Separate default and custom settings
  const defaultSetting = useMemo(
    () => commissions.find((c) => !c.product_id) || null,
    [commissions]
  );

  const customSettings = useMemo(
    () => commissions.filter((c) => c.product_id !== null),
    [commissions]
  );

  // Products that already have custom settings
  const productsWithCustomSettings = useMemo(
    () => new Set(customSettings.map((c) => c.product_id)),
    [customSettings]
  );

  // Filtered products for multi-select (exclude those with existing custom settings unless editing)
  const availableProducts = useMemo(() => {
    return products.filter(
      (p) =>
        !productsWithCustomSettings.has(p.id) ||
        (editingId && customSettings.find((c) => c.id === editingId)?.product_id === p.id)
    );
  }, [products, productsWithCustomSettings, editingId, customSettings]);

  // Search filter
  const filteredProducts = useMemo(() => {
    if (!productSearch) return availableProducts;
    const q = productSearch.toLowerCase();
    return availableProducts.filter(
      (p) => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)
    );
  }, [availableProducts, productSearch]);

  const resetForm = () => {
    setSelectedProducts([]);
    setCompanyPct("0");
    setGsPct("0");
    setSupPct("0");
    setEditingId(null);
    setProductSearch("");
  };

  const handleSave = async () => {
    const total =
      parseFloat(companyPct || "0") +
      parseFloat(gsPct || "0") +
      parseFloat(supPct || "0");

    if (total > 100) {
      Alert.alert("خطأ", "مجموع النسب لا يمكن أن يتجاوز 100%");
      return;
    }

    if (total < 100) {
      Alert.alert(
        "تنبيه",
        `مجموع النسب هو ${total}% فقط. سيتم تعيين نسبة المسوق المتبقية تلقائياً (${100 - total}%).`,
        [
          { text: "إلغاء", style: "cancel" },
          { text: "متابعة", onPress: () => executeSave() },
        ]
      );
      return;
    }

    executeSave();
  };

  const executeSave = async () => {
    try {
      const data = {
        product_id: editingId
          ? customSettings.find((c) => c.id === editingId)?.product_id || selectedProducts[0] || null
          : null,
        company_percentage: parseFloat(companyPct || "0"),
        general_supervisor_percentage: parseFloat(gsPct || "0"),
        supervisor_percentage: parseFloat(supPct || "0"),
      };

      if (editingId) {
        // Editing existing custom setting
        await commissionsApi.update(editingId, data);
        Alert.alert("نجاح", "تم تحديث الإعدادات بنجاح");
      } else if (activeTab === "default") {
        // Saving/Updating default setting
        if (defaultSetting) {
          await commissionsApi.update(defaultSetting.id, data);
        } else {
          await commissionsApi.create(data);
        }
        Alert.alert("نجاح", "تم حفظ الإعداد العام بنجاح");
      } else {
        // Creating custom settings for selected products
        if (selectedProducts.length === 0) {
          Alert.alert("تنبيه", "يرجى اختيار منتج واحد على الأقل.");
          return;
        }

        for (const productId of selectedProducts) {
          await commissionsApi.create({
            ...data,
            product_id: productId,
          });
        }
        Alert.alert("نجاح", `تم حفظ الإعدادات لـ ${selectedProducts.length} منتج(ات)`);
      }

      setModalVisible(false);
      resetForm();
      fetchData(true);
    } catch (err: any) {
      Alert.alert("خطأ", err.message || "فشل الحفظ");
    }
  };

  const handleDelete = (item: CommissionSetting) => {
    const productName = item.product_name || "المنتج";
    Alert.alert(
      "تأكيد الحذف",
      `هل أنت متأكد من حذف إعداد العمولة المخصص لـ "${productName}"؟\n\nبمجرد الحذف، سيعود هذا المنتج تلقائياً لاستخدام "الإعداد العام" للعمولات.`,
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "حذف وتطبيق الإعداد العام",
          style: "destructive",
          onPress: async () => {
            try {
              await commissionsApi.delete(item.id);
              fetchData(true);
              Alert.alert("تم الحذف بنجاح", `عاد المنتج "${productName}" لاستخدام الإعداد العام.`);
            } catch (err: any) {
              const errorMsg = err?.response?.data?.message || err?.message || "فشل الحذف، يرجى المحاولة لاحقاً.";
              Alert.alert("خطأ", errorMsg);
            }
          },
        },
      ]
    );
  };

  const openEdit = (item: CommissionSetting) => {
    setEditingId(item.id);
    if (item.product_id) {
      setSelectedProducts([item.product_id]);
    }
    setCompanyPct((item.company_percentage ?? 0).toString());
    setGsPct((item.general_supervisor_percentage ?? 0).toString());
    setSupPct((item.supervisor_percentage ?? 0).toString());
    setActiveTab("custom");
    setModalVisible(true);
  };

  const openNewCustomSetting = () => {
    resetForm();
    setActiveTab("custom");
    setModalVisible(true);
  };

  const openEditDefault = () => {
    if (defaultSetting) {
      openEdit(defaultSetting);
    } else {
      resetForm();
      setActiveTab("default");
      setModalVisible(true);
    }
  };

  const toggleProduct = (productId: string) => {
    setSelectedProducts((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const renderCustomSetting = ({ item }: { item: CommissionSetting }) => (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleArea}>
          <Text style={[styles.cardProductName, { color: colors.text }]}>
            {item.product_name || `منتج: ${item.product_id?.substring(0, 8) || ""}`}
          </Text>
          <Text style={[styles.cardProductId, { color: colors.textLight }]}>
            {item.product_id || ""}
          </Text>
        </View>
        <View style={styles.cardActions}>
          <TouchableOpacity
            onPress={() => openEdit(item)}
            style={styles.iconBtn}
          >
            <MaterialCommunityIcons name="pencil" size={18} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleDelete(item)}
            style={styles.iconBtn}
          >
            <MaterialCommunityIcons name="delete" size={18} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.grid, { borderTopColor: colors.border }]}>
        <View style={styles.gridItem}>
          <Text style={[styles.gridLabel, { color: colors.textLight }]}>
            الشركة
          </Text>
          <Text style={[styles.gridValue, { color: colors.primary }]}>
            {item.company_percentage}%
          </Text>
        </View>
        <View style={styles.gridItem}>
          <Text style={[styles.gridLabel, { color: colors.textLight }]}>
            المشرف العام
          </Text>
          <Text style={[styles.gridValue, { color: colors.primary }]}>
            {item.general_supervisor_percentage}%
          </Text>
        </View>
        <View style={styles.gridItem}>
          <Text style={[styles.gridLabel, { color: colors.textLight }]}>
            المشرف
          </Text>
          <Text style={[styles.gridValue, { color: colors.primary }]}>
            {item.supervisor_percentage}%
          </Text>
        </View>
        <View style={styles.gridItem}>
          <Text style={[styles.gridLabel, { color: colors.textLight }]}>
            المسوق
          </Text>
          <Text style={[styles.gridValue, { color: colors.success }]}>
            {100 - (item.company_percentage + item.general_supervisor_percentage + item.supervisor_percentage)}%
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <ScreenContainer scrollable={false}>
      <View style={styles.headerRow}>
        <Typography variant="h2" color={colors.primary}>
          إعدادات العمولات
        </Typography>
      </View>

      {/* Tabs */}
      <View style={[styles.tabsContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "default" && { backgroundColor: colors.primary }]}
          onPress={() => setActiveTab("default")}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === "default" ? colors.background : colors.text },
            ]}
          >
            الإعداد العام
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "custom" && { backgroundColor: colors.primary }]}
          onPress={() => setActiveTab("custom")}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === "custom" ? colors.background : colors.text },
            ]}
          >
            الإعدادات المخصصة
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: spacing.xl }} />
      ) : activeTab === "default" ? (
        // Default Setting View
        <View style={styles.contentContainer}>
          {defaultSetting ? (
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.primary, borderWidth: 2 }]}>
              <View style={styles.cardHeader}>
                <View style={styles.cardTitleArea}>
                  <Text style={[styles.cardProductName, { color: colors.primary }]}>
                    الإعداد العام (افتراضي)
                  </Text>
                  <Text style={[styles.cardProductId, { color: colors.textLight }]}>
                    يُطبق على جميع المنتجات التي ليس لها إعداد مخصص
                  </Text>
                </View>
                <TouchableOpacity onPress={openEditDefault} style={styles.iconBtn}>
                  <MaterialCommunityIcons name="pencil" size={22} color={colors.primary} />
                </TouchableOpacity>
              </View>
              <View style={[styles.grid, { borderTopColor: colors.border }]}>
                <View style={styles.gridItem}>
                  <Text style={[styles.gridLabel, { color: colors.textLight }]}>الشركة</Text>
                  <Text style={[styles.gridValue, { color: colors.primary }]}>{defaultSetting.company_percentage}%</Text>
                </View>
                <View style={styles.gridItem}>
                  <Text style={[styles.gridLabel, { color: colors.textLight }]}>المشرف العام</Text>
                  <Text style={[styles.gridValue, { color: colors.primary }]}>{defaultSetting.general_supervisor_percentage}%</Text>
                </View>
                <View style={styles.gridItem}>
                  <Text style={[styles.gridLabel, { color: colors.textLight }]}>المشرف</Text>
                  <Text style={[styles.gridValue, { color: colors.primary }]}>{defaultSetting.supervisor_percentage}%</Text>
                </View>
                <View style={styles.gridItem}>
                  <Text style={[styles.gridLabel, { color: colors.textLight }]}>المسوق</Text>
                  <Text style={[styles.gridValue, { color: colors.success }]}>
                    {100 - (defaultSetting.company_percentage + defaultSetting.general_supervisor_percentage + defaultSetting.supervisor_percentage)}%
                  </Text>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="percent" size={48} color={colors.textLight} />
              <Text style={[styles.emptyText, { color: colors.textLight }]}>
                لا يوجد إعداد عام بعد
              </Text>
              <TouchableOpacity
                style={[styles.addSettingBtn, { backgroundColor: colors.primary }]}
                onPress={openEditDefault}
              >
                <Text style={[styles.addSettingBtnText, { color: colors.background }]}>
                  + إضافة إعداد عام
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ) : (
        // Custom Settings View
        <View style={styles.contentContainer}>
          <View style={styles.customHeader}>
            <Text style={[styles.customCount, { color: colors.textLight }]}>
              {customSettings.length} إعداد(ات) مخصصة
            </Text>
            <TouchableOpacity
              style={[styles.addCustomBtn, { backgroundColor: colors.primary }]}
              onPress={openNewCustomSetting}
            >
              <MaterialCommunityIcons name="plus" size={18} color={colors.background} />
              <Text style={[styles.addCustomBtnText, { color: colors.background }]}>
                إضافة مخصص
              </Text>
            </TouchableOpacity>
          </View>

          {customSettings.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="file-document-edit-outline" size={48} color={colors.textLight} />
              <Text style={[styles.emptyText, { color: colors.textLight }]}>
                لا توجد إعدادات مخصصة
              </Text>
              <Text style={[styles.emptySubtext, { color: colors.textLight }]}>
                أضف إعدادات مخصصة لمنتجات محددة تختلف عن الإعداد العام
              </Text>
            </View>
          ) : (
            <FlatList
              data={customSettings}
              keyExtractor={(item) => item.id}
              renderItem={renderCustomSetting}
              contentContainerStyle={styles.list}
              showsVerticalScrollIndicator={false}
              refreshing={refreshing}
              onRefresh={handleRefresh}
            />
          )}
        </View>
      )}

      {/* Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Typography variant="h3" color={colors.text}>
                {editingId
                  ? "تعديل الإعداد"
                  : activeTab === "default"
                  ? "إعداد عام جديد"
                  : "إعداد مخصص جديد"}
              </Typography>
              <TouchableOpacity onPress={() => { setModalVisible(false); resetForm(); }}>
                <MaterialCommunityIcons name="close" size={24} color={colors.textLight} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScroll}>
              {/* Product Selection (only for custom settings, not for default) */}
              {activeTab === "custom" && !editingId && (
                <View style={styles.section}>
                  <Text style={[styles.label, { color: colors.text }]}>
                    المنتجات المشمولة
                  </Text>
                  <View style={[styles.searchContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
                    <MaterialCommunityIcons name="magnify" size={20} color={colors.textLight} />
                    <TextInput
                      style={[styles.searchInput, { color: colors.text }]}
                      placeholder="بحث عن منتج..."
                      value={productSearch}
                      onChangeText={setProductSearch}
                      placeholderTextColor={colors.textLight}
                      textAlign="right"
                    />
                  </View>
                  <View style={styles.productListContainer}>
                    {filteredProducts.length === 0 ? (
                      <View style={styles.noProducts}>
                        <Text style={[styles.noProductsText, { color: colors.textLight }]}>
                          لا توجد منتجات متاحة للربط
                        </Text>
                      </View>
                    ) : (
                      <View style={styles.productGrid}>
                        {filteredProducts.map((p) => {
                          const isSelected = selectedProducts.includes(p.id);
                          return (
                            <TouchableOpacity
                              key={p.id}
                              style={[
                                styles.productChip,
                                { backgroundColor: colors.background, borderColor: colors.border },
                                isSelected && { backgroundColor: colors.primary + "15", borderColor: colors.primary },
                              ]}
                              onPress={() => toggleProduct(p.id)}
                            >
                              <Text 
                                numberOfLines={1} 
                                style={[styles.productChipName, { color: isSelected ? colors.primary : colors.text }]}
                              >
                                {p.name}
                              </Text>
                              {isSelected && (
                                <MaterialCommunityIcons name="check" size={14} color={colors.primary} />
                              )}
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    )}
                  </View>
                  {selectedProducts.length > 0 && (
                    <Text style={[styles.selectedCount, { color: colors.primary }]}>
                      تم اختيار {selectedProducts.length} منتج(ات)
                    </Text>
                  )}
                </View>
              )}

              {/* Editing existing custom setting - show product name */}
              {editingId && (
                <View style={[styles.editingProductInfo, { backgroundColor: colors.primary + "10", borderColor: colors.primary + "30" }]}>
                  <MaterialCommunityIcons name="cube-outline" size={24} color={colors.primary} />
                  <View style={styles.editingTextContainer}>
                    <Text style={[styles.editingProductLabel, { color: colors.textLight }]}>تعديل إعداد المنتج:</Text>
                    <Text style={[styles.editingProductName, { color: colors.text }]}>
                      {customSettings.find((c) => c.id === editingId)?.product_name || "منتج"}
                    </Text>
                  </View>
                </View>
              )}

              <View style={styles.section}>
                <Text style={[styles.label, { color: colors.text }]}>توزيع النسب المئوية</Text>
                
                {/* Distribution Grid */}
                <View style={styles.inputsGrid}>
                  <View style={styles.inputWrapper}>
                    <Text style={[styles.inputLabel, { color: colors.textLight }]}>الشركة</Text>
                    <TextInput
                      style={[styles.gridInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                      value={companyPct}
                      onChangeText={setCompanyPct}
                      keyboardType="numeric"
                      textAlign="center"
                    />
                  </View>
                  <View style={styles.inputWrapper}>
                    <Text style={[styles.inputLabel, { color: colors.textLight }]}>المشرف العام</Text>
                    <TextInput
                      style={[styles.gridInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                      value={gsPct}
                      onChangeText={setGsPct}
                      keyboardType="numeric"
                      textAlign="center"
                    />
                  </View>
                  <View style={styles.inputWrapper}>
                    <Text style={[styles.inputLabel, { color: colors.textLight }]}>المشرف</Text>
                    <TextInput
                      style={[styles.gridInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                      value={supPct}
                      onChangeText={setSupPct}
                      keyboardType="numeric"
                      textAlign="center"
                    />
                  </View>
                </View>

                {/* Distribution Bar */}
                {(() => {
                  const comp = parseFloat(companyPct || "0");
                  const gs = parseFloat(gsPct || "0");
                  const sup = parseFloat(supPct || "0");
                  const total = comp + gs + sup;
                  const marketer = Math.max(0, 100 - total);
                  const isError = total > 100;

                  return (
                    <View style={styles.distributionContainer}>
                      <View style={styles.distBar}>
                        <View style={[styles.distSegment, { flex: Math.max(0.1, comp), backgroundColor: colors.primary }]} />
                        <View style={[styles.distSegment, { flex: Math.max(0.1, gs), backgroundColor: colors.info || "#3498db" }]} />
                        <View style={[styles.distSegment, { flex: Math.max(0.1, sup), backgroundColor: colors.warning || "#f39c12" }]} />
                        <View style={[styles.distSegment, { flex: Math.max(0.1, marketer), backgroundColor: colors.success }]} />
                      </View>
                      
                      <View style={styles.distLegend}>
                        <View style={styles.legendItem}><View style={[styles.dot, { backgroundColor: colors.primary }]} /><Text style={styles.legendText}>شركة</Text></View>
                        <View style={styles.legendItem}><View style={[styles.dot, { backgroundColor: colors.info || "#3498db" }]} /><Text style={styles.legendText}>مشرف ع</Text></View>
                        <View style={styles.legendItem}><View style={[styles.dot, { backgroundColor: colors.warning || "#f39c12" }]} /><Text style={styles.legendText}>مشرف</Text></View>
                        <View style={styles.legendItem}><View style={[styles.dot, { backgroundColor: colors.success }]} /><Text style={styles.legendText}>مسوق</Text></View>
                      </View>

                      <View style={[styles.summaryBox, { backgroundColor: isError ? colors.error + "10" : colors.background, borderColor: isError ? colors.error : colors.border }]}>
                        <View style={styles.summaryRow}>
                          <Text style={[styles.summaryLabel, { color: colors.text }]}>إجمالي العمولات:</Text>
                          <Text style={[styles.summaryValue, { color: isError ? colors.error : colors.primary }]}>{total}%</Text>
                        </View>
                        <View style={styles.summaryRow}>
                          <Text style={[styles.summaryLabel, { color: colors.text }]}>صافي المسوق:</Text>
                          <Text style={[styles.summaryValue, { color: colors.success }]}>{marketer}%</Text>
                        </View>
                        {isError && (
                          <Text style={[styles.errorText, { color: colors.error }]}>تجاوزت النسبة المتاحة (100%)!</Text>
                        )}
                      </View>
                    </View>
                  );
                })()}
              </View>

              <View style={styles.footer}>
                <TouchableOpacity
                  style={[styles.modalBtn, { backgroundColor: colors.border + "50" }]}
                  onPress={() => {
                    setModalVisible(false);
                    resetForm();
                  }}
                >
                  <Text style={[styles.modalBtnText, { color: colors.text }]}>إلغاء</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalBtn, { backgroundColor: colors.primary }]}
                  onPress={handleSave}
                >
                  <Text style={[styles.modalBtnText, { color: colors.background }]}>حفظ الإعدادات</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.m,
  },
  tabsContainer: {
    flexDirection: "row-reverse",
    marginHorizontal: spacing.m,
    marginBottom: spacing.m,
    borderRadius: radii.m,
    borderWidth: 1,
    overflow: "hidden",
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.m,
    alignItems: "center",
  },
  tabText: {
    fontWeight: "600",
    fontSize: 14,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: spacing.m,
  },
  list: {
    paddingBottom: spacing.xxl,
  },
  card: {
    padding: spacing.m,
    borderRadius: radii.m,
    marginBottom: spacing.m,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.m,
  },
  cardTitleArea: {
    flex: 1,
    alignItems: "flex-end",
  },
  cardProductName: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "right",
  },
  cardProductId: {
    fontSize: 11,
    marginTop: 2,
    textAlign: "right",
  },
  cardActions: {
    flexDirection: "row",
    gap: spacing.s,
  },
  iconBtn: {
    padding: 6,
  },
  grid: {
    flexDirection: "row-reverse",
    justifyContent: "space-around",
    borderTopWidth: 1,
    paddingTop: spacing.m,
  },
  gridItem: {
    alignItems: "center",
  },
  gridLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  gridValue: {
    fontSize: 16,
    fontWeight: "bold",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: spacing.xl * 2,
  },
  emptyText: {
    fontSize: 16,
    marginTop: spacing.m,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 13,
    marginTop: spacing.s,
    textAlign: "center",
    paddingHorizontal: spacing.l,
  },
  addSettingBtn: {
    marginTop: spacing.l,
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
    borderRadius: radii.m,
  },
  addSettingBtnText: {
    fontWeight: "bold",
    fontSize: 14,
  },
  customHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.m,
    marginTop: spacing.s,
  },
  customCount: {
    fontSize: 13,
  },
  addCustomBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: radii.s,
    gap: spacing.xs,
  },
  addCustomBtnText: {
    fontWeight: "bold",
    fontSize: 13,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    padding: spacing.l,
    maxHeight: "92%",
  },
  modalHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.l,
  },
  modalScroll: {
    paddingBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.l,
  },
  label: {
    textAlign: "right",
    marginBottom: spacing.s,
    fontWeight: "bold",
    fontSize: 15,
  },
  searchContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: radii.m,
    paddingHorizontal: spacing.s,
    marginBottom: spacing.s,
  },
  searchInput: {
    flex: 1,
    padding: spacing.s,
    fontSize: 14,
    height: 45,
  },
  productListContainer: {
    maxHeight: 150,
    marginBottom: spacing.s,
  },
  productGrid: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  productChip: {
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingHorizontal: spacing.s,
    paddingVertical: 6,
    borderRadius: radii.s,
    borderWidth: 1,
    gap: 4,
  },
  productChipName: {
    fontSize: 12,
    maxWidth: 120,
  },
  noProducts: {
    padding: spacing.m,
    alignItems: "center",
  },
  noProductsText: {
    fontSize: 13,
  },
  selectedCount: {
    fontSize: 12,
    textAlign: "right",
    fontWeight: "600",
  },
  editingProductInfo: {
    flexDirection: "row-reverse",
    alignItems: "center",
    padding: spacing.m,
    borderRadius: radii.m,
    borderWidth: 1,
    marginBottom: spacing.l,
    gap: spacing.s,
  },
  editingTextContainer: {
    flex: 1,
    alignItems: "flex-end",
  },
  editingProductLabel: {
    fontSize: 11,
    marginBottom: 2,
  },
  editingProductName: {
    fontWeight: "600",
    flex: 1,
    textAlign: "right",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.m,
    borderRadius: radii.s,
    borderWidth: 1,
    marginBottom: spacing.m,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: "bold",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "bold",
  },
  marketerLabel: {
    fontSize: 12,
  },
  inputsGrid: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    gap: spacing.s,
    marginBottom: spacing.m,
  },
  inputWrapper: {
    flex: 1,
    alignItems: "center",
  },
  inputLabel: {
    fontSize: 11,
    marginBottom: 4,
    textAlign: "center",
  },
  gridInput: {
    width: "100%",
    borderWidth: 1,
    borderRadius: radii.s,
    padding: spacing.s,
    fontSize: 16,
    fontWeight: "bold",
    height: 45,
  },
  distributionContainer: {
    marginTop: spacing.s,
  },
  distBar: {
    height: 12,
    flexDirection: "row-reverse",
    borderRadius: 6,
    overflow: "hidden",
    backgroundColor: "#eee",
    marginBottom: spacing.s,
  },
  distSegment: {
    height: "100%",
  },
  distLegend: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: spacing.m,
    marginBottom: spacing.m,
  },
  legendItem: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 10,
    color: "#666",
  },
  summaryBox: {
    padding: spacing.m,
    borderRadius: radii.m,
    borderWidth: 1,
  },
  summaryRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "bold",
  },
  errorText: {
    fontSize: 11,
    textAlign: "center",
    marginTop: 4,
    fontWeight: "500",
  },
  footer: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    marginTop: spacing.l,
    marginBottom: spacing.xl,
  },
  modalBtn: {
    flex: 1,
    height: 48,
    borderRadius: radii.s,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: spacing.xs,
  },
  modalBtnText: {
    fontWeight: "bold",
    fontSize: 16,
  },
});
