import { create } from 'zustand';
import { WalletSummary, WalletTransaction, SalaryRequest } from '../types';
import { walletApi } from '../api/walletApi';

interface WalletState {
  summary: WalletSummary | null;
  transactions: WalletTransaction[];
  salaryRequests: SalaryRequest[];
  requestsPagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  isLoading: boolean;
  isLoadingMoreRequests: boolean;
  error: string | null;

  fetchWalletData: (userId: string) => Promise<void>;
  fetchSalaryRequests: (page?: number, limit?: number, loadMore?: boolean) => Promise<void>;
  createSalaryRequest: () => Promise<void>;
  approveRequest: (requestId: string) => Promise<void>;
  rejectRequest: (requestId: string) => Promise<void>;
  removeTransactionFromRequest: (requestId: string, transactionId: string) => Promise<{ newAmount: number }>;
}

export const useWalletStore = create<WalletState>((set, get) => ({
  summary: null,
  transactions: [],
  salaryRequests: [],
  requestsPagination: { total: 0, page: 1, limit: 20, pages: 1 },
  isLoading: false,
  isLoadingMoreRequests: false,
  error: null,

  fetchWalletData: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const [summary, transactions] = await Promise.all([
        walletApi.getWalletSummary(userId),
        walletApi.getTransactions(userId),
      ]);
      set({ summary, transactions, isLoading: false });
      await get().fetchSalaryRequests(1, 20, false);
    } catch (error: any) {
      set({ error: error.message || 'فشل جلب بيانات المحفظة', isLoading: false });
    }
  },

  fetchSalaryRequests: async (page = 1, limit = 20, loadMore = false) => {
    const state = get();
    if (state.isLoadingMoreRequests) return;

    set({ isLoadingMoreRequests: loadMore, error: null });
    try {
      const response = await walletApi.getSalaryRequests(page, limit);
      set((state) => {
        const existingIds = new Set(state.salaryRequests.map(r => r.id));
        const uniqueNewData = response.data.filter((r: any) => !existingIds.has(r.id));
        
        return {
          salaryRequests: loadMore ? [...state.salaryRequests, ...uniqueNewData] : response.data,
          requestsPagination: response.pagination,
          isLoadingMoreRequests: false,
        };
      });
    } catch (error: any) {
      set({ error: error.message || 'فشل جلب طلبات السحب', isLoadingMoreRequests: false });
    }
  },

  createSalaryRequest: async () => {
    set({ isLoading: true, error: null });
    try {
      await walletApi.createSalaryRequest();
      // Refresh data
      const { user } = require('../../auth/store/authStore').useAuthStore.getState();
      if(user?.id) await get().fetchWalletData(user.id);
    } catch (error: any) {
      set({ error: error.message || 'فشل تقديم طلب السحب', isLoading: false });
      throw error;
    }
  },

  approveRequest: async (requestId: string) => {
    set({ isLoading: true, error: null });
    try {
      await walletApi.approveRequest(requestId);
      // Refresh requests data
      const { user } = require('../../auth/store/authStore').useAuthStore.getState();
      if(user?.id) await get().fetchWalletData(user.id);
    } catch (error: any) {
      set({ error: error.message || 'فشل الموافقة على الطلب', isLoading: false });
      throw error;
    }
  },

  rejectRequest: async (requestId: string) => {
    set({ isLoading: true, error: null });
    try {
      await walletApi.rejectRequest(requestId);
      // Refresh requests data
      const { user } = require('../../auth/store/authStore').useAuthStore.getState();
      if(user?.id) await get().fetchWalletData(user.id);
    } catch (error: any) {
      set({ error: error.message || 'فشل رفض الطلب', isLoading: false });
      throw error;
    }
  },

  removeTransactionFromRequest: async (requestId: string, transactionId: string): Promise<{ newAmount: number }> => {
    set({ isLoading: true, error: null });
    try {
      const result = await walletApi.removeTransactionFromRequest(requestId, transactionId);
      // Refresh data after removal
      const { user } = require('../../auth/store/authStore').useAuthStore.getState();
      if(user?.id) await get().fetchWalletData(user.id);
      return result;
    } catch (error: any) {
      set({ error: error.message || 'فشل إزالة المعاملة', isLoading: false });
      throw error;
    }
  }
}));
