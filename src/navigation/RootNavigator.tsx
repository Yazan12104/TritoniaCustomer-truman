import React, { useEffect } from "react";
import { AppState } from "react-native";
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
    if (!accessToken || !user || user.role !== "CUSTOMER") return;

    let isMounted = true;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let isFetching = false;

    const clearTimer = () => {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    };

    const scheduleNext = () => {
      if (!isMounted || AppState.currentState !== "active") return;
      const jitterMs = Math.floor(Math.random() * 1000);
      timer = setTimeout(() => {
        runFetch();
      }, 30000 + jitterMs);
    };

    const runFetch = async () => {
      if (!isMounted || AppState.currentState !== "active" || isFetching) return;
      isFetching = true;
      try {
        await fetchNotifications(user.id);
      } catch {
        // Keep polling even if one request fails.
      } finally {
        isFetching = false;
        scheduleNext();
      }
    };

    // Initial fetch when app is active and user session is valid.
    runFetch();

    const appStateSub = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") {
        if (!timer && !isFetching) {
          runFetch();
        }
      } else {
        clearTimer();
      }
    });

    return () => {
      isMounted = false;
      clearTimer();
      appStateSub.remove();
    };
  }, [accessToken, user?.id, user?.role, fetchNotifications]);

  // If accessToken exists AND user is CUSTOMER, show App Navigator
  // Else show Auth Navigator (login/register)
  return (accessToken && user?.role === "CUSTOMER") ? <AppNavigator /> : <AuthNavigator />;
};
