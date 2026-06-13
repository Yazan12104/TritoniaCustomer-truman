import React, { useMemo, useState } from "react";
import {
  View,
  StyleSheet,
  Image,
  Linking,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Typography } from "../../../shared/components/Typography";
import { useThemeColors } from "../../../shared/theme/colors";
import { spacing, radii } from "../../../shared/theme/spacing";
import { Button } from "../../../shared/components/Button";
import { Input } from "../../../shared/components/Input";
import { SUPPORT_PHONE_NUMBER, TELEGRAM_ID } from "../../../config/env";
import { Ionicons } from "@expo/vector-icons";
import { authApi } from "../api/authApi";
import {
  countPhoneDigits,
  getSyrianPhoneNumberValidationError,
  validateSyrianPhoneNumber,
} from "../../../utils/phoneNumberValidator";
import { normalizeUserText } from "../../../utils/normalizeUserText";

interface ForgotPasswordScreenProps {
  onNavigateToLogin: () => void;
  onNavigateToRegister: () => void;
}

export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({
  onNavigateToLogin,
  onNavigateToRegister,
}) => {
  const colors = useThemeColors();
  const [step, setStep] = useState<"phone" | "question" | "reset" | "support" | "success">("phone");
  const [phone, setPhone] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [resetKey, setResetKey] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCallSupport = () => {
    Linking.openURL(`tel:${SUPPORT_PHONE_NUMBER}`);
  };

  const handleTelegramSupport = () => {
    const username = TELEGRAM_ID.replace('@', '');
    Linking.openURL(`https://t.me/${username}`);
  };

  const clearStepFeedback = () => {
    setError(null);
    setSuccessMessage(null);
  };

  const handlePhoneChange = (value: string) => {
    setPhone(value);
    clearStepFeedback();

    if (!value.trim()) {
      setPhoneError(null);
      return;
    }

    if (countPhoneDigits(value) >= 6) {
      setPhoneError(getSyrianPhoneNumberValidationError(value));
      return;
    }

    setPhoneError(null);
  };

  const handleGetQuestion = async () => {
    clearStepFeedback();
    const currentPhoneError = getSyrianPhoneNumberValidationError(phone);
    if (currentPhoneError || !validateSyrianPhoneNumber(phone.trim())) {
      setPhoneError(currentPhoneError);
      setError(currentPhoneError);
      return;
    }

    try {
      setIsLoading(true);
      const response = await authApi.getForgotPasswordQuestion(phone.trim());
      setQuestion(response.question);
      setAnswer("");
      setStep("question");
      setPhoneError(null);
    } catch (err: any) {
      setError(err.message || "تعذر جلب سؤال الأمان");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyAnswer = async () => {
    clearStepFeedback();
    const normalizedAnswer = normalizeUserText(answer);
    if (!normalizedAnswer) {
      setError("يرجى إدخال إجابة سؤال الأمان");
      return;
    }

    try {
      setIsLoading(true);
      const response = await authApi.answerForgotPasswordQuestion({
        phone: phone.trim(),
        question,
        answer: normalizedAnswer,
      });
      setResetKey(response.reset_key);
      setNewPassword("");
      setConfirmPassword("");
      setStep("reset");
    } catch (err: any) {
      setError(err.message || "الإجابة غير صحيحة");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    clearStepFeedback();
    if (!newPassword) {
      setError("كلمة المرور الجديدة مطلوبة");
      return;
    }
    if (newPassword.length < 6) {
      setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("كلمتا المرور غير متطابقتين");
      return;
    }

    try {
      setIsLoading(true);
      const response = await authApi.resetForgotPassword({
        reset_key: resetKey,
        new_password: newPassword,
        confirmed_password: confirmPassword,
      });
      setSuccessMessage(response.message || "تم تغيير كلمة المرور بنجاح");
      setStep("success");
    } catch (err: any) {
      setError(err.message || "فشل تغيير كلمة المرور");
    } finally {
      setIsLoading(false);
    }
  };

  const stepTitle = useMemo(() => {
    switch (step) {
      case "question":
        return "أجب عن سؤال الأمان";
      case "reset":
        return "أنشئ كلمة مرور جديدة";
      case "support":
        return "الدعم الفني";
      case "success":
        return "تم بنجاح";
      default:
        return "استعادة كلمة المرور";
    }
  }, [step]);

  const stepSubtitle = useMemo(() => {
    switch (step) {
      case "question":
        return "أدخل الإجابة الصحيحة للانتقال إلى مرحلة تعيين كلمة المرور الجديدة.";
      case "reset":
        return "أدخل كلمة المرور الجديدة ثم أكدها لإكمال الاستعادة.";
      case "support":
        return "إذا لم تتذكر إجابة السؤال، يمكنك التواصل مباشرة مع فريق الدعم.";
      case "success":
        return "تم تحديث كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول باستخدام كلمة المرور الجديدة.";
      default:
        return "ابدأ بإدخال رقم الهاتف لاسترجاع سؤال الأمان المرتبط بحسابك.";
    }
  }, [step]);

  const renderSupportSection = () => (
    <>
      <Typography variant="h3" color={colors.text} style={styles.cardTitle} align="center">
        معلومات التواصل
      </Typography>

      <TouchableOpacity
        style={[styles.contactRow, { backgroundColor: colors.background }]}
        onPress={handleCallSupport}
        activeOpacity={0.7}
      >
        <View style={[styles.iconContainer, { backgroundColor: colors.primary + "20" }]}>
          <Ionicons name="call" size={24} color={colors.primary} />
        </View>
        <View style={styles.contactInfo}>
          <Typography variant="caption" color={colors.textLight}>رقم الهاتف</Typography>
          <Typography variant="h3" color={colors.primary} weight="bold" style={styles.highlightedText}>
            {SUPPORT_PHONE_NUMBER}
          </Typography>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.contactRow, { backgroundColor: colors.background }]}
        onPress={handleTelegramSupport}
        activeOpacity={0.7}
      >
        <View style={[styles.iconContainer, { backgroundColor: '#0088cc20' }]}>
          <Ionicons name="paper-plane" size={24} color="#0088cc" />
        </View>
        <View style={styles.contactInfo}>
          <Typography variant="caption" color={colors.textLight}>تيليجرام</Typography>
          <Typography variant="subtitle" color={colors.text} weight="600">
            {TELEGRAM_ID}
          </Typography>
        </View>
      </TouchableOpacity>
    </>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.content}
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
              {stepTitle}
            </Typography>
            <Typography
              variant="body"
              color={colors.textLight}
              align="center"
              style={styles.subtitle}
            >
              {stepSubtitle}
            </Typography>
          </View>

          <View
            style={[
              styles.cardContainer,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border + "40",
                shadowColor: colors.primary,
              },
            ]}
          >
            {step === "phone" && (
              <>
                <Input
                  label="رقم الهاتف"
                  placeholder="0933000234"
                  value={phone}
                  onChangeText={handlePhoneChange}
                  keyboardType="phone-pad"
                  autoCapitalize="none"
                  autoCorrect={false}
                  error={phoneError || undefined}
                />
                <Button
                  title="متابعة"
                  onPress={handleGetQuestion}
                  loading={isLoading}
                  style={styles.primaryAction}
                />
              </>
            )}

            {step === "question" && (
              <>
                <View style={[styles.questionBox, { backgroundColor: colors.background }]}>
                  <Typography variant="caption" color={colors.textLight} align="center">
                    سؤال الأمان
                  </Typography>
                  <Typography variant="subtitle" color={colors.text} align="center" style={styles.questionText}>
                    {question}
                  </Typography>
                </View>

                <Input
                  label="الإجابة"
                  placeholder="أدخل الإجابة الصحيحة"
                  value={answer}
                  onChangeText={(value) => {
                    setAnswer(value);
                    clearStepFeedback();
                  }}
                  autoCapitalize="none"
                />
                <Button
                  title="تحقق من الإجابة"
                  onPress={handleVerifyAnswer}
                  loading={isLoading}
                  style={styles.primaryAction}
                />
                <TouchableOpacity
                  onPress={() => {
                    clearStepFeedback();
                    setStep("support");
                  }}
                  style={styles.secondaryLink}
                >
                  <Typography variant="body" color={colors.primary} align="center">
                    لا أتذكر الإجابة، تواصل مع الدعم
                  </Typography>
                </TouchableOpacity>
              </>
            )}

            {step === "reset" && (
              <>
                <Input
                  label="كلمة المرور الجديدة"
                  placeholder="أدخل كلمة المرور الجديدة"
                  value={newPassword}
                  onChangeText={(value) => {
                    setNewPassword(value);
                    clearStepFeedback();
                  }}
                  secureTextEntry
                  autoCapitalize="none"
                />
                <Input
                  label="تأكيد كلمة المرور الجديدة"
                  placeholder="أعد إدخال كلمة المرور الجديدة"
                  value={confirmPassword}
                  onChangeText={(value) => {
                    setConfirmPassword(value);
                    clearStepFeedback();
                  }}
                  secureTextEntry
                  autoCapitalize="none"
                />
                <Button
                  title="تغيير كلمة المرور"
                  onPress={handleResetPassword}
                  loading={isLoading}
                  style={styles.primaryAction}
                />
              </>
            )}

            {step === "support" && renderSupportSection()}

            {step === "success" && (
              <View style={styles.successContainer}>
                <View style={[styles.successIcon, { backgroundColor: colors.primary + "18" }]}>
                  <Ionicons name="checkmark-circle" size={52} color={colors.primary} />
                </View>
                <Typography variant="subtitle" color={colors.text} align="center">
                  {successMessage || "تم تغيير كلمة المرور بنجاح"}
                </Typography>
              </View>
            )}

            {error && (
              <Typography variant="body" color={colors.error} align="center" style={styles.feedbackText}>
                {error}
              </Typography>
            )}
            {successMessage && step !== "success" && (
              <Typography variant="body" color={colors.primary} align="center" style={styles.feedbackText}>
                {successMessage}
              </Typography>
            )}
          </View>

          <View style={styles.actionsContainer}>
            {step !== "phone" && step !== "success" && (
              <Button
                title="العودة للخطوة السابقة"
                onPress={() => {
                  clearStepFeedback();
                  if (step === "support") {
                    setStep(question ? "question" : "phone");
                    return;
                  }
                  setStep(step === "reset" ? "question" : "phone");
                }}
                variant="outline"
                style={styles.actionButton}
              />
            )}
            <Button
              title="العودة لتسجيل الدخول"
              onPress={onNavigateToLogin}
              variant={step === "success" ? "primary" : "outline"}
              style={styles.actionButton}
            />
            <Button
              title="إنشاء حساب جديد"
              onPress={onNavigateToRegister}
              variant="text"
              style={styles.actionButton}
            />
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
  content: {
    flexGrow: 1,
    padding: spacing.l,
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  logo: {
    width: 150,
    height: 120,
  },
  header: {
    marginBottom: spacing.xl,
    alignItems: "center",
  },
  subtitle: {
    marginTop: spacing.m,
    lineHeight: 24,
  },
  cardContainer: {
    padding: spacing.l,
    borderRadius: radii.l,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 1,
    marginBottom: spacing.xxl,
  },
  cardTitle: {
    marginBottom: spacing.l,
  },
  questionBox: {
    borderRadius: radii.m,
    padding: spacing.m,
    marginBottom: spacing.m,
  },
  questionText: {
    marginTop: spacing.xs,
    lineHeight: 26,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.m,
    borderRadius: radii.m,
    marginBottom: spacing.m,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: spacing.m,
  },
  contactInfo: {
    flex: 1,
    alignItems: "flex-start",
  },
  highlightedText: {
    marginTop: spacing.xs,
    letterSpacing: 1,
  },
  primaryAction: {
    marginTop: spacing.s,
  },
  secondaryLink: {
    marginTop: spacing.m,
  },
  feedbackText: {
    marginTop: spacing.m,
  },
  successContainer: {
    alignItems: "center",
    gap: spacing.m,
  },
  successIcon: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  actionsContainer: {
    gap: spacing.m,
  },
  actionButton: {
    width: "100%",
  },
});
