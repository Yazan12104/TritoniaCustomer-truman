import { create } from 'zustand';
import { Governorate } from '../types';
import { governoratesApi } from '../api/governoratesApi';

interface GovernorateState {
  governorates: Governorate[];
  isLoading: boolean;
  isLoadingMore: boolean;
  isSubmitting: boolean;
  page: number;
  hasMore: boolean;
  error: string | null;

  resetGovernorates: () => void;
  fetchGovernorates: (options?: { reset?: boolean }) => Promise<void>;
  updateMyGovernorate: (governorateId: string) => Promise<{ id: string; governorate_id: string }>;
}

export const useGovernorateStore = create<GovernorateState>((set, get) => ({
  governorates: [],
  isLoading: false,
  isLoadingMore: false,
  isSubmitting: false,
  page: 0,
  hasMore: true,
  error: null,

  resetGovernorates: () =>
    set({
      governorates: [],
      isLoading: false,
      isLoadingMore: false,
      page: 0,
      hasMore: true,
      error: null,
    }),

  fetchGovernorates: async (options) => {
    const reset = options?.reset ?? false;
    const { hasMore, isLoading, isLoadingMore, page, governorates } = get();

    if ((isLoading || isLoadingMore) && !reset) return;
    if (!hasMore && !reset) return;

    const nextPage = reset ? 1 : page + 1;
    set({
      error: null,
      isLoading: reset,
      isLoadingMore: !reset,
    });

    try {
      
      const response = await governoratesApi.getGovernorates(nextPage, 20);
      const mergedGovernorates = reset
        ? response.data
        : [...governorates, ...response.data.filter((item) => !governorates.some((g) => g.id === item.id))];

      set({
        governorates: mergedGovernorates,
        page: response.pagination.page,
        hasMore: response.pagination.page < response.pagination.pages,
        isLoading: false,
        isLoadingMore: false,
      });
    } catch (err: any) {
      set({
        error: err.message || 'فشل جلب المحافظات',
        isLoading: false,
        isLoadingMore: false,
      });
    }
  },

  updateMyGovernorate: async (governorateId) => {
    set({ isSubmitting: true, error: null });
    try {
      const result = await governoratesApi.updateMyGovernorate(governorateId);
      set({ isSubmitting: false });
      return result;
    } catch (err: any) {
      const message = err.message || 'فشل تحديث المحافظة';
      if (message === 'Governorate is already set') {
        set({ isSubmitting: false, error: null });
        return {
          id: '',
          governorate_id: governorateId,
        };
      }
      set({ isSubmitting: false, error: message });
      throw err;
    }
  },
}));
