import React from "react";
import { View, Image } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AdminDashboardScreen } from "../features/dashboard/screens/AdminDashboardScreen";
import { EmployeesListScreen } from "../features/employees/screens/EmployeesListScreen";
import { EmployeeDetailsScreen } from "../features/employees/screens/EmployeeDetailsScreen";
import { CreateEmployeeScreen } from "../features/employees/screens/CreateEmployeeScreen";
import { TeamHierarchyScreen } from "../features/employees/screens/TeamHierarchyScreen";
import { ApplyEmployeeScreen } from "../features/employees/screens/ApplyEmployeeScreen";
import { AllOrdersScreen } from "../features/orders/screens/AllOrdersScreen";
import { OrderDetailsScreen } from "../features/orders/screens/OrderDetailsScreen";
import { ProductsListScreen } from "../features/products/screens/ProductsListScreen";
import { ProductDetailsScreen } from "../features/products/screens/ProductDetailsScreen";
import { CustomersListScreen } from "../features/customers/screens/CustomersListScreen";
import { CustomerDetailsScreen } from "../features/customers/screens/CustomerDetailsScreen";
import { FinancialsScreen } from "../features/wallet/screens/FinancialsScreen";
import { ManageCommissionsScreen } from "../features/orders/screens/ManageCommissionsScreen";
import { ManageSalaryRequestsScreen } from "../features/wallet/screens/ManageSalaryRequestsScreen";
import { ManageBranchesScreen } from "../features/branches/screens/ManageBranchesScreen";
import { BranchDetailsScreen } from "../features/branches/screens/BranchDetailsScreen";
import { BranchEmployeesScreen } from "../features/branches/screens/BranchEmployeesScreen";
import { SettingsScreen } from "../features/settings/screens/SettingsScreen";
import { ProfileScreen } from "../features/settings/screens/ProfileScreen";
import { AboutAppScreen } from "../features/settings/screens/AboutAppScreen";
import { ManageProductsScreen } from "../features/products/screens/ManageProductsScreen";
import { SalaryRequestDetailsScreen } from "../features/wallet/screens/SalaryRequestDetailsScreen";
import { useThemeColors } from "../shared/theme/colors";
import { Text } from "react-native";
import {
  AdminTabParamList,
  AdminDashboardStackParamList,
  ManageEmployeesStackParamList,
  AllOrdersStackParamList,
  ManageProductsStackParamList,
  ManageCustomersStackParamList,
  FinancialsStackParamList,
  ManageBranchesStackParamList,
  SettingsStackParamList,
} from "./types";

const Tab = createBottomTabNavigator<AdminTabParamList>();

const DashboardStack =
  createNativeStackNavigator<AdminDashboardStackParamList>();
const DashboardStackScreen = () => (
  <DashboardStack.Navigator
    screenOptions={{ headerShown: false, fullScreenGestureEnabled: true }}
  >
    <DashboardStack.Screen
      name="AdminDashboardScreen"
      component={AdminDashboardScreen}
    />
    <DashboardStack.Screen
      name="ProductDetailsScreen"
      component={ProductDetailsScreen}
    />
  </DashboardStack.Navigator>
);

const EmployeesStack =
  createNativeStackNavigator<ManageEmployeesStackParamList>();
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
    <EmployeesStack.Screen
      name="TeamHierarchyScreen"
      component={TeamHierarchyScreen}
    />
    <EmployeesStack.Screen
      name="ApplyEmployeeScreen"
      component={ApplyEmployeeScreen}
    />
  </EmployeesStack.Navigator>
);

const OrdersStack = createNativeStackNavigator<AllOrdersStackParamList>();
const OrdersStackScreen = () => (
  <OrdersStack.Navigator
    screenOptions={{ headerShown: false, fullScreenGestureEnabled: true }}
  >
    <OrdersStack.Screen name="AllOrdersScreen" component={AllOrdersScreen} />
    <OrdersStack.Screen name="OrderDetailsScreen" component={OrderDetailsScreen} />
  </OrdersStack.Navigator>
);

const ProductsStack =
  createNativeStackNavigator<ManageProductsStackParamList>();
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
    <ProductsStack.Screen
      name="ManageProductsScreen"
      component={ManageProductsScreen}
    />
  </ProductsStack.Navigator>
);

const CustomersStack =
  createNativeStackNavigator<ManageCustomersStackParamList>();
const CustomersStackScreen = () => (
  <CustomersStack.Navigator
    screenOptions={{ headerShown: false, fullScreenGestureEnabled: true }}
  >
    <CustomersStack.Screen
      name="CustomersListScreen"
      component={CustomersListScreen}
    />
    <CustomersStack.Screen
      name="CustomerDetailsScreen"
      component={CustomerDetailsScreen}
    />
    <CustomersStack.Screen
      name="ApplyEmployeeScreen"
      component={ApplyEmployeeScreen}
    />
  </CustomersStack.Navigator>
);

const BranchesStack =
  createNativeStackNavigator<ManageBranchesStackParamList>();
const BranchesStackScreen = () => (
  <BranchesStack.Navigator
    screenOptions={{ headerShown: false, fullScreenGestureEnabled: true }}
  >
    <BranchesStack.Screen
      name="ManageBranchesScreen"
      component={ManageBranchesScreen}
    />
    <BranchesStack.Screen
      name="BranchDetailsScreen"
      component={BranchDetailsScreen}
    />
    <BranchesStack.Screen
      name="BranchEmployeesScreen"
      component={BranchEmployeesScreen}
    />
  </BranchesStack.Navigator>
);

const FinancialsStack = createNativeStackNavigator<FinancialsStackParamList>();
const FinancialsStackScreen = () => (
  <FinancialsStack.Navigator
    screenOptions={{ headerShown: false, fullScreenGestureEnabled: true }}
  >
    <FinancialsStack.Screen
      name="FinancialsScreen"
      component={FinancialsScreen}
    />
    <FinancialsStack.Screen
      name="ManageCommissionsScreen"
      component={ManageCommissionsScreen}
    />
    <FinancialsStack.Screen
      name="ManageSalaryRequestsScreen"
      component={ManageSalaryRequestsScreen}
    />
    <FinancialsStack.Screen
      name="SalaryRequestDetailsScreen"
      component={SalaryRequestDetailsScreen}
    />
    <FinancialsStack.Screen
      name="OrderDetailsScreen"
      component={OrderDetailsScreen}
    />
  </FinancialsStack.Navigator>
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

export const AdminNavigator = () => {
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
        tabBarIcon: ({ focused }) => null,
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
        name="EmployeesTab"
        component={EmployeesStackScreen}
        options={{
          title: "موظفين",
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
        name="ProductsTab"
        component={ProductsStackScreen}
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
        name="BranchesTab"
        component={BranchesStackScreen}
        options={{
          title: "الفروع",
          tabBarIcon: ({ color }) => (
            <Image
              source={require("../../assets/icons/branches.png")}
              style={{ width: 25, height: 25, tintColor: color }}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tab.Screen
        name="FinancialsTab"
        component={FinancialsStackScreen}
        options={{
          title: "المالية",
          tabBarIcon: ({ color }) => (
            <Image
              source={require("../../assets/icons/financials.png")}
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
          title: "ضبط",
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
