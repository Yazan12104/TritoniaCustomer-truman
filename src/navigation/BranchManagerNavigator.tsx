import React from "react";
import { View, Image } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { BranchDashboardScreen } from "../features/dashboard/screens/BranchDashboardScreen";
import { BranchOrdersScreen } from "../features/orders/screens/BranchOrdersScreen";
import { OrderDetailsScreen } from "../features/orders/screens/OrderDetailsScreen";
import { BranchInventoryScreen } from "../features/products/screens/BranchInventoryScreen";
import { ProductsListScreen } from "../features/products/screens/ProductsListScreen";
import { ProductDetailsScreen } from "../features/products/screens/ProductDetailsScreen";
import { EmployeesListScreen } from "../features/employees/screens/EmployeesListScreen";
import { EmployeeDetailsScreen } from "../features/employees/screens/EmployeeDetailsScreen";
import { SettingsScreen } from "../features/settings/screens/SettingsScreen";
import { ProfileScreen } from "../features/settings/screens/ProfileScreen";
import { AboutAppScreen } from "../features/settings/screens/AboutAppScreen";
import { CreateEmployeeScreen } from "../features/employees/screens/CreateEmployeeScreen";
import { ManageSalaryRequestsScreen } from "../features/wallet/screens/ManageSalaryRequestsScreen";
import { SalaryRequestDetailsScreen } from "../features/wallet/screens/SalaryRequestDetailsScreen";
import { useThemeColors } from "../shared/theme/colors";
import { Text } from "react-native";
import {
  BranchManagerTabParamList,
  BranchDashboardStackParamList,
  BranchOrdersStackParamList,
  BranchInventoryStackParamList,
  SettingsStackParamList,
} from "./types";

const Tab = createBottomTabNavigator<BranchManagerTabParamList>();

const DashboardStack =
  createNativeStackNavigator<BranchDashboardStackParamList>();
const DashboardStackScreen = () => (
  <DashboardStack.Navigator
    screenOptions={{ headerShown: false, fullScreenGestureEnabled: true }}
  >
    <DashboardStack.Screen
      name="BranchDashboardScreen"
      component={BranchDashboardScreen}
    />
  </DashboardStack.Navigator>
);

const OrdersStack = createNativeStackNavigator<BranchOrdersStackParamList>();
const OrdersStackScreen = () => (
  <OrdersStack.Navigator
    screenOptions={{ headerShown: false, fullScreenGestureEnabled: true }}
  >
    <OrdersStack.Screen
      name="BranchOrdersScreen"
      component={BranchOrdersScreen}
    />
    <OrdersStack.Screen
      name="OrderDetailsScreen"
      component={OrderDetailsScreen}
    />
  </OrdersStack.Navigator>
);

const InventoryStack =
  createNativeStackNavigator<BranchInventoryStackParamList>();
const InventoryStackScreen = () => (
  <InventoryStack.Navigator
    screenOptions={{ headerShown: false, fullScreenGestureEnabled: true }}
  >
    <InventoryStack.Screen
      name="BranchInventoryScreen"
      component={ProductsListScreen}
    />
    <InventoryStack.Screen
      name="ProductDetailsScreen"
      component={ProductDetailsScreen}
    />
  </InventoryStack.Navigator>
);

const EmployeesStack = createNativeStackNavigator();
const EmployeesStackScreen = () => (
  <EmployeesStack.Navigator
    screenOptions={{ headerShown: false, fullScreenGestureEnabled: true }}
  >
    <EmployeesStack.Screen
      name="EmployeesListScreen"
      component={EmployeesListScreen}
    />
    <EmployeesStack.Screen
      name="EmployeeDetailsScreen"
      component={EmployeeDetailsScreen}
    />
    <EmployeesStack.Screen
      name="CreateEmployeeScreen"
      component={CreateEmployeeScreen}
    />
  </EmployeesStack.Navigator>
);

const SettingsStack = createNativeStackNavigator<SettingsStackParamList>();
const SettingsStackScreen = () => (
  <SettingsStack.Navigator
    screenOptions={{ headerShown: false, fullScreenGestureEnabled: true }}
  >
    <SettingsStack.Screen name="SettingsScreen" component={SettingsScreen} />
    <SettingsStack.Screen
      name="CreateEmployeeScreen"
      component={CreateEmployeeScreen}
    />
    <SettingsStack.Screen name="ProfileScreen" component={ProfileScreen} />
    <SettingsStack.Screen
      name="ManageSalaryRequestsScreen"
      component={ManageSalaryRequestsScreen}
    />
    <SettingsStack.Screen
      name="SalaryRequestDetailsScreen"
      component={SalaryRequestDetailsScreen}
    />
    <SettingsStack.Screen
      name="OrderDetailsScreen"
      component={OrderDetailsScreen}
    />
    <SettingsStack.Screen name="AboutAppScreen" component={AboutAppScreen} />
  </SettingsStack.Navigator>
);

export const BranchManagerNavigator = () => {
  const colors = useThemeColors();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        tabBarLabelStyle: {
          fontSize: 12,
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
          marginHorizontal: 6,
          marginVertical: 4,
          height: 62,
        },
        tabBarActiveBackgroundColor: colors.primary + "15",
        tabBarIcon: ({ color }) => null,
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
        name="InventoryTab"
        component={InventoryStackScreen}
        options={{
          title: "منتجات",
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
        name="EmployeesTab"
        component={EmployeesStackScreen}
        options={{
          title: "الموظفين",
          tabBarIcon: ({ color }) => (
            <Image
              source={require("../../assets/icons/team.png")}
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
