import { create } from 'zustand';
import { Employee, EmployeeHierarchy } from '../types';
import { employeesApi } from '../api/employeesApi';

interface EmployeesState {
  employees: Employee[];
  hierarchy: EmployeeHierarchy[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };

  fetchEmployees: (params?: { page?: number; limit?: number; search?: string; role?: string; supervisorId?: string; branchId?: string }, loadMore?: boolean) => Promise<void>;
  fetchHierarchy: (rootId?: string) => Promise<void>;
  createEmployee: (data: any) => Promise<void>;
  updateEmployee: (id: string, data: Partial<Employee>) => Promise<void>;
  assignSupervisor: (employeeId: string, supervisorId: string) => Promise<void>;
}

export const useEmployeesStore = create<EmployeesState>((set, get) => ({
  employees: [],
  hierarchy: [],
  isLoading: false,
  isLoadingMore: false,
  error: null,
  pagination: { total: 0, page: 1, limit: 20, pages: 1 },

  fetchEmployees: async (params, loadMore = false) => {
    const state = get();
    if (state.isLoading || (loadMore && state.isLoadingMore)) return;

    if (loadMore) {
        set({ isLoadingMore: true, error: null });
    } else {
        set({ isLoading: true, error: null });
    }
    
    try {
      const response = await employeesApi.getEmployees(params);
      
      set((state) => ({
        employees: loadMore ? [...state.employees, ...response.data] : response.data,
        pagination: response.pagination,
        isLoading: false,
        isLoadingMore: false,
      }));
    } catch (error: any) {
      set({ error: error.message || 'فشل جلب الموظفين', isLoading: false, isLoadingMore: false });
    }
  },

  fetchHierarchy: async (rootId?: string) => {
    set({ isLoading: true, error: null });
    try {
      const hierarchy = await employeesApi.getHierarchy(rootId);
      set({ hierarchy, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'فشل جلب الهيكل التنظيمي', isLoading: false });
    }
  },

  createEmployee: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await employeesApi.createEmployee(data);
    } catch (error: any) {
      set({ error: error.message || 'فشل إضافة الموظف' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateEmployee: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      await employeesApi.updateEmployee(id, data);
    } catch (error: any) {
      set({ error: error.message || 'فشل تحديث الموظف' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  assignSupervisor: async (employeeId, supervisorId) => {
    set({ isLoading: true, error: null });
    try {
      await employeesApi.updateEmployee(employeeId, { supervisorId } as any);
    } catch (error: any) {
      set({ error: error.message || 'فشل تعيين المشرف' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));
