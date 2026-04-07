import { create } from 'zustand';
import { Order, CreateOrderInput } from '../types';
import { ordersApi } from '../api/ordersApi';
import { Customer } from '../../customers/types';

interface OrderState {
  orders: Order[];
  selectedCustomer: Customer | null;
  selectedBranchId: string | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    pages: number;
  };

  // Actions
  setCustomer: (customer: Customer | null) => void;
  setBranchId: (branchId: string | null) => void;
  fetchOrders: (params?: any) => Promise<void>;
  createOrder: (input: Omit<CreateOrderInput, 'customer_id' | 'branch_id'>) => Promise<string | null>;
  resetError: () => void;
  clearSelection: () => void;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  selectedCustomer: null,
  selectedBranchId: null,
  isLoading: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    pages: 0,
  },

  setCustomer: (customer) => set({ selectedCustomer: customer }),
  
  setBranchId: (branchId) => set({ selectedBranchId: branchId }),

  fetchOrders: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const result = await ordersApi.getOrders({
        page: params?.page || 1,
        limit: params?.limit || 20,
        ...params
      });
      set({ 
        orders: result.orders, 
        pagination: { 
          total: result.total, 
          page: params?.page || 1, 
          pages: result.pages 
        },
        isLoading: false 
      });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  createOrder: async (input) => {
    const { selectedCustomer, selectedBranchId } = get();
    
    if (!selectedCustomer) {
      set({ error: 'يرجى اختيار العميل أولاً' }); // Arabic for "Please select a customer first"
      return null;
    }

    if (!selectedBranchId) {
      set({ error: 'يرجى اختيار الفرع' }); // Arabic for "Please select branch"
      return null;
    }

    set({ isLoading: true, error: null });
    try {
      const result = await ordersApi.createOrder({
        ...input,
        customer_id: selectedCustomer.id,
        branch_id: selectedBranchId,
      });
      set({ isLoading: false });
      return result.id;
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      return null;
    }
  },

  resetError: () => set({ error: null }),
  
  clearSelection: () => set({ selectedCustomer: null, selectedBranchId: null }),
}));
