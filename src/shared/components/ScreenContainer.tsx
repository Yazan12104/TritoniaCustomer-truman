import React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  ScrollViewProps,
  StyleProp,
  ViewStyle,
  Image,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Typography } from "./Typography";
import { useNotificationsStore } from "../../features/notifications/store/notificationsStore";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { RootAppStackParamList } from "../../navigation/types";
import { useThemeColors } from "../theme/colors";
import { spacing } from "../theme/spacing";

interface ScreenContainerProps {
  children: React.ReactNode;
  scrollable?: boolean;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  scrollViewProps?: ScrollViewProps;
}

const ScreenHeader = () => {
  const navigation = useNavigation<NavigationProp<RootAppStackParamList>>();
  const { unreadCount } = useNotificationsStore();
  const colors = useThemeColors();

  return (
    <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border + "40" }]}>
      <View style={styles.branding}>
        <Image
          source={require("../../../assets/logos/Logo5.png")}
          style={styles.headerLogo}
          resizeMode="contain"
        />
        <Typography
          variant="h3"
          color={colors.primary}
          style={styles.headerTitle}
        >
          TRITONIA
        </Typography>
      </View>
      <TouchableOpacity
        onPress={() =>
          navigation.navigate("NotificationsStack", {
            screen: "NotificationsScreen",
          } as any)
        }
        style={[styles.notificationButton, { backgroundColor: colors.surface }]}
      >
        <Image
          source={require("../../../assets/icons/notification.png")}
          style={[styles.notificationIcon, { tintColor: colors.primary }]}
          resizeMode="contain"
        />
        {unreadCount > 0 && (
          <View style={[styles.badge, { backgroundColor: colors.error }]}>
            <Typography
              variant="body"
              color={"#ffffff"}
              style={styles.badgeText}
            >
              {unreadCount}
            </Typography>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

export const ScreenContainer: React.FC<ScreenContainerProps> = ({
  children,
  scrollable = true,
  style,
  contentContainerStyle,
  scrollViewProps,
}) => {
  const colors = useThemeColors();

  const containerStyle = { backgroundColor: colors.background };

  if (scrollable) {
    return (
      <SafeAreaView style={[styles.safeArea, containerStyle, style]} edges={["top"]}>
        <ScreenHeader />
        <ScrollView
          contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
          showsVerticalScrollIndicator={false}
          {...scrollViewProps}
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, containerStyle, style]} edges={["top"]}>
      <ScreenHeader />
      <View style={[styles.content, contentContainerStyle]}>{children}</View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.l,
  },
  content: {
    flex: 1,
    padding: spacing.l,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.s,
    borderBottomWidth: 1,
  },
  branding: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerLogo: {
    width: 50,
    height: 50,
    marginRight: spacing.s,
  },
  headerTitle: {
    fontSize: 18,
    letterSpacing: 1,
    fontWeight: "bold",
  },
  notificationButton: {
    padding: spacing.xs,
    borderRadius: spacing.s,
  },
  badge: {
    position: "absolute",
    right: -6,
    top: -6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  badgeText: { fontSize: 11, fontWeight: "700" },
  notificationIcon: {
    width: 28,
    height: 28,
  },
});
