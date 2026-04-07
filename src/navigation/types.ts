import { NavigatorScreenParams } from '@react-navigation/native';

// --- STACK PARAM LISTS ---

// Admin Stacks
export type AdminDashboardStackParamList = { AdminDashboardScreen: undefined; ProductDetailsScreen: { productId: string } };
export type ManageEmployeesStackParamList = {
  EmployeesListScreen: undefined;
  EmployeeDetailsScreen: { employeeId: string };
  CreateEmployeeScreen: undefined;
  TeamHierarchyScreen: undefined;
  ApplyEmployeeScreen: { userId: string };
};
export type AllOrdersStackParamList = { AllOrdersScreen: undefined; OrderDetailsScreen: { orderId: string } };
export type ManageProductsStackParamList = {
  ProductsListScreen: undefined;
  ProductDetailsScreen: { productId: string };
  ManageProductsScreen: undefined;
};
export type FinancialsStackParamList = {
  FinancialsScreen: undefined;
  ManageCommissionsScreen: undefined;
  ManageSalaryRequestsScreen: undefined;
  SalaryRequestDetailsScreen: { requestId: string };
  OrderDetailsScreen: { orderId: string };
};
export type ManageCommissionsStackParamList = { ManageCommissionsScreen: undefined };
export type ManageBranchesStackParamList = {
  ManageBranchesScreen: undefined;
  BranchDetailsScreen: { branchId: string };
  BranchEmployeesScreen: { branchName: string, employees: any[] };
};
export type ManageCustomersStackParamList = {
  CustomersListScreen: undefined;
  CustomerDetailsScreen: { customerId: string };
  ApplyEmployeeScreen: { userId: string };
};

// Branch Manager Stacks
export type BranchDashboardStackParamList = { BranchDashboardScreen: undefined };
export type BranchOrdersStackParamList = { BranchOrdersScreen: undefined; OrderDetailsScreen: { orderId: string } };
export type BranchInventoryStackParamList = { BranchInventoryScreen: undefined; ProductDetailsScreen: { productId: string } };

// Supervisor Stacks
export type TeamDashboardStackParamList = { TeamDashboardScreen: undefined };
export type MyTeamStackParamList = { EmployeeDetailsScreen: { employeeId: string }; MyTeamScreen: undefined; CreateEmployeeScreen: undefined };
export type TeamOrdersStackParamList = { TeamOrdersScreen: undefined; OrderDetailsScreen: { orderId: string } };
export type SupervisorProductsStackParamList = { ProductsListScreen: undefined; ProductDetailsScreen: { productId: string } };
export type SupervisorCartStackParamList = { CartScreen: undefined; CheckoutScreen: undefined };
export type SupervisorCustomersStackParamList = { CustomersListScreen: undefined; AddCustomerScreen: undefined; CustomerDetailsScreen: { customerId: string } };
export type WalletStackParamList = { MyWalletScreen: undefined; SalaryRequestScreen: undefined; TransactionsScreen: undefined };

// Marketer Stacks
export type MarketerDashboardStackParamList = { MarketerDashboardScreen: undefined };
export type CatalogBrowserStackParamList = { CatalogBrowserScreen: undefined; ProductDetailsScreen: { productId: string } };
export type CartCheckoutStackParamList = { CartScreen: undefined; CheckoutScreen: undefined };
export type MyCustomersStackParamList = { CustomersListScreen: undefined; AddCustomerScreen: undefined; CustomerDetailsScreen: { customerId: string } };
export type MyOrdersStackParamList = { MyOrdersScreen: undefined; OrderDetailsScreen: { orderId: string } };

// Shared
export type NotificationsStackParamList = { NotificationsScreen: undefined; NotificationDetailsScreen: { notificationId: string } };
export type SettingsStackParamList = {
  SettingsScreen: undefined;
  CreateEmployeeScreen: undefined;
  ProfileScreen: undefined;
  ManageSalaryRequestsScreen: undefined;
  SalaryRequestDetailsScreen: { requestId: string };
  OrderDetailsScreen: { orderId: string };
  MyWalletScreen: undefined;
  SalaryRequestScreen: undefined;
  TransactionsScreen: undefined;
  AboutAppScreen: undefined;
};

// App Navigator (Global Stack for Main Tabs + Global Screens like Notifications)
export type RootAppStackParamList = {
  MainTabs: undefined;
  NotificationsStack: NavigatorScreenParams<NotificationsStackParamList>;
};

// --- TAB PARAM LISTS ---

export type AdminTabParamList = {
  DashboardTab: NavigatorScreenParams<AdminDashboardStackParamList>;
  EmployeesTab: NavigatorScreenParams<ManageEmployeesStackParamList>;
  OrdersTab: NavigatorScreenParams<AllOrdersStackParamList>;
  ProductsTab: NavigatorScreenParams<ManageProductsStackParamList>;
  CustomersTab: NavigatorScreenParams<ManageCustomersStackParamList>;
  BranchesTab: NavigatorScreenParams<ManageBranchesStackParamList>;
  FinancialsTab: NavigatorScreenParams<FinancialsStackParamList>;
  SettingsTab: NavigatorScreenParams<SettingsStackParamList>;
};

export type BranchManagerTabParamList = {
  DashboardTab: NavigatorScreenParams<BranchDashboardStackParamList>;
  OrdersTab: NavigatorScreenParams<BranchOrdersStackParamList>;
  InventoryTab: NavigatorScreenParams<BranchInventoryStackParamList>;
  EmployeesTab: NavigatorScreenParams<ManageEmployeesStackParamList>;
  SettingsTab: NavigatorScreenParams<SettingsStackParamList>;
};

export type SupervisorTabParamList = {
  DashboardTab: NavigatorScreenParams<TeamDashboardStackParamList>;
  MyTeamTab: NavigatorScreenParams<MyTeamStackParamList>;
  StoreTab: NavigatorScreenParams<SupervisorProductsStackParamList & SupervisorCartStackParamList>;
  CustomersTab: NavigatorScreenParams<SupervisorCustomersStackParamList>;
  OrdersTab: NavigatorScreenParams<TeamOrdersStackParamList>;
  SettingsTab: NavigatorScreenParams<SettingsStackParamList>;
};

export type MarketerTabParamList = {
  DashboardTab: NavigatorScreenParams<MarketerDashboardStackParamList>;
  CatalogTab: NavigatorScreenParams<CatalogBrowserStackParamList>;
  CartTab: NavigatorScreenParams<CartCheckoutStackParamList>;
  CustomersTab: NavigatorScreenParams<MyCustomersStackParamList>;
  OrdersTab: NavigatorScreenParams<MyOrdersStackParamList>;
  WalletTab: NavigatorScreenParams<WalletStackParamList>;
  SettingsTab: NavigatorScreenParams<SettingsStackParamList>;
};

export type RootStackParamList = {
  Auth: undefined;
  App: undefined;
};
