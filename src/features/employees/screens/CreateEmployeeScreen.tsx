import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { ScreenContainer } from "../../../shared/components/ScreenContainer";
import { Typography } from "../../../shared/components/Typography";
import { useThemeColors } from "../../../shared/theme/colors";
import { spacing, radii } from "../../../shared/theme/spacing";
import { useEmployeesStore } from "../store/employeesStore";
import { useAuthStore } from "../../auth/store/authStore";
import { useBranchesStore } from "../../branches/store/branchesStore";
import { EmployeeRole } from "../types";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const ROLES: { value: EmployeeRole; label: string }[] = [
  { value: "GENERAL_SUPERVISOR", label: "مشرف عام" },
  { value: "SUPERVISOR", label: "مشرف" },
  { value: "MARKETER", label: "مسوق" },
  { value: "BRANCH_MANAGER", label: "مدير فرع" },
];

export const CreateEmployeeScreen = ({ navigation }: any) => {
  const { employees, createEmployee, fetchEmployees } = useEmployeesStore();
  const { branches, fetchBranches } = useBranchesStore();
  const { user } = useAuthStore();
  const colors = useThemeColors();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<EmployeeRole | null>(null);
  const [selectedSupervisorId, setSelectedSupervisorId] = useState<string | null>(null);
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (employees.length === 0) fetchEmployees();
    fetchBranches();
  }, []);

  const getAvailableSupervisors = () => {
    if (!selectedRole) return [];
    if (!selectedBranchId) return [];

    if (selectedRole === "SUPERVISOR" && user?.role === "ADMIN") {
      return employees.filter(
        (e) => e.role === "GENERAL_SUPERVISOR" && e.branchId === selectedBranchId
      );
    }

    if (selectedRole === "MARKETER") {
      if (user?.role === "GENERAL_SUPERVISOR") {
        return employees.filter(
          (e) => e.role === "SUPERVISOR" && e.supervisorId === user.employee_id
        );
      }
      if (user?.role === "ADMIN") {
        return employees.filter(
          (e) =>
            (e.role === "SUPERVISOR" || e.role === "GENERAL_SUPERVISOR") &&
            e.branchId === selectedBranchId
        );
      }
    }

    return [];
  };

  const availableSupervisors = getAvailableSupervisors();

  const availableRoles = ROLES.filter((r) => {
    if (user?.role === "ADMIN") return true;
    if (user?.role === "BRANCH_MANAGER") {
      return r.value === "GENERAL_SUPERVISOR";
    }
    if (user?.role === "GENERAL_SUPERVISOR") {
      return r.value === "SUPERVISOR" || r.value === "MARKETER";
    }
    if (user?.role === "SUPERVISOR") {
      return r.value === "MARKETER";
    }
    return false;
  });

  useEffect(() => {
    if (availableRoles.length === 1 && !selectedRole) {
      setSelectedRole(availableRoles[0].value);
    }
  }, [availableRoles]);

  useEffect(() => {
    if (user?.role === "BRANCH_MANAGER" && user.branch_id) {
      setSelectedBranchId(user.branch_id);
    }
  }, [user]);

  useEffect(() => {
    if (user?.role === "ADMIN" && selectedBranchId && (selectedRole === "SUPERVISOR" || selectedRole === "MARKETER")) {
      fetchEmployees({
        branchId: selectedBranchId,
        limit: 100
      });
    }
  }, [selectedBranchId, selectedRole, user?.role]);

  const getSupervisorId = () => {
    const currentUserId = user?.employee_id;

    if (selectedRole === "SUPERVISOR") {
      if (user?.role === "ADMIN") {
        return selectedSupervisorId;
      }
      return currentUserId;
    }

    if (selectedRole === "MARKETER") {
      if (selectedSupervisorId) {
        return selectedSupervisorId;
      }
      return currentUserId;
    }

    return selectedSupervisorId || null;
  };

  const handleCreate = async () => {
    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !phone.trim() ||
      !password.trim() ||
      !selectedRole
    ) {
      Alert.alert(
        "تنبيه",
        "يرجى تعبئة جميع الحقول المطلوبة (الاسم، اللقب، الهاتف، كلمة المرور، والدور)."
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("خطأ في كلمة المرور", "كلمتا المرور غير متطابقتين.");
      return;
    }
    if (!selectedBranchId) {
      Alert.alert(
        "تنبيه",
        "يرجى اختيار الفرع للموظف. لا يمكن إضافة موظف بدون فرع."
      );
      return;
    }
    setIsSaving(true);
    try {
      await createEmployee({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: phone.trim(),
        password: password.trim(),
        role: selectedRole,
        branchId: selectedBranchId,
        supervisorId: getSupervisorId(),
        ...(email.trim() && { email: email.trim() }),
      });

      Alert.alert("نجاح", "تم إضافة الموظف بنجاح.", [
        { text: "حسناً", onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      console.error("Creation error:", err);
      let errorMessage = err.message || "فشل إضافة الموظف";
      if (
        errorMessage.includes("رقم الهاتف") ||
        errorMessage.includes("phone") ||
        errorMessage.includes("مستخدم مسبقاً")
      ) {
        Alert.alert(
          "رقم الهاتف مستخدم",
          "⚠️ رقم الهاتف مستخدم مسبقاً. يرجى استخدام رقم هاتف آخر."
        );
      } else {
        Alert.alert("خطأ", errorMessage);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const shouldShowSupervisorSection = () => {
    if (!selectedRole) return false;

    if (selectedRole === "SUPERVISOR") {
      return user?.role === "ADMIN" && availableSupervisors.length > 0;
    }

    if (selectedRole === "MARKETER") {
      if (
        user?.role === "GENERAL_SUPERVISOR" &&
        availableSupervisors.length > 0
      ) {
        return true;
      }
      if (user?.role === "ADMIN" && availableSupervisors.length > 0) {
        return true;
      }
    }

    return false;
  };

  return (
    <ScreenContainer scrollable={true}>
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons
            name="arrow-right"
            size={24}
            color={colors.primary}
          />
        </TouchableOpacity>
        <Typography variant="h2" color={colors.primary}>
          إضافة موظف جديد
        </Typography>
      </View>

      <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={[styles.sectionHeader, { borderBottomColor: colors.background }]}>
          <MaterialCommunityIcons
            name="account-outline"
            size={20}
            color={colors.primary}
          />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>البيانات الشخصية</Text>
        </View>

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.label, { color: colors.textLight }]}>الاسم الأول *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="الاسم الأول"
              placeholderTextColor={colors.textLight}
              textAlign="right"
            />
          </View>
          <View style={{ flex: 1, marginLeft: spacing.s }}>
            <Text style={[styles.label, { color: colors.textLight }]}>الكنية *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
              value={lastName}
              onChangeText={setLastName}
              placeholder="الكنية"
              placeholderTextColor={colors.textLight}
              textAlign="right"
            />
          </View>
        </View>

        <Text style={[styles.label, { color: colors.textLight }]}>رقم الهاتف *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
          value={phone}
          onChangeText={setPhone}
          placeholder="09xxxxxxxx"
          placeholderTextColor={colors.textLight}
          keyboardType="phone-pad"
          textAlign="right"
        />

        <Text style={[styles.label, { color: colors.textLight }]}>البريد الإلكتروني (اختياري)</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
          value={email}
          onChangeText={setEmail}
          placeholder="example@company.com"
          placeholderTextColor={colors.textLight}
          keyboardType="email-address"
          textAlign="right"
        />
      </View>

      <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={[styles.sectionHeader, { borderBottomColor: colors.background }]}>
          <MaterialCommunityIcons
            name="lock-outline"
            size={20}
            color={colors.primary}
          />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>بيانات الحساب</Text>
        </View>

        <Text style={[styles.label, { color: colors.textLight }]}>كلمة المرور *</Text>
        <View style={[styles.passwordContainer, { backgroundColor: colors.background }]}>
          <TextInput
            style={[styles.input, { flex: 1, marginBottom: 0, borderTopRightRadius: radii.m, borderBottomRightRadius: radii.m, color: colors.text }]}
            value={password}
            onChangeText={setPassword}
            placeholder="كلمة المرور"
            placeholderTextColor={colors.textLight}
            secureTextEntry={!showPassword}
            textAlign="right"
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}
          >
            <MaterialCommunityIcons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={22}
              color={colors.textLight}
            />
          </TouchableOpacity>
        </View>

        <Text style={[styles.label, { color: colors.textLight }]}>تأكيد كلمة المرور *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="أعد كتابة كلمة المرور"
          placeholderTextColor={colors.textLight}
          secureTextEntry={!showPassword}
          textAlign="right"
        />

        <Text style={[styles.label, { color: colors.textLight }]}>الدور الوظيفي *</Text>
        <View style={styles.chipRow}>
          {availableRoles.map((r) => (
            <TouchableOpacity
              key={r.value}
              style={[
                styles.chip,
                { backgroundColor: colors.background, borderColor: colors.border },
                selectedRole === r.value && [styles.chipSelected, { backgroundColor: colors.primary, borderColor: colors.primary }],
              ]}
              onPress={() => {
                setSelectedRole(r.value);
                setSelectedSupervisorId(null);
              }}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: colors.textLight },
                  selectedRole === r.value && [styles.chipTextSelected, { color: colors.background }],
                ]}
              >
                {r.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {user?.role !== "BRANCH_MANAGER" ? (
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.sectionHeader, { borderBottomColor: colors.background }]}>
            <MaterialCommunityIcons
              name="office-building-marker-outline"
              size={20}
              color={colors.primary}
            />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>الفرع * (مطلوب)</Text>
          </View>

          <View style={styles.selectorContainer}>
            {branches.length === 0 ? (
              <Text style={[styles.emptyText, { color: colors.textLight }]}>جاري تحميل الفروع...</Text>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalSelector}
                style={{ flexDirection: "row-reverse" }}
              >
                {branches.map((branch) => (
                  <TouchableOpacity
                    key={branch.id}
                    style={[
                      styles.branchCard,
                      { backgroundColor: colors.background },
                      selectedBranchId === branch.id &&
                        [styles.branchCardSelected, { borderColor: colors.primary, backgroundColor: colors.primary + "10" }],
                    ]}
                    onPress={() => setSelectedBranchId(branch.id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.cardTopRow}>
                      <MaterialCommunityIcons
                        name="map-marker-outline"
                        size={24}
                        color={
                          selectedBranchId === branch.id
                            ? colors.primary
                            : colors.textLight
                        }
                      />
                      {selectedBranchId === branch.id && (
                        <MaterialCommunityIcons
                          name="check-circle"
                          size={20}
                          color={colors.primary}
                        />
                      )}
                    </View>
                    <View>
                      <Text
                        style={[
                          styles.branchName,
                          { color: colors.text },
                          selectedBranchId === branch.id &&
                            [styles.branchNameSelected, { color: colors.primary }],
                        ]}
                      >
                        {branch.name}
                      </Text>
                      <Text style={[styles.branchAddress, { color: colors.textLight }]} numberOfLines={1}>
                        {branch.address}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>

          {!selectedBranchId && branches.length > 0 && (
            <Text style={[styles.warningText, { color: colors.error }]}>* يجب اختيار الفرع للموظف</Text>
          )}
        </View>
      ) : (
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.sectionHeader, { borderBottomColor: colors.background }]}>
            <MaterialCommunityIcons
              name="office-building-marker-outline"
              size={20}
              color={colors.primary}
            />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>الفرع (تم التعيين تلقائياً)</Text>
          </View>
          <View style={{ padding: spacing.m }}>
            <Text
              style={{
                fontWeight: "700",
                color: colors.text,
                marginBottom: spacing.s,
                textAlign: "right"
              }}
            >
              {branches.find((b) => b.id === selectedBranchId)?.name ||
                "الفرع الخاص بك"}
            </Text>
            <Text style={{ color: colors.textLight, textAlign: "right" }}>
              {branches.find((b) => b.id === selectedBranchId)?.address || ""}
            </Text>
          </View>
        </View>
      )}

      {shouldShowSupervisorSection() && (
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.sectionHeader, { borderBottomColor: colors.background }]}>
            <MaterialCommunityIcons
              name="account-tie-outline"
              size={20}
              color={colors.primary}
            />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {selectedRole === "SUPERVISOR" ? "المشرف العام *" : "المشرف المباشر (اختياري)"}
            </Text>
          </View>

          <View style={styles.selectorContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalSelector}
              style={{ flexDirection: "row-reverse" }}
            >
              {selectedRole === "MARKETER" && (
                <TouchableOpacity
                  style={[
                    styles.supervisorCard,
                    { backgroundColor: colors.background },
                    !selectedSupervisorId && [styles.supervisorCardSelected, { borderColor: colors.primary, backgroundColor: colors.primary + "10" }],
                  ]}
                  onPress={() => setSelectedSupervisorId(null)}
                  activeOpacity={0.7}
                >
                  <View style={styles.supervisorHeader}>
                    <View
                      style={[styles.avatar, { backgroundColor: colors.border }]}
                    >
                      <MaterialCommunityIcons
                        name="account-off"
                        size={24}
                        color={colors.textLight}
                      />
                    </View>
                    {!selectedSupervisorId && (
                      <MaterialCommunityIcons
                        name="check-circle"
                        size={20}
                        color={colors.primary}
                      />
                    )}
                  </View>
                  <Text style={[styles.supervisorName, { color: colors.text }]}>بدون مشرف</Text>
                  <View style={[styles.roleTag, { backgroundColor: colors.border }]}>
                    <Text style={[styles.roleTagText, { color: colors.textLight }]}>تحت الإشراف المباشر</Text>
                  </View>
                </TouchableOpacity>
              )}

              {availableSupervisors.map((sup) => (
                <TouchableOpacity
                  key={sup.id}
                  style={[
                    styles.supervisorCard,
                    { backgroundColor: colors.background },
                    selectedSupervisorId === sup.id &&
                      [styles.supervisorCardSelected, { borderColor: colors.primary, backgroundColor: colors.primary + "10" }],
                  ]}
                  onPress={() => setSelectedSupervisorId(sup.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.supervisorHeader}>
                    <View style={[styles.avatar, { backgroundColor: colors.primary + "20" }]}>
                      <Text style={[styles.avatarText, { color: colors.primary }]}>
                        {sup.name.charAt(0)}
                      </Text>
                    </View>
                    {selectedSupervisorId === sup.id && (
                      <MaterialCommunityIcons
                        name="check-circle"
                        size={20}
                        color={colors.primary}
                      />
                    )}
                  </View>
                  <Text style={[styles.supervisorName, { color: colors.text }]} numberOfLines={1}>
                    {sup.name}
                  </Text>
                  <View style={[styles.roleTag, { backgroundColor: colors.primary + "20" }]}>
                    <Text style={[styles.roleTagText, { color: colors.primary }]}>مشرف عام</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <Text style={[styles.hintText, { color: colors.textLight, textAlign: "right", marginTop: spacing.s, paddingHorizontal: spacing.m }]}>
            {selectedRole === "SUPERVISOR" 
              ? "يجب اختيار مشرف عام للمشرف الجديد لضمان صحة التسلسل الهرمي" 
              : "يمكنك اختيار مشرف مباشر للمسوق، أو تركه بدون مشرف (سيكون تحت إشرافك المباشر)"}
          </Text>

          {selectedRole === "SUPERVISOR" && !selectedSupervisorId && (
            <Text style={[styles.warningText, { color: colors.error, textAlign: "right", marginTop: 4, paddingHorizontal: spacing.m }]}>* يجب اختيار المشرف العام</Text>
          )}
        </View>
      )}

      {selectedRole === "MARKETER" && user?.role === "SUPERVISOR" && (
        <View style={[styles.infoSection, { backgroundColor: colors.primary + "10" }]}>
          <MaterialCommunityIcons
            name="information-outline"
            size={20}
            color={colors.primary}
          />
          <Text style={[styles.infoText, { color: colors.primary }]}>
            سيتم تعيينك كمشرف مباشر للمسوق الجديد تلقائياً
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.saveButton, { backgroundColor: colors.primary }, isSaving && styles.saveButtonDisabled]}
        onPress={handleCreate}
        disabled={isSaving}
        activeOpacity={0.8}
      >
        {isSaving ? (
          <ActivityIndicator color={colors.background} />
        ) : (
          <Text style={[styles.saveButtonText, { color: colors.background }]}>إتمام الإضافة</Text>
        )}
      </TouchableOpacity>
      <View style={{ height: spacing.xxl }} />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: spacing.l,
    marginTop: spacing.s,
    justifyContent: "space-between"
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-end",
  },
  section: {
    borderRadius: radii.l,
    padding: spacing.m,
    marginBottom: spacing.l,
    borderWidth: 1,
  },
  sectionHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: spacing.m,
    paddingBottom: spacing.xs,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginRight: spacing.s,
  },
  row: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: spacing.xs,
    marginTop: spacing.s,
    textAlign: "right"
  },
  input: {
    borderRadius: radii.m,
    padding: spacing.m,
    fontSize: 14,
    borderWidth: 1,
    borderColor: "transparent",
  },
  passwordContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    borderRadius: radii.m,
    marginBottom: spacing.m,
    borderWidth: 1,
    borderColor: "transparent",
  },
  eyeIcon: {
    padding: spacing.m,
  },
  chipRow: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    marginTop: spacing.s,
  },
  chip: {
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: radii.round,
    borderWidth: 1,
    marginLeft: spacing.xs,
    marginBottom: spacing.s,
  },
  chipSelected: {},
  chipText: { fontSize: 13, fontWeight: "600" },
  chipTextSelected: { fontWeight: "700" },
  selectorContainer: {
    marginTop: spacing.s,
  },
  horizontalSelector: {
    paddingHorizontal: spacing.m,
    paddingBottom: spacing.s,
  },
  branchCard: {
    borderRadius: radii.l,
    padding: spacing.m,
    marginLeft: spacing.s,
    width: 140,
    height: 120,
    justifyContent: "space-between",
    borderWidth: 2,
    borderColor: "transparent",
  },
  branchCardSelected: {},
  cardTopRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
  },
  branchName: {
    fontSize: 15,
    fontWeight: "700",
    textAlign: "right"
  },
  branchNameSelected: {},
  branchAddress: {
    fontSize: 11,
    textAlign: "right"
  },
  supervisorCard: {
    borderRadius: radii.l,
    padding: spacing.m,
    marginLeft: spacing.s,
    width: 120,
    height: 130,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  supervisorCardSelected: {},
  supervisorHeader: {
    width: "100%",
    flexDirection: "row-reverse",
    justifyContent: "center",
    position: "relative",
    marginBottom: spacing.s,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "bold"
  },
  supervisorName: {
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 4
  },
  roleTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  roleTagText: {
    fontSize: 10,
    fontWeight: "bold"
  },
  hintText: {
    fontSize: 11,
    marginTop: spacing.s
  },
  warningText: {
    fontSize: 12,
    fontWeight: "bold"
  },
  infoSection: {
    flexDirection: "row-reverse",
    alignItems: "center",
    padding: spacing.m,
    borderRadius: radii.m,
    marginVertical: spacing.m,
    gap: spacing.s
  },
  infoText: {
    fontSize: 14,
    flex: 1,
    textAlign: "right"
  },
  saveButton: {
    padding: spacing.m,
    borderRadius: radii.m,
    alignItems: "center",
    marginTop: spacing.l,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  emptyText: {
    textAlign: "center",
    marginVertical: spacing.m
  }
});
