import { create } from 'zustand';
import { apiClient } from '../../../core/api/apiClient';

export interface Branch {
  id: string;
  name: string;
  governorate?: string;
  is_active?: boolean;
}

interface BranchesState {
  branches: Branch[];
  isLoading: boolean;
  fetchBranches: () => Promise<void>;
}

export const useBranchesStore = create<BranchesState>((set) => ({
  branches: [],
  isLoading: false,

  fetchBranches: async () => {
    set({ isLoading: true });
    try {
      const response = await apiClient.get('/branches');
      const result = response.data.body || response.data.data;
      // Backend returns paginated response: { data: [...], pagination: {...} }
      const branches = result?.data || result;
      set({ branches: Array.isArray(branches) ? branches : [], isLoading: false });
    } catch (error) {
      console.error('Failed to fetch branches:', error);
      set({ branches: [], isLoading: false });
    }
  },
}));
