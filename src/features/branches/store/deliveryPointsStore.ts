import { create } from 'zustand';
import { DeliveryPoint } from '../types';
import { deliveryPointsApi } from '../api/deliveryPointsApi';

interface DeliveryPointsState {
  deliveryPoints: DeliveryPoint[];
  isLoading: boolean;
  error: string | null;

  fetchDeliveryPointsForBranch: (branchId: string) => Promise<void>;
  resetError: () => void;
}

export const useDeliveryPointsStore = create<DeliveryPointsState>((set) => ({
  deliveryPoints: [],
  isLoading: false,
  error: null,

  fetchDeliveryPointsForBranch: async (branchId: string) => {
    set({ isLoading: true, error: null });
    try {
      const result = await deliveryPointsApi.getDeliveryPointsForBranch(branchId);
      set({ deliveryPoints: result, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false, deliveryPoints: [] });
    }
  },

  resetError: () => set({ error: null }),
}));
