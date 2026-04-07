// store/governorateStore.ts
import { create } from 'zustand';
import { Governorate } from '../types';
import { governoratesApi } from '../api/governoratesApi';

interface GovernorateState {
  governorates: Governorate[];
  isLoading: boolean;
  error: string | null;
  
  fetchGovernorates: () => Promise<void>;
}

export const useGovernorateStore = create<GovernorateState>((set) => ({
  governorates: [],
  isLoading: false,
  error: null,
  
  fetchGovernorates: async () => {
    console.log('🔄 Fetching governorates...');
    set({ isLoading: true, error: null });
    try {
      const governorates = await governoratesApi.getGovernorates();
      console.log('✅ Governorates fetched:', governorates.length);
      set({ governorates, isLoading: false });
    } catch (err: any) {
      console.error('❌ Error fetching governorates:', err);
      set({ 
        error: err.message || 'فشل جلب المحافظات', 
        isLoading: false,
        governorates: [] // Clear governorates on error
      });
    }
  },
}));