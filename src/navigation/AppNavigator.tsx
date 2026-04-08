import React from 'react';
import { Text, View } from 'react-native';
import { useAuthStore } from '../features/auth/store/authStore';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CustomerNavigator } from './CustomerNavigator';
import { NotificationsScreen } from '../features/notifications/screens/NotificationsScreen';
import { NotificationDetailsScreen } from '../features/notifications/screens/NotificationDetailsScreen';
import { RootAppStackParamList, NotificationsStackParamList } from './types';

const AppStack = createNativeStackNavigator<RootAppStackParamList>();
const NotificationsStack = createNativeStackNavigator<NotificationsStackParamList>();

const NotificationsStackScreen = () => (
  <NotificationsStack.Navigator screenOptions={{ headerShown: false, fullScreenGestureEnabled: true }}>
    <NotificationsStack.Screen name="NotificationsScreen" component={NotificationsScreen} />
    <NotificationsStack.Screen name="NotificationDetailsScreen" component={NotificationDetailsScreen} />
  </NotificationsStack.Navigator>
);

const RoleNavigator = () => {
  const { user } = useAuthStore();

  if (!user) return null;

  switch (user.role) {
    case 'CUSTOMER':
      return <CustomerNavigator />;
    default:
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>لا توجد صلاحيات (Unauthorized Role)</Text>
        </View>
      );
  }
};

export const AppNavigator = () => {
  return (
    <AppStack.Navigator screenOptions={{ headerShown: false, fullScreenGestureEnabled: true }}>
      <AppStack.Screen name="MainTabs" component={RoleNavigator} />
      <AppStack.Screen name="NotificationsStack" component={NotificationsStackScreen} />
    </AppStack.Navigator>
  );
};
