// store/customerStore.ts
import { create } from 'zustand';
import { Customer, CreateCustomerInput, PaginatedResponse } from '../types';
import { customersApi } from '../api/customersApi';

interface CustomerState {
  customers: Customer[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  selectedCustomer: Customer | null;

  // Actions
  fetchCustomers: (page?: number, limit?: number, search?: string, fetchMore?: boolean) => Promise<void>;
  fetchCustomerDetails: (id: string) => Promise<Customer | null>;
  addCustomer: (data: CreateCustomerInput) => Promise<void>;
  clearSelectedCustomer: () => void;
  clearError: () => void;
}

export const useCustomerStore = create<CustomerState>((set, get) => ({
  customers: [],
  pagination: {
    total: 0,
    page: 1,
    limit: 20,
    pages: 0,
  },
  isLoading: false,
  isLoadingMore: false,
  error: null,
  selectedCustomer: null,

  fetchCustomers: async (page = 1, limit = 20, search, fetchMore = false) => {
    const state = get();
    if (state.isLoading || (fetchMore && state.isLoadingMore)) return;

    set({ isLoading: !fetchMore, isLoadingMore: fetchMore, error: null });
    try {
      const result: PaginatedResponse<Customer> = await customersApi.getCustomers(page, limit, search);
      set((state) => {
        const existingIds = new Set(state.customers.map(c => c.id || c.customer_id));
        const uniqueNewData = result.data.filter(c => !existingIds.has(c.id || c.customer_id));
        
        return {
          customers: fetchMore ? [...state.customers, ...uniqueNewData] : result.data,
          pagination: result.pagination,
          isLoading: false,
          isLoadingMore: false,
        };
      });
    } catch (err: any) {
      set({
        error: err.message || 'فشل في جلب العملاء',
        isLoading: false,
        isLoadingMore: false,
      });
    }
  },

  fetchCustomerDetails: async (id: string) => {
    set({ isLoading: true, error: null, selectedCustomer: null });
    try {
      const customer = await customersApi.getCustomerDetails(id);
      set({
        selectedCustomer: customer,
        isLoading: false,
      });
      return customer;
    } catch (err: any) {
      set({
        error: err.message || 'فشل في جلب تفاصيل العميل',
        isLoading: false,
      });
      return null;
    }
  },

  addCustomer: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const newCustomer = await customersApi.addCustomer(data);
      // Update customers list if we're on first page
      const { pagination } = get();
      if (pagination.page === 1) {
        set({
          customers: [newCustomer, ...get().customers].slice(0, pagination.limit),
          pagination: {
            ...pagination,
            total: pagination.total + 1,
            pages: Math.ceil((pagination.total + 1) / pagination.limit),
          },
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch (err: any) {
      set({
        error: err.message || 'فشل في إضافة العميل',
        isLoading: false,
      });
      throw err;
    }
  },

  clearSelectedCustomer: () => {
    set({ selectedCustomer: null });
  },

  clearError: () => {
    set({ error: null });
  },
}));