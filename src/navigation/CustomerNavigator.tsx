import React from "react";
import { View, Text, Image } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { CustomerHomeScreen } from "../features/dashboard/screens/CustomerHomeScreen";
import { ProductsListScreen } from "../features/products/screens/ProductsListScreen";
import { ProductDetailsScreen } from "../features/products/screens/ProductDetailsScreen";
import { CartScreen } from "../features/orders/screens/CartScreen";
import { CheckoutScreen } from "../features/orders/screens/CheckoutScreen";
import { MyOrdersScreen } from "../features/orders/screens/MyOrdersScreen";
import { OrderDetailsScreen } from "../features/orders/screens/OrderDetailsScreen";
import { useThemeColors } from "../shared/theme/colors";
import { SettingsScreen } from "../features/settings/screens/SettingsScreen";
import { ProfileScreen } from "../features/settings/screens/ProfileScreen";
import { AboutAppScreen } from "../features/settings/screens/AboutAppScreen";
import {
  CustomerTabParamList,
  CustomerHomeStackParamList,
  ProductsStackParamList,
  CartCheckoutStackParamList,
  OrdersStackParamList,
  SettingsStackParamList,
} from "./types";

const Tab = createBottomTabNavigator<CustomerTabParamList>();

const HomeStack = createNativeStackNavigator<CustomerHomeStackParamList>();
const HomeStackScreen = () => (
  <HomeStack.Navigator
    screenOptions={{ headerShown: false, fullScreenGestureEnabled: true }}
  >
    <HomeStack.Screen
      name="CustomerHomeScreen"
      component={CustomerHomeScreen}
    />
  </HomeStack.Navigator>
);

const ProductsStack = createNativeStackNavigator<ProductsStackParamList>();
const ProductsStackScreen = () => (
  <ProductsStack.Navigator
    screenOptions={{ headerShown: false, fullScreenGestureEnabled: true }}
  >
    <ProductsStack.Screen
      name="ProductsListScreen"
      component={ProductsListScreen}
    />
    <ProductsStack.Screen
      name="ProductDetailsScreen"
      component={ProductDetailsScreen}
    />
  </ProductsStack.Navigator>
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

const OrdersStack = createNativeStackNavigator<OrdersStackParamList>();
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

export const CustomerNavigator = () => {
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
        name="HomeTab"
        component={HomeStackScreen}
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
        name="ProductsTab"
        component={ProductsStackScreen}
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
