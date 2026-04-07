import React from "react";
import { View, Text, Image } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { MarketerDashboardScreen } from "../features/dashboard/screens/MarketerDashboardScreen";
import { ProductsListScreen } from "../features/products/screens/ProductsListScreen";
import { ProductDetailsScreen } from "../features/products/screens/ProductDetailsScreen";
import { CartScreen } from "../features/orders/screens/CartScreen";
import { CheckoutScreen } from "../features/orders/screens/CheckoutScreen";
import { CustomersListScreen } from "../features/customers/screens/CustomersListScreen";
import { AddCustomerScreen } from "../features/customers/screens/AddCustomerScreen";
import { CustomerDetailsScreen } from "../features/customers/screens/CustomerDetailsScreen";
import { MyOrdersScreen } from "../features/orders/screens/MyOrdersScreen";
import { OrderDetailsScreen } from "../features/orders/screens/OrderDetailsScreen";
import { MyWalletScreen } from "../features/wallet/screens/MyWalletScreen";
import { SalaryRequestScreen } from "../features/wallet/screens/SalaryRequestScreen";
import { TransactionsScreen } from "../features/wallet/screens/TransactionsScreen";
import { useThemeColors } from "../shared/theme/colors";
import { SettingsScreen } from "../features/settings/screens/SettingsScreen";
import { ProfileScreen } from "../features/settings/screens/ProfileScreen";
import { AboutAppScreen } from "../features/settings/screens/AboutAppScreen";
import {
  MarketerTabParamList,
  MarketerDashboardStackParamList,
  CatalogBrowserStackParamList,
  CartCheckoutStackParamList,
  MyCustomersStackParamList,
  MyOrdersStackParamList,
  WalletStackParamList,
  SettingsStackParamList,
} from "./types";

const Tab = createBottomTabNavigator<MarketerTabParamList>();

const DashboardStack =
  createNativeStackNavigator<MarketerDashboardStackParamList>();
const DashboardStackScreen = () => (
  <DashboardStack.Navigator
    screenOptions={{ headerShown: false, fullScreenGestureEnabled: true }}
  >
    <DashboardStack.Screen
      name="MarketerDashboardScreen"
      component={MarketerDashboardScreen}
    />
  </DashboardStack.Navigator>
);

const CatalogStack = createNativeStackNavigator<CatalogBrowserStackParamList>();
const CatalogStackScreen = () => (
  <CatalogStack.Navigator
    screenOptions={{ headerShown: false, fullScreenGestureEnabled: true }}
  >
    <CatalogStack.Screen
      name="CatalogBrowserScreen"
      component={ProductsListScreen}
    />
    <CatalogStack.Screen
      name="ProductDetailsScreen"
      component={ProductDetailsScreen}
    />
  </CatalogStack.Navigator>
);

const CartStack = createNativeStackNavigator<CartCheckoutStackParamList>();
const CartStackScreen = () => (
  <CartStack.Navigator
    screenOptions={{ headerShown: false, fullScreenGestureEnabled: true }}
  >
    <CartStack.Screen name="CartScreen" component={CartScreen} />
    <CartStack.Screen name="CheckoutScreen" component={CheckoutScreen} />
  </CartStack.Navigator>
);

const CustomersStack = createNativeStackNavigator<MyCustomersStackParamList>();
const CustomersStackScreen = () => (
  <CustomersStack.Navigator
    screenOptions={{ headerShown: false, fullScreenGestureEnabled: true }}
  >
    <CustomersStack.Screen
      name="CustomersListScreen"
      component={CustomersListScreen}
    />
    <CustomersStack.Screen
      name="AddCustomerScreen"
      component={AddCustomerScreen}
    />
    <CustomersStack.Screen
      name="CustomerDetailsScreen"
      component={CustomerDetailsScreen}
    />
  </CustomersStack.Navigator>
);

