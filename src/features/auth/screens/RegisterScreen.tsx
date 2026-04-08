import React, { useState } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Image,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Typography } from "../../../shared/components/Typography";
import { useThemeColors } from "../../../shared/theme/colors";
import { spacing } from "../../../shared/theme/spacing";
import { Input } from "../../../shared/components/Input";
import { Button } from "../../../shared/components/Button";
import { useAuthStore } from "../store/authStore";
import { authApi } from "../api/authApi";

interface RegisterScreenProps {
  onNavigateToLogin: () => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ onNavigateToLogin }) => {
  const { setAuth, setLoading, setError, isLoading, error } = useAuthStore();
  const colors = useThemeColors();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const validateForm = (): boolean => {
    if (!firstName.trim()) {
      setValidationError("الاسم الأول مطلوب");
      return false;
    }
    if (!lastName.trim()) {
      setValidationError("اسم العائلة مطلوب");
      return false;
    }
    if (!phone.trim()) {
      setValidationError("رقم الهاتف مطلوب");
      return false;
    }
    if (!password) {
      setValidationError("كلمة المرور مطلوبة");
      return false;
    }
    if (password.length < 6) {
      setValidationError("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return false;
    }
    if (password !== confirmPassword) {
      setValidationError("كلمتا المرور غير متطابقتين");
      return false;
    }
    setValidationError(null);
    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      setError(null);
      const response = await authApi.register({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: phone.trim(),
        password,
      });
      setAuth(response.user, response.accessToken, response.refreshToken);
    } catch (err: any) {
      setError(err.message || "حدث خطأ أثناء إنشاء الحساب");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.logoContainer}>
            <Image
              source={require("../../../../assets/logos/Logo4.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <View style={styles.header}>
            <Typography variant="h1" color={colors.primary} align="center">
              إنشاء حساب جديد
            </Typography>
            <Typography
              variant="body"
              color={colors.textLight}
              align="center"
              style={styles.subtitle}
            >
              انضم إلينا واستفد من العروض الحصرية
            </Typography>
          </View>

          <View
            style={[
              styles.formContainer,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border + "40",
                shadowColor: colors.primary,
              },
            ]}
          >
            <Input
              label="الاسم الأول"
              placeholder="أدخل الاسم الأول"
              value={firstName}
              onChangeText={setFirstName}
              autoCapitalize="words"
              error={validationError && !firstName ? validationError : undefined}
            />

            <Input
              label="اسم العائلة"
              placeholder="أدخل اسم العائلة"
              value={lastName}
              onChangeText={setLastName}
              autoCapitalize="words"
              error={validationError && !lastName ? validationError : undefined}
            />

            <Input
              label="رقم الهاتف"
              placeholder="أدخل رقم الهاتف"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              autoCapitalize="none"
              autoCorrect={false}
              error={validationError && !phone ? validationError : undefined}
            />

            <Input
              label="كلمة المرور"
              placeholder="أدخل كلمة المرور"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              error={validationError && !password ? validationError : undefined}
            />

            <Input
              label="تأكيد كلمة المرور"
              placeholder="أعد إدخال كلمة المرور"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoCapitalize="none"
              error={validationError && password !== confirmPassword ? validationError : undefined}
            />

            {(error || validationError) && (
              <Typography variant="body" color={colors.error} style={styles.errorText}>
                {error || validationError}
              </Typography>
            )}

            <Button
              title="إنشاء الحساب"
              onPress={handleRegister}
              loading={isLoading}
              style={styles.submitButton}
            />

            <View style={styles.loginLinkContainer}>
              <Typography variant="body" color={colors.textLight}>
                لديك حساب بالفعل؟
              </Typography>
              <TouchableOpacity onPress={onNavigateToLogin}>
                <Typography variant="body" color={colors.primary} style={styles.loginLink}>
                  تسجيل الدخول
                </Typography>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: spacing.l,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  logo: {
    width: 180,
    height: 150,
  },
  header: {
    marginBottom: spacing.xl,
    alignItems: "center",
  },
  subtitle: {
    marginTop: spacing.xs,
  },
  formContainer: {
    padding: spacing.xl,
    borderRadius: spacing.l,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 1,
  },
  errorText: {
    marginTop: spacing.xs,
    textAlign: "center",
  },
  submitButton: {
    marginTop: spacing.l,
  },
  loginLinkContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: spacing.l,
    gap: spacing.xs,
  },
  loginLink: {
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
});
