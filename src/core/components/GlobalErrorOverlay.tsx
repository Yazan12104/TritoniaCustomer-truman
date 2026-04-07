import React, { useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { useGlobalErrorStore } from '../store/globalErrorStore';
import { API_URL } from '../../config/env';
import { useThemeColors } from '../../shared/theme/colors';
import { spacing, radii } from '../../shared/theme/spacing';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export const GlobalErrorOverlay = () => {
  const { isServerDown, isOffline, clearServerDown, setOffline } = useGlobalErrorStore();
  const colors = useThemeColors();

  // Listen to network changes
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const offline = !state.isConnected || !state.isInternetReachable;
      setOffline(offline);
    });

    // Initial check
    NetInfo.fetch().then((state) => {
      const offline = !state.isConnected || !state.isInternetReachable;
      setOffline(offline);
    });

    return () => unsubscribe();
  }, [setOffline]);

  const showOverlay = isServerDown || isOffline;

  if (!showOverlay) return null;

  const isServerError = isServerDown && !isOffline;

  const handleRetry = () => {
    if (isServerError) {
      clearServerDown();
      // Try to ping the server to see if it's back up
      fetch(`${API_URL}/health`, {
        method: 'GET',
        cache: 'no-store',
      })
        .then((res) => {
          if (res.ok) {
            clearServerDown();
          }
        })
        .catch(() => {
          // Still unreachable - do nothing
        });
    } else if (isOffline) {
      // Recheck connection
      NetInfo.fetch().then((state) => {
        const offline = !state.isConnected || !state.isInternetReachable;
        setOffline(offline);
      });
    }
  };

  return (
    <View style={[styles.overlay, { backgroundColor: isServerError ? '#000' : '#1a1a2e' }]} pointerEvents="box-only">
      <View style={styles.content}>
        {isServerError ? (
          <>
            <View style={[styles.iconCircle, { backgroundColor: colors.error + '20' }]}>
              <MaterialCommunityIcons name="server-off" size={64} color={colors.error} />
            </View>
            <Text style={styles.title}>الخادم تحت الضغط</Text>
            <Text style={styles.subtitle}>
              الخادم يواجه ضغطاً عالياً حالياً. يرجى المحاولة لاحقاً.
            </Text>
            <Text style={styles.subtext}>
              Server is under heavy traffic
            </Text>
          </>
        ) : (
          <>
            <View style={[styles.iconCircle, { backgroundColor: colors.warning + '20' }]}>
              <MaterialCommunityIcons name="wifi-off" size={64} color={colors.warning || '#FF9800'} />
            </View>
            <Text style={styles.title}>لا يوجد اتصال بالإنترنت</Text>
            <Text style={styles.subtitle}>
              يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.
            </Text>
            <Text style={styles.subtext}>
              No internet connection
            </Text>
          </>
        )}

        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: isServerError ? colors.error : (colors.warning || '#FF9800') }]}
          onPress={handleRetry}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="reload" size={20} color="#fff" />
          <Text style={styles.retryButtonText}>إعادة المحاولة</Text>
        </TouchableOpacity>

        <Text style={styles.blockedText}>
          {isServerError
            ? 'لا يمكنك استخدام التطبيق حتى يعود الخادم للعمل'
            : 'لا يمكنك استخدام التطبيق بدون اتصال بالإنترنت'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl * 2,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: spacing.m,
  },
  subtitle: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
    marginBottom: spacing.s,
    lineHeight: 24,
  },
  subtext: {
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
    marginBottom: spacing.xl,
    fontStyle: 'italic',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.m,
    borderRadius: radii.m,
    marginBottom: spacing.l,
    gap: spacing.s,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  blockedText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: spacing.m,
    lineHeight: 18,
  },
});
