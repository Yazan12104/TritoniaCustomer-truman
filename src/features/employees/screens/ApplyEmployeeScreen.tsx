import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { ScreenContainer } from "../../../shared/components/ScreenContainer";
import { Typography } from "../../../shared/components/Typography";
import { useThemeColors } from "../../../shared/theme/colors";
import { spacing, radii } from "../../../shared/theme/spacing";
import { employeesApi } from "../api/employeesApi";
import { useAuthStore } from "../../auth/store/authStore";
import { useBranchesStore } from "../../branches/store/branchesStore";
import { useEmployeesStore } from "../store/employeesStore";
import { Employee, EmployeeRole } from "../types";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const ROLES: { value: EmployeeRole; label: string }[] = [
  { value: "GENERAL_SUPERVISOR", label: "مشرف عام" },
  { value: "SUPERVISOR", label: "مشرف" },
  { value: "MARKETER", label: "مسوق" },
  { value: "BRANCH_MANAGER", label: "مدير فرع" },
];

export const ApplyEmployeeScreen = ({ route, navigation }: any) => {
  const { userId } = route.params;
  const { user } = useAuthStore();
  const { branches, fetchBranches } = useBranchesStore();
  const { employees, fetchEmployees } = useEmployeesStore();
  const colors = useThemeColors();

  const [selectedRole, setSelectedRole] = useState<EmployeeRole | null>(null);
  const [selectedSupervisorId, setSelectedSupervisorId] = useState<string | null>(null);
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  // Modal state for supervisor selection
  const [showSupervisorModal, setShowSupervisorModal] = useState(false);
  const [supervisorSearch, setSupervisorSearch] = useState("");
  const [loadingSupervisors, setLoadingSupervisors] = useState(false);

  useEffect(() => {
    fetchBranches();
    if (employees.length === 0) fetchEmployees();
  }, []);

  // Get supervisors filtered by selected branch and role
  const availableSupervisors = useMemo(() => {
    if (!selectedRole || !selectedBranchId) return [];

    if (selectedRole === "SUPERVISOR") {
      // Show only General Supervisors from the selected branch
      return employees.filter(
        (e) => e.role === "GENERAL_SUPERVISOR" && e.branchId === selectedBranchId && e.status === "ACTIVE"
      );
    }

    if (selectedRole === "MARKETER") {
      // Show Supervisors AND General Supervisors from the selected branch
      return employees.filter(
        (e) =>
          (e.role === "SUPERVISOR" || e.role === "GENERAL_SUPERVISOR") &&
          e.branchId === selectedBranchId &&
          e.status === "ACTIVE"
      );
    }

    return [];
  }, [selectedRole, selectedBranchId, employees]);

  // Filter supervisors by search query
  const filteredSupervisors = useMemo(() => {
    if (!supervisorSearch) return availableSupervisors;
    const q = supervisorSearch.toLowerCase();
    return availableSupervisors.filter(
      (e) => e.name.toLowerCase().includes(q) || e.phone.toLowerCase().includes(q)
    );
  }, [availableSupervisors, supervisorSearch]);

  const availableRoles = ROLES.filter((r) => {
    if (user?.role === "ADMIN") return true;
    return false;
  });

  const handleOpenSupervisorModal = async () => {
    if (availableSupervisors.length === 0) {
      Alert.alert(
        "تنبيه",
        `لا يوجد ${selectedRole === "SUPERVISOR" ? "مشرفين عامين" : "مشرفين أو مشرفين عامين"} في هذا الفرع.`
      );
      return;
    }
    setLoadingSupervisors(true);
    setSupervisorSearch("");
    setShowSupervisorModal(true);
    // Refresh employees to ensure we have latest data
    await fetchEmployees();
    setLoadingSupervisors(false);
  };

  const handleSelectSupervisor = async (supervisor: Employee) => {
    setSelectedSupervisorId(supervisor.id);
    setShowSupervisorModal(false);
    setSupervisorSearch("");
  };

  const handleApply = async () => {
    if (!selectedRole) {
      Alert.alert("تنبيه", "يرجى اختيار الدور.");
      return;
    }
    if (!selectedBranchId) {
      Alert.alert("تنبيه", "يرجى اختيار الفرع.");
      return;
    }
    if ((selectedRole === "MARKETER" || selectedRole === "SUPERVISOR") && !selectedSupervisorId) {
      Alert.alert("تنبيه", "يرجى اختيار المشرف.");
      return;
    }

    Alert.alert(
      "تأكيد التحويل",
      `هل أنت متأكد من تحويل هذا العميل إلى ${ROLES.find(r => r.value === selectedRole)?.label}؟`,
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "تحويل",
          onPress: async () => {
            try {
              setIsApplying(true);
              await employeesApi.applyEmployee({
                userId,
                role: selectedRole,
                branchId: selectedBranchId,
                supervisorId: selectedSupervisorId || undefined,
              });
              Alert.alert("نجاح", "تم تحويل العميل إلى موظف بنجاح", [
                { text: "حسناً", onPress: () => navigation.goBack() },
              ]);
            } catch (err: any) {
              Alert.alert("خطأ", err.message || "فشل تحويل العميل إلى موظف");
            } finally {
              setIsApplying(false);
            }
          },
        },
      ]
    );
  };

  // Helper to get the selected supervisor name
  const selectedSupervisorName = useMemo(() => {
    if (!selectedSupervisorId) return null;
    const found = employees.find((e) => e.id === selectedSupervisorId);
    return found ? found.name : null;
  }, [selectedSupervisorId, employees]);

  return (
    <ScreenContainer scrollable={true}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={[styles.backButtonText, { color: colors.primary }]}>
          ← رجوع
        </Text>
      </TouchableOpacity>

      <Typography variant="h2" color={colors.primary} style={styles.title}>
        تطبيق كموظف
      </Typography>

      <Typography variant="body" color={colors.textLight} style={styles.subtitle}>
        اختر الدور والفرع لهذا العميل ليصبح موظفاً في النظام.
      </Typography>

      {/* Role Selection */}
      <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Typography variant="h3" color={colors.text} style={styles.sectionTitle}>
          الدور الوظيفي
        </Typography>
        <View style={styles.rolesContainer}>
          {availableRoles.map((role) => (
            <TouchableOpacity
              key={role.value}
              style={[
                styles.roleButton,
                { backgroundColor: colors.background, borderColor: colors.border },
                selectedRole === role.value && [styles.roleButtonSelected, { backgroundColor: colors.primary, borderColor: colors.primary }],
              ]}
              onPress={() => {
                setSelectedRole(role.value);
                setSelectedSupervisorId(null);
              }}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.roleButtonText,
                  { color: colors.text },
                  selectedRole === role.value && [styles.roleButtonTextSelected, { color: colors.background }],
                ]}
              >
                {role.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Branch Selection */}
      <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Typography variant="h3" color={colors.text} style={styles.sectionTitle}>
          الفرع
        </Typography>
        <View style={styles.branchesContainer}>
          {branches.map((branch) => (
            <TouchableOpacity
              key={branch.id}
              style={[
                styles.branchButton,
                { backgroundColor: colors.background, borderColor: colors.border },
                selectedBranchId === branch.id && [styles.branchButtonSelected, { backgroundColor: colors.primary, borderColor: colors.primary }],
              ]}
              onPress={() => {
                setSelectedBranchId(branch.id);
                setSelectedSupervisorId(null); // Reset supervisor when branch changes
              }}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name="office-building"
                size={20}
                color={selectedBranchId === branch.id ? colors.background : colors.primary}
              />
              <Text
                style={[
                  styles.branchButtonText,
                  { color: colors.text },
                  selectedBranchId === branch.id && [styles.branchButtonTextSelected, { color: colors.background }],
                ]}
              >
                {branch.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Supervisor Selection (for SUPERVISOR and MARKETER roles) */}
      {(selectedRole === "MARKETER" || selectedRole === "SUPERVISOR") && selectedBranchId && (
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Typography variant="h3" color={colors.text} style={styles.sectionTitle}>
            المشرف المباشر
          </Typography>
          {selectedSupervisorId ? (
            <View style={[styles.selectedSupervisorCard, { backgroundColor: colors.primary + "15", borderColor: colors.primary }]}>
              <MaterialCommunityIcons name="account-check" size={24} color={colors.primary} />
              <View style={styles.selectedSupervisorInfo}>
                <Text style={[styles.selectedSupervisorName, { color: colors.text }]}>
                  {selectedSupervisorName}
                </Text>
                <Text style={[styles.selectedSupervisorRole, { color: colors.textLight }]}>
                  {availableSupervisors.find(s => s.id === selectedSupervisorId)?.role === "GENERAL_SUPERVISOR"
                    ? "مشرف عام"
                    : "مشرف"}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.changeSupervisorBtn}
                onPress={handleOpenSupervisorModal}
              >
                <Text style={[styles.changeSupervisorText, { color: colors.primary }]}>تغيير</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.selectSupervisorButton, { borderColor: colors.border, backgroundColor: colors.background }]}
              onPress={handleOpenSupervisorModal}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="account-plus" size={20} color={colors.primary} />
              <Text style={[styles.selectSupervisorText, { color: colors.primary }]}>
                اختر المشرف
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Apply Button */}
      <TouchableOpacity
        style={[
          styles.applyButton,
          { backgroundColor: colors.primary },
          (isApplying || !selectedRole || !selectedBranchId || ((selectedRole === "MARKETER" || selectedRole === "SUPERVISOR") && !selectedSupervisorId)) && styles.applyButtonDisabled,
        ]}
        onPress={handleApply}
        disabled={isApplying || !selectedRole || !selectedBranchId || ((selectedRole === "MARKETER" || selectedRole === "SUPERVISOR") && !selectedSupervisorId)}
        activeOpacity={0.8}
      >
        {isApplying ? (
          <ActivityIndicator color={colors.background} />
        ) : (
          <Text style={[styles.applyButtonText, { color: colors.background }]}>
            تطبيق كموظف
          </Text>
        )}
      </TouchableOpacity>

      {/* Supervisor Selection Modal */}
      <Modal
        visible={showSupervisorModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowSupervisorModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Typography variant="h3" style={styles.modalTitle}>
                {selectedRole === "SUPERVISOR" ? "اختر المشرف العام" : "اختر المشرف"}
              </Typography>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowSupervisorModal(false)}
              >
                <Text style={styles.modalCloseButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {loadingSupervisors ? (
              <View style={styles.modalLoading}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[styles.modalLoadingText, { color: colors.textLight }]}>جاري التحميل...</Text>
              </View>
            ) : availableSupervisors.length === 0 ? (
              <View style={styles.modalEmpty}>
                <Text style={[styles.modalEmptyText, { color: colors.textLight }]}>لا يوجد مشرفين متاحين في هذا الفرع</Text>
                <TouchableOpacity
                  style={[styles.modalCloseBtn, { backgroundColor: colors.primary }]}
                  onPress={() => setShowSupervisorModal(false)}
                >
                  <Text style={styles.modalCloseBtnText}>إغلاق</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <View style={styles.modalSearchContainer}>
                  <TextInput
                    style={[styles.modalSearchInput, {
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                      color: colors.text,
                    }]}
                    placeholder="بحث عن مشرف..."
                    value={supervisorSearch}
                    onChangeText={setSupervisorSearch}
                    placeholderTextColor={colors.textLight}
                    textAlign="right"
                  />
                </View>

                <FlatList
                  data={filteredSupervisors}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.gsItem,
                        { borderBottomColor: colors.border },
                        selectedSupervisorId === item.id && { backgroundColor: colors.primary + "10" }
                      ]}
                      onPress={() => handleSelectSupervisor(item)}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.gsAvatar, { backgroundColor: colors.primary }]}>
                        <Text style={styles.gsAvatarText}>{item.name.charAt(0)}</Text>
                      </View>
                      <View style={styles.gsInfo}>
                        <Text style={[styles.gsName, { color: colors.text }]}>{item.name}</Text>
                        <Text style={[styles.gsPhone, { color: colors.textLight }]}>
                          {item.role === "GENERAL_SUPERVISOR" ? "مشرف عام" : "مشرف"} • {item.phone}
                        </Text>
                      </View>
                      {selectedSupervisorId === item.id && (
                        <MaterialCommunityIcons name="check-circle" size={24} color={colors.primary} />
                      )}
                    </TouchableOpacity>
                  )}
                  ListEmptyComponent={
                    <View style={styles.modalEmpty}>
                      <Text style={[styles.modalEmptyText, { color: colors.textLight }]}>لا توجد نتائج</Text>
                    </View>
                  }
                  style={styles.gsList}
                />
              </>
            )}
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  backButton: {
    paddingVertical: spacing.s,
    marginBottom: spacing.m,
  },
  backButtonText: {
    fontWeight: "600",
    fontSize: 16,
  },
  title: {
    marginBottom: spacing.xs,
    textAlign: "right",
  },
  subtitle: {
    marginBottom: spacing.l,
    textAlign: "right",
  },
  section: {
    padding: spacing.m,
    borderRadius: radii.m,
    marginBottom: spacing.m,
    borderWidth: 1,
  },
  sectionTitle: {
    marginBottom: spacing.m,
    textAlign: "right",
  },
  rolesContainer: {
    gap: spacing.s,
  },
  roleButton: {
    padding: spacing.m,
    borderRadius: radii.s,
    borderWidth: 1,
    alignItems: "center",
  },
  roleButtonSelected: {},
  roleButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },
  roleButtonTextSelected: {
    fontWeight: "bold",
  },
  branchesContainer: {
    gap: spacing.s,
  },
  branchButton: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.m,
    padding: spacing.m,
    borderRadius: radii.s,
    borderWidth: 1,
  },
  branchButtonSelected: {},
  branchButtonText: {
    fontSize: 15,
    fontWeight: "600",
    flex: 1,
    textAlign: "right",
  },
  branchButtonTextSelected: {
    fontWeight: "bold",
  },
  selectedSupervisorCard: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.m,
    padding: spacing.m,
    borderRadius: radii.s,
    borderWidth: 1,
  },
  selectedSupervisorInfo: {
    flex: 1,
    alignItems: "flex-end",
  },
  selectedSupervisorName: {
    fontSize: 15,
    fontWeight: "600",
  },
  selectedSupervisorRole: {
    fontSize: 13,
    marginTop: 2,
  },
  changeSupervisorBtn: {
    padding: spacing.s,
  },
  changeSupervisorText: {
    fontSize: 14,
    fontWeight: "600",
  },
  selectSupervisorButton: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.m,
    padding: spacing.m,
    borderRadius: radii.s,
    borderWidth: 1,
    borderStyle: "dashed",
  },
  selectSupervisorText: {
    fontSize: 15,
    fontWeight: "600",
  },
  applyButton: {
    padding: spacing.m,
    borderRadius: radii.m,
    alignItems: "center",
    marginTop: spacing.l,
    marginBottom: spacing.xxl,
  },
  applyButtonDisabled: {
    opacity: 0.5,
  },
  applyButtonText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: spacing.xl,
    borderTopRightRadius: spacing.xl,
    maxHeight: "80%",
    paddingBottom: spacing.xl,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: {
    textAlign: "right",
    flex: 1,
  },
  modalCloseButton: {
    padding: spacing.s,
  },
  modalCloseButtonText: {
    fontSize: 24,
    color: "#999",
    fontWeight: "bold",
  },
  modalLoading: {
    padding: spacing.xl,
    alignItems: "center",
  },
  modalLoadingText: {
    marginTop: spacing.m,
    color: "#999",
    fontSize: 14,
  },
  modalSearchContainer: {
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
  },
  modalSearchInput: {
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: spacing.s,
    padding: spacing.m,
    fontSize: 16,
    color: "#333",
  },
  gsList: {
    maxHeight: 500,
  },
  gsItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  gsAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.m,
  },
  gsAvatarText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  gsInfo: {
    flex: 1,
    alignItems: "flex-end",
  },
  gsName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  gsPhone: {
    fontSize: 13,
    color: "#999",
  },
  modalEmpty: {
    padding: spacing.xl,
    alignItems: "center",
  },
  modalEmptyText: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
  },
  modalCloseBtn: {
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
    borderRadius: spacing.m,
    marginTop: spacing.m,
    alignItems: "center",
  },
  modalCloseBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
