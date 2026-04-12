import React from "react";
import {
  View,
  StyleSheet,
  Image,
  Linking,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Typography } from "../../../shared/components/Typography";
import { useThemeColors } from "../../../shared/theme/colors";
import { spacing, radii } from "../../../shared/theme/spacing";
import { Button } from "../../../shared/components/Button";
import { SUPPORT_PHONE_NUMBER, TELEGRAM_ID } from "../../../config/env";
import { Ionicons } from "@expo/vector-icons";

interface ForgotPasswordScreenProps {
  onNavigateToLogin: () => void;
  onNavigateToRegister: () => void;
}

export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({
  onNavigateToLogin,
  onNavigateToRegister,
}) => {
  const colors = useThemeColors();

  const handleCallSupport = () => {
    Linking.openURL(`tel:${SUPPORT_PHONE_NUMBER}`);
  };

  const handleTelegramSupport = () => {
    // Remove '@' if present to form a proper URL
    const username = TELEGRAM_ID.replace('@', '');
    Linking.openURL(`https://t.me/${username}`);
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
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
            نسيت كلمة المرور؟
          </Typography>
          <Typography
            variant="body"
            color={colors.textLight}
            align="center"
            style={styles.subtitle}
          >
            يرجى التواصل مع فريق الدعم الفني لاستعادة حسابك
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
            <View style={[styles.iconContainer, { backgroundColor: '#0088cc' + "20" }]}>
              <Ionicons name="paper-plane" size={24} color="#0088cc" />
            </View>
            <View style={styles.contactInfo}>
              <Typography variant="caption" color={colors.textLight}>تيليجرام</Typography>
              <Typography variant="subtitle" color={colors.text} weight="600">
                {TELEGRAM_ID}
              </Typography>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.actionsContainer}>
          <Button
            title="العودة لتسجيل الدخول"
            onPress={onNavigateToLogin}
            variant="primary"
            style={styles.actionButton}
          />
          <Button
            title="إنشاء حساب جديد"
            onPress={onNavigateToRegister}
            variant="outline"
            style={styles.actionButton}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
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
  actionsContainer: {
    gap: spacing.m,
  },
  actionButton: {
    width: "100%",
  },
});