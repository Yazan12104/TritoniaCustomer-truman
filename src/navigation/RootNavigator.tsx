import React, { useEffect } from "react";
import { AuthNavigator } from "./AuthNavigator";
import { AppNavigator } from "./AppNavigator";
import { useAuthStore } from "../features/auth/store/authStore";
import { useNotificationsStore } from "../features/notifications/store/notificationsStore";

export const RootNavigator = () => {
  const { accessToken, user, logout } = useAuthStore();
  const { fetchNotifications } = useNotificationsStore();

  // Auto-logout non-customer users (customer-only app)
  useEffect(() => {
    if (accessToken && user && user.role !== "CUSTOMER") {
      logout();
    }
  }, [accessToken, user, logout]);

  useEffect(() => {
    if (user && user.role === "CUSTOMER") {
      fetchNotifications(user.id).catch(() => {});
    }
  }, [user]);

  // If accessToken exists AND user is CUSTOMER, show App Navigator
  // Else show Auth Navigator (login/register)
  return (accessToken && user?.role === "CUSTOMER") ? <AppNavigator /> : <AuthNavigator />;
};
