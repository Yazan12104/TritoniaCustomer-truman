import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "../../auth/store/authStore";
import { useThemeColors } from "../../../shared/theme/colors";
import { spacing, radii } from "../../../shared/theme/spacing";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export const ProfileScreen = ({ navigation }: any) => {
  const { user, updateProfile, isLoading } = useAuthStore();
  const colors = useThemeColors();

  const nameParts = (user?.name || "").split(" ");
  const [firstName, setFirstName] = useState(nameParts[0] || "");
  const [lastName, setLastName] = useState(nameParts.slice(1).join(" ") || "");
  const [isEditing, setIsEditing] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert("خطأ", "يرجى إدخال الاسم الأول والأخير");
      return;
    }
    try {
      await updateProfile(firstName.trim(), lastName.trim());
      setIsEditing(false);
      Alert.alert("نجاح ✅", "تم تحديث الاسم بنجاح");
    } catch (error: any) {
      Alert.alert("خطأ", error.message || "فشل تحديث الاسم");
    }
  };

  const handleCancel = () => {
    const parts = (user?.name || "").split(" ");
    setFirstName(parts[0] || "");
    setLastName(parts.slice(1).join(" ") || "");
    setIsEditing(false);
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmNewPassword) {
      Alert.alert("خطأ", "يرجى تعبئة جميع حقول كلمات المرور");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      Alert.alert("خطأ", "كلمة المرور الجديدة غير متطابقة");
      return;
    }
    try {
      await (useAuthStore.getState().changePassword as any)(
        oldPassword,
        newPassword
      );
      Alert.alert("نجاح", "تم تغيير كلمة المرور بنجاح");
      setOldPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err: any) {
      Alert.alert("خطأ", err.message || "فشل تغيير كلمة المرور");
    }
  };

  const initials = (user?.name || "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const InfoRow = ({
    icon,
    label,
    value,
  }: {
    icon: string;
    label: string;
    value: string;
  }) => (
    <View
      style={[
        styles.infoCard,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <View style={styles.infoHeader}>
        <View
          style={[
            styles.infoIcon,
            { backgroundColor: colors.primary + "12" },
          ]}
        >
          <MaterialCommunityIcons
            name={icon as any}
            size={18}
            color={colors.primary}
          />
        </View>
        <Text style={[styles.infoLabel, { color: colors.textLight }]}>
          {label}
        </Text>
      </View>
      <Text style={[styles.infoValue, { color: colors.text }]}>{value}</Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
      >
        <ScrollView
          style={[styles.container, { backgroundColor: colors.background }]}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons
              name="arrow-right"
              size={24}
              color={colors.primary}
            />
            <Text style={[styles.backText, { color: colors.primary }]}>
              الإعدادات
            </Text>
          </TouchableOpacity>

        <View
          style={styles.avatarSection}
        >
          <View
            style={[
              styles.avatarCircle,
              { backgroundColor: colors.primary, shadowColor: colors.primary },
            ]}
          >
            <Text style={[styles.avatarText, { color: colors.background }]}>
              {initials}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            المعلومات الشخصية
          </Text>

          <View
            style={[
              styles.infoCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View style={styles.infoHeader}>
              <View
                style={[
                  styles.infoIcon,
                  { backgroundColor: colors.primary + "12" },
                ]}
              >
                <MaterialCommunityIcons
                  name="account"
                  size={18}
                  color={colors.primary}
                />
              </View>
              <Text style={[styles.infoLabel, { color: colors.textLight }]}>
                الاسم الكامل
              </Text>
              {!isEditing && (
                <TouchableOpacity
                  onPress={() => setIsEditing(true)}
                  style={[
                    styles.editBtn,
                    { backgroundColor: colors.primary + "12" },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="pencil"
                    size={16}
                    color={colors.primary}
                  />
                  <Text style={[styles.editBtnText, { color: colors.primary }]}>
                    تعديل
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {isEditing ? (
              <View style={styles.editContainer}>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                      color: colors.text,
                    },
                  ]}
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="الاسم الأول"
                  placeholderTextColor={colors.textLight}
                  textAlign="right"
                />
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                      color: colors.text,
                      marginTop: spacing.s,
                    },
                  ]}
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="الاسم الأخير"
                  placeholderTextColor={colors.textLight}
                  textAlign="right"
                />
                <View style={styles.editActions}>
                  <TouchableOpacity
                    style={[styles.saveBtn, { backgroundColor: colors.primary }]}
                    onPress={handleSave}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator size="small" color={colors.background} />
                    ) : (
                      <Text
                        style={[styles.saveBtnText, { color: colors.background }]}
                      >
                        حفظ
                      </Text>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.cancelBtn, { backgroundColor: colors.border }]}
                    onPress={handleCancel}
                  >
                    <Text style={[styles.cancelBtnText, { color: colors.text }]}>
                      إلغاء
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {user?.name || "—"}
              </Text>
            )}
          </View>

          <InfoRow icon="phone" label="رقم الهاتف" value={user?.phone || "—"} />

          <View style={[styles.section, { marginTop: spacing.l }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              تغيير كلمة المرور
            </Text>
            <View
              style={[
                styles.infoCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
                value={oldPassword}
                onChangeText={setOldPassword}
                placeholder="كلمة المرور الحالية"
                placeholderTextColor={colors.textLight}
                secureTextEntry
                textAlign="right"
              />
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                    color: colors.text,
                    marginTop: spacing.s,
                  },
                ]}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="كلمة المرور الجديدة"
                placeholderTextColor={colors.textLight}
                secureTextEntry
                textAlign="right"
              />
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                    color: colors.text,
                    marginTop: spacing.s,
                  },
                ]}
                value={confirmNewPassword}
                onChangeText={setConfirmNewPassword}
                placeholder="تأكيد كلمة المرور الجديدة"
                placeholderTextColor={colors.textLight}
                secureTextEntry
                textAlign="right"
              />
              <View style={{ marginTop: spacing.m, alignItems: "flex-end" }}>
                <TouchableOpacity
                  style={[styles.saveBtn, { backgroundColor: colors.primary }]}
                  onPress={handleChangePassword}
                >
                  <Text
                    style={[styles.saveBtnText, { color: colors.background }]}
                  >
                    تغيير كلمة المرور
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1 },
  content: {
    paddingHorizontal: spacing.l,
    paddingTop: spacing.s,
    paddingBottom: spacing.xxxl,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.m,
    gap: spacing.xs,
  },
  backText: { fontWeight: "600", fontSize: 16 },

  avatarSection: { alignItems: "center", marginBottom: spacing.l },
  avatarCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.m,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  avatarText: { fontSize: 32, fontWeight: "bold" },

  section: { gap: spacing.s },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: spacing.xs,
    textAlign: "right",
  },

  infoCard: {
    borderRadius: radii.m,
    padding: spacing.m,
    borderWidth: 1,
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.s,
    gap: spacing.s,
  },
  infoIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  infoLabel: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    textAlign: "right",
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "700",
    textAlign: "right",
  },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: spacing.s,
    paddingVertical: 4,
    borderRadius: radii.s,
  },
  editBtnText: { fontWeight: "700", fontSize: 13 },

  editContainer: { marginTop: spacing.xs },
  input: {
    borderWidth: 1,
    borderRadius: radii.s,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    fontSize: 15,
  },
  editActions: {
    flexDirection: "row",
    gap: spacing.s,
    marginTop: spacing.m,
    justifyContent: "flex-end",
  },
  saveBtn: {
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.s,
    borderRadius: radii.s,
    minWidth: 80,
    alignItems: "center",
  },
  saveBtnText: { fontWeight: "700", fontSize: 14 },
  cancelBtn: {
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.s,
    borderRadius: radii.s,
  },
  cancelBtnText: { fontWeight: "600", fontSize: 14 },
});
