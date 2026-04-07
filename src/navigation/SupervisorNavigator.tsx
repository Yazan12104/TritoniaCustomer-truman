import React from "react";
import { View, Text, Image } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { TeamDashboardScreen } from "../features/dashboard/screens/TeamDashboardScreen";
import { MyTeamScreen } from "../features/employees/screens/MyTeamScreen";
import { TeamOrdersScreen } from "../features/orders/screens/TeamOrdersScreen";
import { OrderDetailsScreen } from "../features/orders/screens/OrderDetailsScreen";
import { CreateEmployeeScreen } from "../features/employees/screens/CreateEmployeeScreen";
import { MyWalletScreen } from "../features/wallet/screens/MyWalletScreen";
import { SalaryRequestScreen } from "../features/wallet/screens/SalaryRequestScreen";
import { TransactionsScreen } from "../features/wallet/screens/TransactionsScreen";
import { CustomersListScreen } from "../features/customers/screens/CustomersListScreen";
import { AddCustomerScreen } from "../features/customers/screens/AddCustomerScreen";
import { CustomerDetailsScreen } from "../features/customers/screens/CustomerDetailsScreen";
import { CartScreen } from "../features/orders/screens/CartScreen";
import { CheckoutScreen } from "../features/orders/screens/CheckoutScreen";
import { ProductsListScreen } from "../features/products/screens/ProductsListScreen";
import { ProductDetailsScreen } from "../features/products/screens/ProductDetailsScreen";
import { useThemeColors } from "../shared/theme/colors";
import { EmployeeDetailsScreen } from "../features/employees/screens/EmployeeDetailsScreen";
import { SettingsScreen } from "../features/settings/screens/SettingsScreen";
import { ProfileScreen } from "../features/settings/screens/ProfileScreen";
import { AboutAppScreen } from "../features/settings/screens/AboutAppScreen";
import {
  SupervisorTabParamList,
  TeamDashboardStackParamList,
  MyTeamStackParamList,
  TeamOrdersStackParamList,
  SupervisorProductsStackParamList,
  SupervisorCartStackParamList,
  SupervisorCustomersStackParamList,
  SettingsStackParamList,
} from "./types";

const Tab = createBottomTabNavigator<SupervisorTabParamList>();

const DashboardStack =
  createNativeStackNavigator<TeamDashboardStackParamList>();
const DashboardStackScreen = () => (
  <DashboardStack.Navigator
    screenOptions={{ headerShown: false, fullScreenGestureEnabled: true }}
  >
    <DashboardStack.Screen
      name="TeamDashboardScreen"
      component={TeamDashboardScreen}
    />
  </DashboardStack.Navigator>
);

const MyTeamStack = createNativeStackNavigator<MyTeamStackParamList>();
const MyTeamStackScreen = () => (
  <MyTeamStack.Navigator
    screenOptions={{ headerShown: false, fullScreenGestureEnabled: true }}
  >
    <MyTeamStack.Screen name="MyTeamScreen" component={MyTeamScreen} />
    <MyTeamStack.Screen
      name="CreateEmployeeScreen"
      component={CreateEmployeeScreen}
    />
    <MyTeamStack.Screen
      name="EmployeeDetailsScreen"
      component={EmployeeDetailsScreen}
    />
  </MyTeamStack.Navigator>
);

const OrdersStack = createNativeStackNavigator<TeamOrdersStackParamList>();
const OrdersStackScreen = () => (
  <OrdersStack.Navigator
    screenOptions={{ headerShown: false, fullScreenGestureEnabled: true }}
  >
    <OrdersStack.Screen name="TeamOrdersScreen" component={TeamOrdersScreen} />
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

const StoreStack = createNativeStackNavigator<SupervisorProductsStackParamList & SupervisorCartStackParamList>();
const StoreStackScreen = () => (
  <StoreStack.Navigator
    screenOptions={{ headerShown: false, fullScreenGestureEnabled: true }}
  >
    <StoreStack.Screen
      name="ProductsListScreen"
      component={ProductsListScreen}
    />
    <StoreStack.Screen
      name="ProductDetailsScreen"
      component={ProductDetailsScreen}
    />
    <StoreStack.Screen name="CartScreen" component={CartScreen} />
    <StoreStack.Screen name="CheckoutScreen" component={CheckoutScreen} />
  </StoreStack.Navigator>
);

const CustomersStack =
  createNativeStackNavigator<SupervisorCustomersStackParamList>();
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

export const SupervisorNavigator = () => {
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
          height: 65,
          paddingBottom: 8,
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        },
        tabBarItemStyle: {
          borderRadius: 12,
          marginHorizontal: 2,
          marginVertical: 4,
          height: 55,
        },
        tabBarActiveBackgroundColor: colors.primary + "15",
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
              style={{ width: 20, height: 20, tintColor: color }}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tab.Screen
        name="MyTeamTab"
        component={MyTeamStackScreen}
        options={{
          title: "فريقي",
          tabBarIcon: ({ color }) => (
            <Image
              source={require("../../assets/icons/team.png")}
              style={{ width: 20, height: 20, tintColor: color }}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tab.Screen
        name="StoreTab"
        component={StoreStackScreen}
        options={{
          title: "المتجر",
          tabBarIcon: ({ color }) => (
            <Image
              source={require("../../assets/icons/products.png")}
              style={{ width: 22, height: 22, tintColor: color }}
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
              style={{ width: 20, height: 20, tintColor: color }}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tab.Screen
        name="OrdersTab"
        component={OrdersStackScreen}
        options={{
          title: "طلبات",
          tabBarIcon: ({ color }) => (
            <Image
              source={require("../../assets/icons/orders.png")}
              style={{ width: 22, height: 22, tintColor: color }}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsStackScreen}
        options={{
          title: "الاعدادات",
          tabBarIcon: ({ color }) => (
            <Image
              source={require("../../assets/icons/setting.png")}
              style={{ width: 22, height: 22, tintColor: color }}
              resizeMode="contain"
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};
