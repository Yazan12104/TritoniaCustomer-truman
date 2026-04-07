import { apiClient } from '../../../core/api/apiClient';
import { USE_MOCK_API } from '../../../config/env';
import { Branch, Governorate } from '../types';

// Mappers
const mapGovernorate = (apiData: any): Governorate => ({
  id: apiData.id || '',
  name: apiData.name || '',
});

const mapBranch = (apiData: any): Branch => ({
  id: apiData.id || '',
  name: apiData.name || apiData.governorate || 'فرع', 
  governorate_id: apiData.governorate_id || apiData.governorateId || '',
  managerId: apiData.manager_id || apiData.managerId,
  manager_name: apiData.manager_name,
  manager_phone: apiData.manager_phone,
  address: apiData.address || '',
  phone: apiData.phone || '',
  status: apiData.is_active === true || apiData.is_active === 'true' ? 'ACTIVE' : 'INACTIVE',
  is_active: apiData.is_active === true || apiData.is_active === 'true',
  governorate: apiData.governorate,
  employees: apiData.employees,
  orders_count: apiData.orders_count
});

// Mock Logic
let mockGovernorates: Governorate[] = [
  { id: 'gov_1', name: 'بغداد' },
  { id: 'gov_2', name: 'البصرة' },
  { id: 'gov_3', name: 'أربيل' },
  { id: 'gov_4', name: 'النجف' },
];

let mockBranches: Branch[] = [
  { id: 'b1', name: 'فرع المنصور', governorate_id: 'gov_1', managerId: 'emp_123', address: 'شارع 14 رمضان', phone: '07901234567', status: 'ACTIVE', is_active: true },
  { id: 'b2', name: 'فرع العشار', governorate_id: 'gov_2', address: 'سوق العشار المركزي', phone: '07801234568', status: 'ACTIVE', is_active: true },
  { id: 'b3', name: 'فرع عينكاوا', governorate_id: 'gov_3', managerId: 'emp_125', address: 'شارع المنتزه', phone: '07701234569', status: 'INACTIVE', is_active: false }
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const branchesApi = {
  getGovernorates: async (): Promise<Governorate[]> => {
    try {
      if (USE_MOCK_API) {
        await delay(300);
        return [...mockGovernorates];
      } else {
        const response = await apiClient.get('/governorates');
        // Backend returns: { success: true, body: { data: Governorate[], pagination: {...} } }
        const data = response.data.body?.data || response.data.body || [];
        return (Array.isArray(data) ? data : []).map(mapGovernorate);
      }
    } catch (error: any) {
      console.error("getGovernorates Error:", error);
      throw new Error(error.response?.data?.message || error.message || 'فشل جلب المحافظات');
    }
  },

  createGovernorate: async (name: string): Promise<Governorate> => {
    try {
      if (USE_MOCK_API) {
        await delay(500);
        const newGov = { id: `gov_${Date.now()}`, name };
        mockGovernorates.push(newGov);
        return newGov;
      } else {
        const response = await apiClient.post('/governorates', { name });
        return mapGovernorate(response.data.body);
      }
    } catch (error: any) {
      console.error("createGovernorate Error:", error);
      throw new Error(error.response?.data?.message || error.message || 'فشل إنشاء المحافظة');
    }
  },

  getBranches: async (governorateId?: string): Promise<Branch[]> => {
    try {
      if (USE_MOCK_API) {
        await delay(500);
        if (governorateId) {
          return mockBranches.filter(b => b.governorate_id === governorateId);
        }
        return [...mockBranches];
      } else {
        const response = await apiClient.get('/branches', { params: { governorateId } });
        // Backend returns: { success: true, body: { data: Branch[], pagination: {...} } }
        const data = response.data.body?.data || response.data.body || [];
        return (Array.isArray(data) ? data : []).map(mapBranch);
      }
    } catch (error: any) {
      console.error("getBranches Error:", error);
      if (error.response) {
      console.error('❌ Error Response Status:', error.response.status);
      console.error('❌ Error Response Headers:', error.response.headers);
      console.error('❌ Error Response Data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('❌ No response received:', error.request);
    } else {
      console.error('❌ Error message:', error.message);
    }
      throw new Error(error.response?.data?.message || error.message || 'فشل جلب الفروع');
    }
  },

  getBranchById: async (id: string): Promise<Branch> => {
    try {
      if (USE_MOCK_API) {
        await delay(300);
        const branch = mockBranches.find(b => b.id === id);
        if (!branch) throw new Error('الفرع غير موجود');
        return { ...branch };
      } else {
        const response = await apiClient.get(`/branches/${id}`);
        const data = response.data.body || response.data.data;
        return mapBranch(data);
      }
    } catch (error: any) {
      console.error("getBranchById Error:", error);
      throw new Error(error.response?.data?.message || error.message || 'فشل جلب بيانات الفرع');
    }
  },

  createBranch: async (branchData: Omit<Branch, 'id'>): Promise<Branch> => {
    try {
      if (USE_MOCK_API) {
        await delay(800);
        const newBranch: Branch = {
          ...branchData,
          id: `b_${Math.random().toString(36).substr(2, 6)}`,
        };
        mockBranches.push(newBranch);
        return newBranch;
      } else {
        // Backend expects governorate_id
        const payload = {
            governorate_id: (branchData as any).governorateId || (branchData as any).governorate_id
        };
        const response = await apiClient.post('/branches', payload);
        return mapBranch(response.data.body);
      }
    } catch (error: any) {
      console.error("createBranch Error:", error);
      throw new Error(error.response?.data?.message || error.message || 'فشل إنشاء الفرع');
    }
  },

  updateBranch: async (id: string, branchData: Partial<Branch>): Promise<Branch> => {
    try {
      if (USE_MOCK_API) {
        await delay(800);
        const branchIndex = mockBranches.findIndex(b => b.id === id);
        if (branchIndex === -1) {
          throw new Error('الفرع غير موجود');
        }
        const updatedBranch = { ...mockBranches[branchIndex], ...branchData };
        mockBranches[branchIndex] = updatedBranch;
        return updatedBranch;
      } else {
        const payload = {
            governorate_id: (branchData as any).governorateId || (branchData as any).governorate_id
        };
        const response = await apiClient.put(`/branches/${id}`, payload);
        return mapBranch(response.data.body);
      }
    } catch (error: any) {
      console.error("updateBranch Error:", error);
      throw new Error(error.response?.data?.message || error.message || 'فشل تحديث الفرع');
    }
  },
  // branchesApi.ts - إضافة دالة updateBranchStatus
updateBranchStatus: async (id: string, status: 'ACTIVE' | 'INACTIVE'): Promise<Branch> => {
  try {
    if (USE_MOCK_API) {
      await delay(500);
      const branchIndex = mockBranches.findIndex(b => b.id === id);
      if (branchIndex === -1) throw new Error('الفرع غير موجود');
      mockBranches[branchIndex] = { ...mockBranches[branchIndex], status };
      return { ...mockBranches[branchIndex] };
    }
    
    // تحويل status إلى is_active
    const isActive = status === 'ACTIVE';
    
    console.log(`📤 Updating branch status: PATCH /branches/${id}/status`, { is_active: isActive });
    
    // استخدام endpoint PATCH الجديد
    const response = await apiClient.patch(`/branches/${id}/status`, { is_active: isActive });
    
    return mapBranch(response.data?.body || response.data?.data);
    
  } catch (error: any) {
    console.error("updateBranchStatus Error:", error);
    console.error("Error details:", error.response?.data);
    throw new Error(error.response?.data?.message || error.message || 'فشل تحديث حالة الفرع');
  }
},
};
