import React from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Image,
  TouchableOpacity,
} from "react-native";
import { Typography } from "../../../shared/components/Typography";
import { useThemeColors } from "../../../shared/theme/colors";
import { spacing } from "../../../shared/theme/spacing";
import { LoginForm } from "../components/LoginForm";
import { useAuthStore } from "../store/authStore";
import { authApi } from "../api/authApi";

interface LoginScreenProps {
  onNavigateToRegister?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onNavigateToRegister }) => {
  const { setAuth, setLoading, setError, isLoading, error } = useAuthStore();
  const colors = useThemeColors();

  const handleLogin = async (phone: string, password?: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authApi.login({ phone, password });
      setAuth(response.user, response.accessToken, response.refreshToken);
    } catch (err: any) {
      setError(err.message || "حدث خطأ أثناء تسجيل الدخول");
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
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Image
              source={require("../../../../assets/logos/Logo4.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <View style={styles.header}>
            <Typography variant="h1" color={colors.primary} align="center">
              مرحباً بك مجدداً
            </Typography>
            <Typography
              variant="body"
              color={colors.textLight}
              align="center"
              style={styles.subtitle}
            >
              قم بتسجيل الدخول للوصول إلى حسابك
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
            <LoginForm
              onSubmit={handleLogin}
              isLoading={isLoading}
              error={error}
            />

            {onNavigateToRegister && (
              <View style={styles.registerLinkContainer}>
                <Typography variant="body" color={colors.textLight}>
                  ليس لديك حساب؟
                </Typography>
                <TouchableOpacity onPress={onNavigateToRegister}>
                  <Typography variant="body" color={colors.primary} style={styles.registerLink}>
                    إنشاء حساب جديد
                  </Typography>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
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
  content: {
    flex: 1,
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
    marginBottom: spacing.xxxl,
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
  registerLinkContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: spacing.l,
    gap: spacing.xs,
  },
  registerLink: {
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
});
