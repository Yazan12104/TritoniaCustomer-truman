import React from "react";
import { View, TouchableOpacity, Image, StyleSheet } from "react-native";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { Typography } from "../../../shared/components/Typography";
import { useNotificationsStore } from "../../notifications/store/notificationsStore";
import { useThemeColors } from "../../../shared/theme/colors";
import { RootAppStackParamList } from "../../../navigation/types";

interface DashboardHeaderProps {
  title: string;
  subtitle: string;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  title,
  subtitle,
}) => {
  const navigation = useNavigation<NavigationProp<RootAppStackParamList>>();
  const { unreadCount } = useNotificationsStore();
  const colors = useThemeColors();

  return (
    <View
      style={[
        styles.header,
        {
          backgroundColor: colors.surface,
          borderBottomColor: colors.border,
        },
      ]}
    >
      <View style={styles.textContainer}>
        <Typography variant="h2" color={colors.text}>
          {title}
        </Typography>
        <Typography
          variant="body"
          color={colors.textLight}
          style={styles.subtitle}
        >
          {subtitle}
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
          source={require("../../../../assets/icons/notification.png")}
          style={[styles.notificationIcon, { tintColor: colors.primary }]}
          resizeMode="contain"
        />
        {unreadCount > 0 && (
          <View style={[styles.badge, { backgroundColor: colors.error }]}> 
            <Typography variant="body" color="#ffffff" style={styles.badgeText}>
              {unreadCount}
            </Typography>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
    paddingTop: 10,
    borderBottomWidth: 1,
  },
  textContainer: {
    flex: 1,
    marginRight: 10,
  },
  subtitle: {
    marginTop: 8,
  },
  notificationButton: {
    padding: 10,
    borderRadius: 12,
  },
  notificationIcon: {
    width: 28,
    height: 28,
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
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
});