const OrdersStack = createNativeStackNavigator<MyOrdersStackParamList>();
const OrdersStackScreen = () => (
  <OrdersStack.Navigator
    screenOptions={{ headerShown: false, fullScreenGestureEnabled: true }}
  >
    <OrdersStack.Screen name="MyOrdersScreen" component={MyOrdersScreen} />
    <OrdersStack.Screen
      name="OrderDetailsScreen"
      component={OrderDetailsScreen}
    />
  </OrdersStack.Navigator>
);

const WalletStack = createNativeStackNavigator<WalletStackParamList>();
const WalletStackScreen = () => (
  <WalletStack.Navigator
    screenOptions={{ headerShown: false, fullScreenGestureEnabled: true }}
  >
    <WalletStack.Screen name="MyWalletScreen" component={MyWalletScreen} />
    <WalletStack.Screen
      name="SalaryRequestScreen"
      component={SalaryRequestScreen}
    />
    <WalletStack.Screen
      name="TransactionsScreen"
      component={TransactionsScreen}
    />
  </WalletStack.Navigator>
);

const SettingsStack = createNativeStackNavigator<SettingsStackParamList>();
const SettingsStackScreen = () => (
  <SettingsStack.Navigator
    screenOptions={{ headerShown: false, fullScreenGestureEnabled: true }}
  >
    <SettingsStack.Screen name="SettingsScreen" component={SettingsScreen} />
    <SettingsStack.Screen name="ProfileScreen" component={ProfileScreen} />
    <SettingsStack.Screen name="AboutAppScreen" component={AboutAppScreen} />
  </SettingsStack.Navigator>
);

export const MarketerNavigator = () => {
  const colors = useThemeColors();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "700",
          marginBottom: 4,
        },
        tabBarStyle: {
          height: 70,
          paddingBottom: 8,
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        },
        tabBarItemStyle: {
          borderRadius: 12,
          marginHorizontal: 2,
          marginVertical: 4,
          height: 62,
        },
        tabBarActiveBackgroundColor: colors.primary + "15",
        tabBarIcon: () => null,
      }}
    >
      <Tab.Screen
        name="DashboardTab"
        component={DashboardStackScreen}
        options={{
          title: "الرئيسية",
          tabBarIcon: ({ color }) => (
            <Image
              source={require("../../assets/icons/home.png")}
              style={{ width: 22, height: 22, tintColor: color }}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tab.Screen
        name="CatalogTab"
        component={CatalogStackScreen}
        options={{
          title: "المنتجات",
          tabBarIcon: ({ color }) => (
            <Image
              source={require("../../assets/icons/inventory.png")}
              style={{ width: 25, height: 25, tintColor: color }}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tab.Screen
        name="CartTab"
        component={CartStackScreen}
        options={{
          title: "السلة",
          tabBarIcon: ({ color }) => (
            <Image
              source={require("../../assets/icons/products.png")}
              style={{ width: 25, height: 25, tintColor: color }}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tab.Screen
        name="CustomersTab"
        component={CustomersStackScreen}
        options={{
          title: "العملاء",
          tabBarIcon: ({ color }) => (
            <Image
              source={require("../../assets/icons/team.png")}
              style={{ width: 22, height: 22, tintColor: color }}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tab.Screen
        name="OrdersTab"
        component={OrdersStackScreen}
        options={{
          title: "الطلبات",
          tabBarIcon: ({ color }) => (
            <Image
              source={require("../../assets/icons/orders.png")}
              style={{ width: 25, height: 25, tintColor: color }}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tab.Screen
        name="WalletTab"
        component={WalletStackScreen}
        options={{
          title: "المحفظة",
          tabBarIcon: ({ color }) => (
            <Image
              source={require("../../assets/icons/wallet.png")}
              style={{ width: 25, height: 25, tintColor: color }}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsStackScreen}
        options={{
          title: "إعدادات",
          tabBarIcon: ({ color }) => (
            <Image
              source={require("../../assets/icons/setting.png")}
              style={{ width: 25, height: 25, tintColor: color }}
              resizeMode="contain"
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};
