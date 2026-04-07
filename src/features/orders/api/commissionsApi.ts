import { apiClient } from '../../../core/api/apiClient';

export interface CommissionSetting {
  id: string;
  product_id: string | null;
  product_name?: string;
  company_percentage: number;
  general_supervisor_percentage: number;
  supervisor_percentage: number;
}

export interface CreateCommissionInput {
  product_id?: string | null;
  company_percentage: number;
  general_supervisor_percentage: number;
  supervisor_percentage: number;
}

export const commissionsApi = {
  list: async (params?: { page?: number; limit?: number }): Promise<{ data: CommissionSetting[]; total: number }> => {
    const response = await apiClient.get('/commissions', { params });
    // Backend returns { success: true, data: { data: [], pagination: { ... } } }
    return response.data.data;
  },

  getById: async (id: string): Promise<CommissionSetting> => {
    const response = await apiClient.get(`/commissions/${id}`);
    // Backend returns { success: true, data: { ... } }
    return response.data.data;
  },

  create: async (data: CreateCommissionInput): Promise<{ id: string }> => {
    const response = await apiClient.post('/commissions', data);
    return response.data.data;
  },

  update: async (id: string, data: CreateCommissionInput): Promise<void> => {
    await apiClient.put(`/commissions/${id}`, data);
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/commissions/${id}`);
  },
};
