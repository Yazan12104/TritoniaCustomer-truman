import { create } from 'zustand';
import { Order, CreateOrderInput } from '../types';
import { ordersApi } from '../api/ordersApi';
import { Customer } from '../../customers/types';
import { DeliveryPoint } from '../../branches/types';

interface OrderState {
  orders: Order[];
  selectedCustomer: Customer | null;
  selectedBranchId: string | null;
  selectedDeliveryPoint: DeliveryPoint | null;
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
  setDeliveryPoint: (deliveryPoint: DeliveryPoint | null) => void;
  fetchOrders: (params?: any) => Promise<void>;
  createOrder: (input: Omit<CreateOrderInput, 'customer_id' | 'branch_id'> & { customer_id?: string; branch_id?: string }) => Promise<string | null>;
  resetError: () => void;
  clearSelection: () => void;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  selectedCustomer: null,
  selectedBranchId: null,
  selectedDeliveryPoint: null,
  isLoading: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    pages: 0,
  },

  setCustomer: (customer) => set({ selectedCustomer: customer }),

  setBranchId: (branchId) => set({ selectedBranchId: branchId, selectedDeliveryPoint: null }),

  setDeliveryPoint: (deliveryPoint) => set({ selectedDeliveryPoint: deliveryPoint }),

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
    const { selectedCustomer, selectedBranchId, selectedDeliveryPoint } = get();

    const customerId = input.customer_id || selectedCustomer?.id;
    const branchId = input.branch_id || selectedBranchId;

    if (!customerId) {
      set({ error: 'يرجى تحديد العميل' });
      return null;
    }

    if (!branchId) {
      set({ error: 'يرجى اختيار الفرع' });
      return null;
    }

    if (!selectedDeliveryPoint) {
      set({ error: 'يرجى اختيار نقطة التسليم' });
      return null;
    }

    set({ isLoading: true, error: null });
    try {
      const result = await ordersApi.createOrder({
        ...input,
        customer_id: customerId,
        branch_id: branchId,
        delivery_point_id: selectedDeliveryPoint.id,
      });
      set({ isLoading: false });
      return result.id;
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      return null;
    }
  },

  resetError: () => set({ error: null }),

  clearSelection: () => set({ selectedCustomer: null, selectedBranchId: null, selectedDeliveryPoint: null }),
}));
