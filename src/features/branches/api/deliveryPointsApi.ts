import { apiClient } from '../../../core/api/apiClient';
import { DeliveryPoint } from '../types';

const mapDeliveryPoint = (apiData: any): DeliveryPoint => ({
  id: apiData.id || '',
  branch_id: apiData.branch_id || '',
  name: apiData.name || '',
  fee: apiData.fee || '0',
});

export const deliveryPointsApi = {
  getDeliveryPointsForBranch: async (branchId: string): Promise<DeliveryPoint[]> => {
    const response = await apiClient.get(`/branches/${branchId}/delivery-points`);
    const data = response.data.data || [];
    return (Array.isArray(data) ? data : []).map(mapDeliveryPoint);
  },
};
