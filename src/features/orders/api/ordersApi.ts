import { apiClient } from '../../../core/api/apiClient';
import { Order, CreateOrderInput } from '../types';

// Mapper to ensure consistency (backend uses snake_case, but we'll map strictly)
const mapOrder = (apiData: any): Order => ({
  id: apiData.id || '',
  customer_id: apiData.customer_id || '',
  marketer_id: apiData.marketer_id || '',
  branch_id: apiData.branch_id || '',
  delivery_point_id: apiData.delivery_point_id,
  total_price: Number(apiData.total_price) || 0,
  sold_price: Number(apiData.sold_price) || 0,
  delivery_fee: apiData.delivery_fee ? Number(apiData.delivery_fee) : undefined,
  status: apiData.status || 'PENDING',
  notes: apiData.notes || '',
  customer_name: apiData.customer_name || '',
  marketer_name: apiData.marketer_name || '',
  branch_name: apiData.branch_name || '',
  delivery_point_name: apiData.delivery_point_name,
  created_at: apiData.created_at || '',
  items: Array.isArray(apiData.items) ? apiData.items.map((item: any) => ({
    id: item.id || '',
    order_id: item.order_id || '',
    product_id: item.product_id || '',
    quantity: Number(item.quantity) || 0,
    price: Number(item.price || item.main_price) || 0,
    product_name: item.name || item.product_name || '',
  })) : [],
  transactions: Array.isArray(apiData.transactions) ? apiData.transactions.map((tx: any) => ({
    employee_name: tx.employee_name || '',
    amount: Number(tx.amount) || 0,
  })) : undefined,
  preview_transactions: Array.isArray(apiData.preview_transactions) ? apiData.preview_transactions.map((tx: any) => ({
    employee_name: tx.employee_name || '',
    amount: Number(tx.amount) || 0,
  })) : undefined,
});

export const ordersApi = {
  createOrder: async (data: CreateOrderInput): Promise<{ id: string }> => {
    const response = await apiClient.post('/orders', data);
    // Backend returns { success: true, data: { id: orderId } }
    return response.data.data;
  },

  getOrders: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    time_filter?: string;
    branch_id?: string;
    marketer_id?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<{ orders: Order[]; total: number; pages: number }> => {
    // Customers can ONLY use page/limit params (backend forbids advanced filters)
    const safeParams = params ? { page: params.page, limit: params.limit } : {};
    const response = await apiClient.get('/orders', { params: safeParams });
    // Backend returns { success: true, body: { data: [], pagination: { total, ... } } }
    const result = response.data.body;
    return {
      orders: (result.data || []).map(mapOrder),
      total: result.pagination?.total || 0,
      pages: result.pagination?.pages || 0,
    };
  },

  getOrderDetails: async (orderId: string): Promise<Order> => {
    const response = await apiClient.get(`/orders/${orderId}`);
    // Backend returns { success: true, body: orderObject }
    return mapOrder(response.data.body);
  },

  approveOrder: async (orderId: string): Promise<void> => {
    await apiClient.put(`/orders/${orderId}/approve`);
  },

  rejectOrder: async (orderId: string): Promise<void> => {
    await apiClient.put(`/orders/${orderId}/reject`);
  },

  cancelOrder: async (orderId: string): Promise<void> => {
    await apiClient.put(`/orders/${orderId}/cancel`);
  },
};
