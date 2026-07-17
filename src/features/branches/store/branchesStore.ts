import { create } from 'zustand';
import { apiClient } from '../../../core/api/apiClient';

export interface Branch {
  id: string;
  name: string;
  governorate?: string;
  is_active?: boolean;
}

const normalizeBranchActivity = (value: unknown) => {
  if (value === undefined || value === null) return true;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'false' || normalized === '0' || normalized === 'inactive') return false;
    if (normalized === 'true' || normalized === '1' || normalized === 'active') return true;
  }
  return Boolean(value);
};

const mapBranch = (branch: any): Branch => ({
  id: branch.id,
  name: branch.name,
  governorate: branch.governorate,
  is_active: normalizeBranchActivity(branch.is_active),
});

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
      const response = await apiClient.get('/branches?limit=60');
      const result = response.data.body || response.data.data;
      // Backend returns paginated response: { data: [...], pagination: {...} }
      const branches = result?.data || result;
      set({
        branches: Array.isArray(branches) ? branches.map(mapBranch) : [],
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to fetch branches:', error);
      set({ branches: [], isLoading: false });
    }
  },
}));
