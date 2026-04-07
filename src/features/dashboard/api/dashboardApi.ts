import { apiClient } from '../../../core/api/apiClient';

export interface StatItem {
  id?: string;
  name?: string;
  total?: number;
  [key: string]: any;
}

export const dashboardApi = {
  // Admin
  getAdminMostSellingBranches: async () => {
    const response = await apiClient.get('/stats/admin/most-selling-branches');
    return response.data.body || [];
  },
  getAdminMostOrderingMarketers: async () => {
    const response = await apiClient.get('/stats/admin/most-ordering-marketers');
    return response.data.body || [];
  },
  getAdminMostOrderingCustomers: async () => {
    const response = await apiClient.get('/stats/admin/most-ordering-customers');
    return response.data.body || [];
  },
  getAdminMostSoldProducts: async () => {
    const response = await apiClient.get('/stats/admin/most-sold-products');
    return response.data.body || [];
  },

  // Branch Manager
  getBranchMostOrderingMarketers: async () => {
    const response = await apiClient.get('/stats/branch/most-ordering-marketers');
    return response.data.body || [];
  },
  getBranchMostOrderingCustomers: async () => {
    const response = await apiClient.get('/stats/branch/most-ordering-customers');
    return response.data.body || [];
  },

  // Employee (Marketer, Supervisor, General Supervisor)
  getEmployeeProfits: async () => {
    const response = await apiClient.get('/stats/employee/profits');
    return response.data.body || 0;
  },
  getEmployeeLastOrders: async () => {
    const response = await apiClient.get('/stats/employee/last-orders');
    return response.data.body || [];
  },
  getEmployeeMostOrderingCustomers: async () => {
    const response = await apiClient.get('/stats/employee/most-ordering-customers');
    return response.data.body || [];
  },

  // Customer
  getCustomerLastOrders: async () => {
    const response = await apiClient.get('/stats/customer/last-orders');
    return response.data.body || [];
  },
  getCustomerMostSoldProducts: async () => {
    const response = await apiClient.get('/stats/customer/most-sold-products');
    return response.data.body || [];
  },
};
