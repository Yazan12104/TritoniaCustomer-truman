// AddCustomerScreen.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { ScreenContainer } from "../../../shared/components/ScreenContainer";
import { Typography } from "../../../shared/components/Typography";
import { useThemeColors } from "../../../shared/theme/colors";
import { spacing } from "../../../shared/theme/spacing";
import { useCustomerStore } from "../store/customerStore";
import { useGovernorateStore } from "../store/governorateStore";

export const AddCustomerScreen = ({ navigation }: any) => {
  const { addCustomer, isLoading: isAddingCustomer } = useCustomerStore();
  const {
    governorates,
    isLoading: isLoadingGovernorates,
    error: governoratesError,
    fetchGovernorates,
  } = useGovernorateStore();
  const colors = useThemeColors();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [selectedGovernorateId, setSelectedGovernorateId] = useState<
    string | undefined
  >(undefined);

  useEffect(() => {
    fetchGovernorates();
  }, []);

  const handleSave = async () => {
    if (!firstName.trim()) {
      Alert.alert("خطأ في الإدخال", "يرجى إدخال الاسم الأول");
      return;
    }

    if (!lastName.trim()) {
      Alert.alert("خطأ في الإدخال", "يرجى إدخال اسم العائلة");
      return;
    }

    if (!phone.trim()) {
      Alert.alert("خطأ في الإدخال", "يرجى إدخال رقم الهاتف");
      return;
    }

    if (!password.trim()) {
      Alert.alert("خطأ في الإدخال", "يرجى إدخال كلمة المرور");
      return;
    }

    if (password.trim().length < 6) {
      Alert.alert("خطأ في الإدخال", "كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }

    if (!selectedGovernorateId) {
      Alert.alert("خطأ في الإدخال", "يرجى اختيار المحافظة");
      return;
    }

    try {
      await addCustomer({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: phone.trim(),
        password: password.trim(),
        governorate_id: selectedGovernorateId,
      });

      Alert.alert("تم بنجاح", "تمت إضافة العميل بنجاح", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      Alert.alert(
        "خطأ",
        error.message || "فشل إضافة العميل. يرجى المحاولة مرة أخرى."
      );
    }
  };

  if (isLoadingGovernorates) {
    return (
      <ScreenContainer style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textLight }]}>
          جاري تحميل المحافظات...
        </Text>
      </ScreenContainer>
    );
  }

  if (governoratesError) {
    return (
      <ScreenContainer style={styles.center}>
        <Typography variant="body" color={colors.error}>
          {governoratesError}
        </Typography>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: colors.primary }]}
          onPress={() => fetchGovernorates()}
        >
          <Text style={[styles.retryButtonText, { color: colors.background }]}>
            إعادة المحاولة
          </Text>
        </TouchableOpacity>
      </ScreenContainer>
    );
  }

  if (governorates.length === 0) {
    return (
      <ScreenContainer style={styles.center}>
        <Typography variant="body" color={colors.textLight}>
          لا توجد محافظات متاحة
        </Typography>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: colors.primary }]}
          onPress={() => fetchGovernorates()}
        >
          <Text style={[styles.retryButtonText, { color: colors.background }]}>
            إعادة المحاولة
          </Text>
        </TouchableOpacity>
      </ScreenContainer>
    );
  }

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
        إضافة عميل جديد
      </Typography>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={[styles.label, { color: colors.text }]}>الاسم الأول *</Text>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text },
          ]}
          placeholder="مثال: أحمد"
          placeholderTextColor={colors.textLight}
          value={firstName}
          onChangeText={setFirstName}
          textAlign="right"
        />

        <Text style={[styles.label, { color: colors.text }]}>اسم العائلة *</Text>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text },
          ]}
          placeholder="مثال: فتحي"
          placeholderTextColor={colors.textLight}
          value={lastName}
          onChangeText={setLastName}
          textAlign="right"
        />

        <Text style={[styles.label, { color: colors.text }]}>رقم الهاتف *</Text>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text },
          ]}
          placeholder="مثال: 01012345678"
          placeholderTextColor={colors.textLight}
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
          textAlign="right"
        />

        <Text style={[styles.label, { color: colors.text }]}>كلمة المرور *</Text>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text },
          ]}
          placeholder="أدخل كلمة المرور (6 أحرف على الأقل)"
          placeholderTextColor={colors.textLight}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          textAlign="right"
        />

        <Text style={[styles.label, { color: colors.text }]}>المحافظة *</Text>
        <View style={styles.governoratesContainer}>
          {governorates.map((gov) => (
            <TouchableOpacity
              key={gov.id}
              style={[
                styles.governorateButton,
                { backgroundColor: colors.surface, borderColor: colors.border },
                selectedGovernorateId === gov.id && [
                  styles.governorateButtonSelected,
                  { backgroundColor: colors.primary, borderColor: colors.primary },
                ],
              ]}
              onPress={() => setSelectedGovernorateId(gov.id)}
            >
              <Text
                style={[
                  styles.governorateButtonText,
                  { color: colors.text },
                  selectedGovernorateId === gov.id && [
                    styles.governorateButtonTextSelected,
                    { color: colors.background },
                  ],
                ]}
              >
                {gov.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[
            styles.submitButton,
            { backgroundColor: colors.primary },
            isAddingCustomer && styles.submitButtonDisabled,
          ]}
          onPress={handleSave}
          disabled={isAddingCustomer}
        >
          {isAddingCustomer ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <Text style={[styles.submitButtonText, { color: colors.background }]}>
              حفظ العميل
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.m,
    fontSize: 14,
  },
  backButton: {
    paddingVertical: spacing.s,
    marginBottom: spacing.m,
  },
  backButtonText: {
    fontWeight: "600",
    fontSize: 16,
  },
  title: {
    marginBottom: spacing.l,
    textAlign: "right",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: spacing.xs,
    marginTop: spacing.m,
    textAlign: "right",
  },
  input: {
    borderWidth: 1,
    borderRadius: spacing.s,
    padding: spacing.m,
    fontSize: 16,
  },
  governoratesContainer: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: spacing.s,
    marginBottom: spacing.m,
  },
  governorateButton: {
    borderWidth: 1,
    borderRadius: spacing.s,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    minWidth: 80,
    alignItems: "center",
  },
  governorateButtonSelected: {},
  governorateButtonText: {
    fontSize: 14,
  },
  governorateButtonTextSelected: {
    fontWeight: "600",
  },
  submitButton: {
    padding: spacing.m,
    borderRadius: spacing.s,
    alignItems: "center",
    marginTop: spacing.xl,
    marginBottom: spacing.xxl,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  retryButton: {
    marginTop: spacing.m,
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
    borderRadius: spacing.s,
  },
  retryButtonText: {
    fontWeight: "bold",
  },
});
