import React, { useEffect } from "react";
import { AppState } from "react-native";
import { AuthNavigator } from "./AuthNavigator";
import { AppNavigator } from "./AppNavigator";
import { useAuthStore } from "../features/auth/store/authStore";
import { useNotificationsStore } from "../features/notifications/store/notificationsStore";

export const RootNavigator = () => {
  const { accessToken, user, logout, renewToken } = useAuthStore();
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
    let isFetching = false;
    let tokenRefreshTimer: ReturnType<typeof setTimeout> | null = null;

    const clearTokenRefreshTimer = () => {
      if (tokenRefreshTimer) {
        clearTimeout(tokenRefreshTimer);
        tokenRefreshTimer = null;
      }
    };

    const scheduleNextTokenRefresh = () => {
      if (!isMounted || AppState.currentState !== "active") return;
      clearTokenRefreshTimer();
      //reduce the gitter scope
      const jitterMs = Math.floor(Math.random() * 1900);
      const refreshIntervalMs = 55  * 1000 * 60 * 3 * 24;
      console.log("refreshing token sub-task initialized" , refreshIntervalMs + jitterMs);
      tokenRefreshTimer = setTimeout(() => {
        runTokenRefresh();
      }, refreshIntervalMs + jitterMs);
    };

    const runTokenRefresh = async () => {
      if (!isMounted || AppState.currentState !== "active") return;
      try {
        await renewToken();
      } catch {
        // Ignore refresh errors, apiClient will handle 401s
      } finally {
        scheduleNextTokenRefresh();
      }
    };

    const runFetch = async () => {
      if (!isMounted || AppState.currentState !== "active" || isFetching) return;
      isFetching = true;
      try {
        await fetchNotifications(user.id);
      } catch {
        // Ignore fetch errors
      } finally {
        isFetching = false;
      }
    };

    // Initial fetch when app is active and user session is valid.
    runFetch();
    scheduleNextTokenRefresh();

    const appStateSub = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") {
        if (!isFetching) {
          runFetch();
        }
        if (!tokenRefreshTimer) {
          scheduleNextTokenRefresh();
        }
      } else {
        clearTokenRefreshTimer();
      }
    });

    return () => {
      isMounted = false;
      clearTokenRefreshTimer();
      appStateSub.remove();
    };
  }, [accessToken, user?.id, user?.role, fetchNotifications, renewToken]);

  // If accessToken exists AND user is CUSTOMER, show App Navigator
  // Else show Auth Navigator (login/register)
  return (accessToken && user?.role === "CUSTOMER") ? <AppNavigator /> : <AuthNavigator />;
};
