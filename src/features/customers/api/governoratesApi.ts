// api/governoratesApi.ts (نسخة مبسطة)
import { apiClient } from '../../../core/api/apiClient';
import { USE_MOCK_API } from '../../../config/env';
import { Governorate } from '../types';

const MOCK_GOVERNORATES: Governorate[] = [
  { id: '972d654c-a4e9-4c78-b241-88bdeb83eb21', name: 'حلب' },
  { id: '515bf8af-a384-42c3-bdc7-8c32ac3b6dfd', name: 'حماة' },
  { id: '40c287da-2ccf-4483-ac86-eda41813e5cc', name: 'حمص' },
  { id: 'a20c76de-acec-48bc-9353-762d1c1f89e6', name: 'دمشق' },
  { id: '6086c696-b779-420c-86b2-7e8ca2e3a064', name: 'طرطوس' },
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const governoratesApi = {
  getGovernorates: async (): Promise<Governorate[]> => {
    try {
      if (USE_MOCK_API) {
        await delay(500);
        return MOCK_GOVERNORATES;
      }
      
      const response = await apiClient.get('/governorates');
      
      // استخراج البيانات حسب هيكل الباك إند
      // الهيكل: { success: true, body: { data: [...] }, message: '...' }
      const governorates = response.data?.body?.data || response.data?.data || [];
      
      console.log('✅ Governorates loaded:', governorates.length);
      return governorates;
      
    } catch (error: any) {
      console.error("getGovernorates Error:", error);
      // Return mock data as fallback
      return MOCK_GOVERNORATES;
    }
  },
};