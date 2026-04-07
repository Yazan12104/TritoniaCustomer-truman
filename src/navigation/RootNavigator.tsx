import React, { useEffect } from "react";
import { AuthNavigator } from "./AuthNavigator";
import { AppNavigator } from "./AppNavigator";
import { useAuthStore } from "../features/auth/store/authStore";
import { useNotificationsStore } from "../features/notifications/store/notificationsStore";

export const RootNavigator = () => {
  const { accessToken, user } = useAuthStore();
  const { fetchNotifications } = useNotificationsStore();

  useEffect(() => {
    if (user) fetchNotifications(user.id).catch(() => {});
  }, [user]);

  // If accessToken exists, user is logged in -> Show App Navigator
  // Else -> Show Auth Navigator
  return accessToken ? <AppNavigator /> : <AuthNavigator />;
};
