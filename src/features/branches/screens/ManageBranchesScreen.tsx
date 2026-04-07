import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { ScreenContainer } from "../../../shared/components/ScreenContainer";
import { Typography } from "../../../shared/components/Typography";
import { useThemeColors } from "../../../shared/theme/colors";
import { spacing } from "../../../shared/theme/spacing";
import { useBranchesStore } from "../store/branchesStore";

export const ManageBranchesScreen = ({ navigation }: any) => {
  const {
    branches,
    governorates,
    isLoading,
    fetchBranches,
    fetchGovernorates,
    createGovernorate,
  } = useBranchesStore();

  const colors = useThemeColors();
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [govName, setGovName] = useState("");

  useEffect(() => {
    fetchGovernorates();
    fetchBranches();
  }, []);

  const handleGovCreate = async () => {
    if (!govName.trim()) {
      Alert.alert("تنبيه", "يرجى إدخال اسم المحافظة.");
      return;
    }
    setIsSaving(true);
    try {
      await createGovernorate(govName.trim());
      Alert.alert(
        "نجاح",
        "تم إضافة المحافظة بنجاح (وتم إنشاء الفرع التابع لها تلقائياً).",
      );
      setGovName("");
      setShowAddForm(false);
    } catch (err: any) {
      Alert.alert("خطأ", err.message || "فشل إضافة المحافظة");
    } finally {
      setIsSaving(false);
    }
  };

  const branchMap = governorates
    .map((gov) => {
      const branch = branches.find(
        (b) => b.governorate_id === gov.id || b.name === gov.name,
      );
      return {
        ...gov,
        branch,
      };
    })
    .filter((item) => item.branch);

  return (
    <ScreenContainer scrollable={true}>
      <View style={styles.header}>
        <Typography variant="h2" color={colors.primary}>
          إدارة المناطق والفروع
        </Typography>
        <Typography variant="body" color={colors.textLight}>
          إدارة المحافظات وتوزيع الفروع التابعة لها
        </Typography>
      </View>

      <TouchableOpacity
        style={[styles.mainAddBtn, { backgroundColor: colors.primary, shadowColor: colors.primary }]}
        onPress={() => setShowAddForm(!showAddForm)}
        activeOpacity={0.9}
      >
        <View style={styles.addBtnContent}>
          <Text style={[styles.addBtnIcon, { color: colors.background }]}>{showAddForm ? "✕" : "+"}</Text>
          <Text style={[styles.addBtnText, { color: colors.background }]}>
            {showAddForm ? "إغلاق النموذج" : "إضافة محافظة جديدة"}
          </Text>
        </View>
      </TouchableOpacity>

      {showAddForm && (
        <View style={[styles.premiumForm, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.formContent}>
            <Text style={[styles.formLabel, { color: colors.text }]}>اسم المحافظة الجدية *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
              value={govName}
              onChangeText={setGovName}
              placeholder="مثال: حلب، طرطوس..."
              placeholderTextColor={colors.textLight + "80"}
              textAlign="right"
            />
            <Typography
              variant="caption"
              color={colors.textLight}
              style={{ marginBottom: spacing.m, textAlign: "right" }}
            >
              سيتم إنشاء فرع واحد تلقائياً لهذه المحافظة فور تفعيلها.
            </Typography>
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: colors.primary }, isSaving && styles.saveButtonDisabled]}
              onPress={handleGovCreate}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color={colors.background} />
              ) : (
                <Text style={[styles.saveButtonText, { color: colors.background }]}>تفعيل المنطقة</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.listSection}>
        <View style={styles.sectionHeader}>
          <View style={[styles.badge, { backgroundColor: colors.primary + "15" }]}>
            <Text style={[styles.badgeText, { color: colors.primary }]}>{branches.length} فرع</Text>
          </View>
          <Typography variant="h3" color={colors.text}>قائمة الفروع المسجلة</Typography>
        </View>

        {isLoading && branches.length === 0 ? (
          <ActivityIndicator
            size="large"
            color={colors.primary}
            style={{ marginTop: spacing.xl }}
          />
        ) : branchMap.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📍</Text>
            <Text style={[styles.emptyText, { color: colors.textLight }]}>لا توجد فروع مسجلة حالياً.</Text>
          </View>
        ) : (
          branchMap.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.branchCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() =>
                navigation.navigate("BranchDetailsScreen", {
                  branchId: item.branch?.id,
                  branch: item.branch,
                })
              }
            >
              <View style={styles.branchHeader}>
                <Text style={[styles.chevron, { color: colors.primary }]}>←</Text>
                
                <View
                  style={[
                    styles.miniStatusBadge,
                    { backgroundColor: item.branch?.status === "ACTIVE" 
                        ? (colors.success + "15") 
                        : (colors.error + "15") 
                    }
                  ]}
                >
                  <Text style={[styles.miniStatusText, { color: item.branch?.status === "ACTIVE" ? colors.success : colors.error }]}>
                    {item.branch?.status === "ACTIVE" ? "نشط" : "غير نشط"}
                  </Text>
                </View>

                <View style={[styles.branchInfo, { alignItems: "flex-end", marginRight: spacing.m }]}>
                  <Text style={[styles.branchTitle, { color: colors.text }]}>{item.name}</Text>
                  <Text style={[styles.branchSub, { color: colors.textLight }]}>
                    ID: {item.branch?.id.substring(0, 8)}...
                  </Text>
                </View>

                <View style={[styles.iconContainer, { backgroundColor: colors.primary + "10" }]}>
                  <Text style={styles.branchIcon}>🏢</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: { marginBottom: spacing.l, alignItems: "flex-end" },
  mainAddBtn: {
    borderRadius: spacing.m,
    padding: spacing.m,
    marginBottom: spacing.l,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  addBtnContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  addBtnIcon: {
    fontSize: 24,
    fontWeight: "bold",
    marginLeft: spacing.s,
  },
  addBtnText: { fontSize: 16, fontWeight: "bold" },

  premiumForm: {
    borderRadius: spacing.l,
    borderWidth: 1,
    padding: spacing.m,
    marginBottom: spacing.xl,
    overflow: "hidden",
  },
  formContent: { paddingVertical: spacing.s },
  formLabel: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: spacing.m,
    textAlign: "right",
  },
  input: {
    borderWidth: 1,
    borderRadius: spacing.s,
    padding: spacing.m,
    fontSize: 16,
    marginBottom: spacing.s,
  },
  saveButton: {
    padding: spacing.m,
    borderRadius: spacing.m,
    alignItems: "center",
  },
  saveButtonDisabled: { opacity: 0.7 },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },

  listSection: { marginTop: spacing.s },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.m,
    justifyContent: "space-between",
  },
  badge: {
    paddingHorizontal: spacing.s,
    paddingVertical: 2,
    borderRadius: spacing.m,
  },
  badgeText: { fontSize: 12, fontWeight: "bold" },

  emptyState: { alignItems: "center", marginTop: spacing.xl, opacity: 0.5 },
  emptyIcon: { fontSize: 40, marginBottom: spacing.s },
  emptyText: { fontSize: 16 },

  branchCard: {
    borderRadius: spacing.m,
    padding: spacing.m,
    marginBottom: spacing.m,
    borderWidth: 1,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  branchHeader: { flexDirection: "row", alignItems: "center", justifyContent: "flex-end" },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  branchIcon: { fontSize: 20 },
  branchInfo: { flex: 1 },
  branchTitle: { fontSize: 17, fontWeight: "700" },
  branchSub: { fontSize: 12, marginTop: 2 },
  chevron: { fontSize: 18, fontWeight: "bold", marginRight: spacing.s },
  miniStatusBadge: {
    paddingHorizontal: spacing.s,
    paddingVertical: 2,
    borderRadius: spacing.s,
    marginRight: spacing.s,
  },
  miniStatusText: {
    fontSize: 10,
    fontWeight: "600",
  },
});
