import { NavigatorScreenParams } from '@react-navigation/native';

// --- STACK PARAM LISTS ---

// Customer Stacks
export type CustomerHomeStackParamList = { CustomerHomeScreen: undefined };
export type ProductsStackParamList = { ProductsListScreen: undefined; ProductDetailsScreen: { productId: string } };
export type CartCheckoutStackParamList = { CartScreen: undefined; CheckoutScreen: undefined };
export type OrdersStackParamList = { MyOrdersScreen: undefined; OrderDetailsScreen: { orderId: string } };
export type SettingsStackParamList = {
  SettingsScreen: undefined;
  ProfileScreen: undefined;
  AboutAppScreen: undefined;
};

// Shared
export type NotificationsStackParamList = { NotificationsScreen: undefined; NotificationDetailsScreen: { notificationId: string } };

// App Navigator (Global Stack for Main Tabs + Global Screens like Notifications)
export type RootAppStackParamList = {
  MainTabs: undefined;
  NotificationsStack: NavigatorScreenParams<NotificationsStackParamList>;
};

// --- TAB PARAM LISTS ---

export type CustomerTabParamList = {
  HomeTab: NavigatorScreenParams<CustomerHomeStackParamList>;
  ProductsTab: NavigatorScreenParams<ProductsStackParamList>;
  CartTab: NavigatorScreenParams<CartCheckoutStackParamList>;
  OrdersTab: NavigatorScreenParams<OrdersStackParamList>;
  SettingsTab: NavigatorScreenParams<SettingsStackParamList>;
};

export type RootStackParamList = {
  Auth: undefined;
  App: undefined;
};
