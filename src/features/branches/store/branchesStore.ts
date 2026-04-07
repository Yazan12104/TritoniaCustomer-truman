import { create } from 'zustand';
import { Branch, Governorate } from '../types';
import { branchesApi } from '../api/branchesApi';

interface BranchesState {
  branches: Branch[];
  governorates: Governorate[];
  isLoading: boolean;
  error: string | null;
  updateBranchStatus: (id: string, status: 'ACTIVE' | 'INACTIVE') => Promise<void>;
  fetchGovernorates: () => Promise<void>;
  createGovernorate: (name: string) => Promise<void>;
  fetchBranches: (governorateId?: string) => Promise<void>;
  createBranch: (branchData: Omit<Branch, 'id'>) => Promise<void>;
  updateBranch: (id: string, branchData: Partial<Branch>) => Promise<void>;

}

export const useBranchesStore = create<BranchesState>((set, get) => ({
  branches: [],
  governorates: [],
  isLoading: false,
  error: null,
  updateBranchStatus: async (id, status) => {
    set({ isLoading: true, error: null });
    try {
      await branchesApi.updateBranchStatus(id, status);
      await get().fetchBranches(); // تحديث القائمة
      set({ isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'فشل تحديث حالة الفرع', isLoading: false });
      throw error;
    }
  },
  fetchGovernorates: async () => {
    try {
      const governorates = await branchesApi.getGovernorates();
      set({ governorates, error: null });
    } catch (error: any) {
      set({ error: error.message || 'فشل جلب المحافظات' });
    }
  },

  createGovernorate: async (name: string) => {
    set({ isLoading: true, error: null });
    try {
      await branchesApi.createGovernorate(name);
      // Refresh both because createGovernorate also creates a default branch in backend
      const [govs, brs] = await Promise.all([
        branchesApi.getGovernorates(),
        branchesApi.getBranches()
      ]);
      set({ governorates: govs, branches: brs, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'فشل إضافة المحافظة', isLoading: false });
      throw error;
    }
  },

  fetchBranches: async (governorateId?: string) => {
    set({ isLoading: true, error: null });
    try {
      const branches = await branchesApi.getBranches(governorateId);
      set({ branches, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'فشل جلب الفروع', isLoading: false });
    }
  },

  createBranch: async (branchData: Omit<Branch, 'id'>) => {
    set({ isLoading: true, error: null });
    try {
      await branchesApi.createBranch(branchData);
      await get().fetchBranches(); // Refresh list
    } catch (error: any) {
      set({ error: error.message || 'فشل إضافة الفرع', isLoading: false });
      throw error;
    }
  },

  updateBranch: async (id: string, branchData: Partial<Branch>) => {
    set({ isLoading: true, error: null });
    try {
      await branchesApi.updateBranch(id, branchData);
      await get().fetchBranches(); // Refresh list
    } catch (error: any) {
      set({ error: error.message || 'فشل تحديث الفرع', isLoading: false });
      throw error;
    }
  }
}));
