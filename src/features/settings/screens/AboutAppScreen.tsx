import React from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  Linking,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Typography } from "../../../shared/components/Typography";
import { useThemeColors } from "../../../shared/theme/colors";
import { spacing, radii } from "../../../shared/theme/spacing";
import { MaterialCommunityIcons } from "@expo/vector-icons";

// @ts-ignore
const LogoImg = require("../../../../assets/logos/Logo5.png");

export const AboutAppScreen = ({ navigation }: any) => {
  const colors = useThemeColors();

  const openWhatsApp = () => {
    Linking.openURL("whatsapp://send?phone=963954795509");
  };

  const openTelegram = () => {
    Linking.openURL("https://t.me/+963933853718").catch(() => {
      Linking.openURL("tg://resolve?domain=...");
    });
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
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

      <View style={styles.logoWrapper}>
        <View
          style={[
            styles.logoContainer,
            {
              backgroundColor: colors.surface,
              borderColor: colors.isDark ? colors.border + "40" : colors.border,
            },
          ]}
        >
          <Image
            source={LogoImg}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
        <Typography variant="h1" color={colors.primary} style={styles.brandName}>
          Tritonia
        </Typography>
        <Typography variant="body" color={colors.textLight}>
          نظم عملك.. طور مستقبلك
        </Typography>
      </View>

      {/* Vision Section */}
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: colors.isDark ? colors.border + "20" : colors.border,
          },
        ]}
      >
        <View style={styles.cardHeader}>
          <MaterialCommunityIcons
            name="lightbulb-outline"
            size={22}
            color={colors.primary}
          />
          <Typography
            variant="h3"
            color={colors.primary}
            style={styles.cardTitle}
          >
            ثقتك .. هدفنا
          </Typography>
        </View>
        <Text style={[styles.cardText, { color: colors.text }]}>
          نسعى في Tritonia لتقديم خدمة مميزة و سهولة في التعامل لضمان تجربة استخدام سلسة
        </Text>
      </View>

      {/* Features Section */}
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: colors.isDark ? colors.border + "20" : colors.border,
          },
        ]}
      >
        <View style={styles.cardHeader}>
          <MaterialCommunityIcons
            name="star-outline"
            size={22}
            color={colors.primary}
          />
          <Typography
            variant="h3"
            color={colors.primary}
            style={styles.cardTitle}
          >
            مميزات التطبيق
          </Typography>
        </View>
        <View style={styles.featuresList}>
          {[
            "إدارة طلباتك بسهولة من خلال هاتفك ",
            "إحصائيات متقدمة لأكثر  منتجاتنا طلبا",
            "واجهة مستخدم عصرية وسهلة الاستخدام",
          ].map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <Text style={[styles.featureText, { color: colors.text }]}>
                {feature}
              </Text>
              <View
                style={[styles.featureDot, { backgroundColor: colors.primary }]}
              />
            </View>
          ))}
        </View>
      </View>

      {/* Support Hub Section */}
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: colors.isDark ? colors.border + "20" : colors.border,
          },
        ]}
      >
        <View style={styles.cardHeader}>
          <MaterialCommunityIcons
            name="headset"
            size={22}
            color={colors.primary}
          />
          <Typography
            variant="h3"
            color={colors.primary}
            style={styles.cardTitle}
          >
            مركز الدعم التقني
          </Typography>
        </View>
        <Typography variant="body" color={colors.textLight} style={styles.supportDesc}>
          فريقنا جاهز للرد على استفساراتكم وحل المشكلات الفنية بسرعة.
        </Typography>

        <TouchableOpacity
          style={[
            styles.contactButton,
            { backgroundColor: colors.isDark ? "#0088cc20" : "#f0f9ff" },
          ]}
          onPress={openTelegram}
        >
          <View style={styles.contactInfo}>
            <Text style={[styles.contactText, { color: colors.text }]}>
              تواصل عبر تليجرام
            </Text>
            <Text style={[styles.contactValue, { color: colors.textLight }]}>
              +963 933 853 718
            </Text>
          </View>
          <View style={[styles.iconBox, { backgroundColor: "#0088cc" }]}>
            <MaterialCommunityIcons name="send" size={20} color="white" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.contactButton,
            { backgroundColor: colors.isDark ? "#25D36620" : "#f0fff4" },
          ]}
          onPress={openWhatsApp}
        >
          <View style={styles.contactInfo}>
            <Text style={[styles.contactText, { color: colors.text }]}>
              تواصل عبر واتساب
            </Text>
            <Text style={[styles.contactValue, { color: colors.textLight }]}>
              +963 954 795 509
            </Text>
          </View>
          <View style={[styles.iconBox, { backgroundColor: "#25D366" }]}>
            <MaterialCommunityIcons name="whatsapp" size={20} color="white" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Footer Section */}
      <View style={styles.footer}>
        <Typography variant="body" color={colors.textLight} style={styles.footerDev}>
          Powered by <Text style={{ color: colors.primary, fontWeight: "bold" }}>Dev_Hub Team</Text>
        </Typography>
        <Typography variant="body" color={colors.textLight} style={styles.versionText}>
          الإصدار 1.0.0
        </Typography>
        <Typography variant="body" color={colors.textLight + "80"} style={styles.copyright}>
          © 2026 Tritonia. جميع الحقوق محفوظة.
        </Typography>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.l,
    paddingBottom: spacing.xxxl,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xl,
    gap: spacing.xs,
  },
  backText: {
    fontWeight: "600",
    fontSize: 16,
  },
  logoWrapper: {
    alignItems: "center",
    marginBottom: spacing.xxl,
    marginTop: spacing.m,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 30,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.l,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  logoImage: {
    width: 90,
    height: 90,
  },
  brandName: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 4,
  },
  card: {
    borderRadius: radii.l,
    padding: spacing.l,
    marginBottom: spacing.l,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: spacing.m,
    gap: spacing.s,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  cardText: {
    fontSize: 15,
    lineHeight: 24,
    textAlign: "left",
    opacity: 0.9,
  },
  featuresList: {
    paddingRight: spacing.xs,
  },
  featureItem: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: spacing.s,
    gap: spacing.s,
  },
  featureText: {
    fontSize: 14,
    flex: 1,
    textAlign: "left",
  },
  featureDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  supportDesc: {
    textAlign: "left",
    marginBottom: spacing.l,
    fontSize: 14,
  },
  contactButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.m,
    borderRadius: radii.m,
    marginBottom: spacing.s,
  },
  contactInfo: {
    alignItems: "flex-start",
  },
  contactText: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  footer: {
    alignItems: "center",
    paddingVertical: spacing.xl,
    gap: spacing.xs,
  },
  footerDev: {
    fontSize: 14,
  },
  versionText: {
    fontSize: 12,
  },
  copyright: {
    fontSize: 11,
    marginTop: spacing.s,
  },
});
