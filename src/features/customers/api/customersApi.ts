// customersApi.ts
import { apiClient } from '../../../core/api/apiClient';
import { USE_MOCK_API } from '../../../config/env';
import { Customer, CreateCustomerInput, PaginatedResponse, ApiResponse } from '../types';

// ==================== Mappers ====================

// Map backend customer list item to frontend Customer
const mapListCustomer = (backendCustomer: any): Customer => ({
  id: backendCustomer.customer_id || backendCustomer.id,
  customer_id: backendCustomer.customer_id,
  customer_user_id: backendCustomer.customer_user_id,
  user_id: backendCustomer.customer_user_id || backendCustomer.user_id,
  full_name: backendCustomer.name || '',
  name: backendCustomer.name || '',
  phone: backendCustomer.phone || '',
  is_active: backendCustomer.customer_is_active !== undefined ? backendCustomer.customer_is_active : true,
  governorate: backendCustomer.governorate,
  referred_by_name: backendCustomer.referred_by_name,
  referred_by_role: backendCustomer.referred_by_role,
  first_marketer_name: backendCustomer.first_marketer_name,
  first_marketer_role: backendCustomer.first_marketer_role,
  createdAt: backendCustomer.created_at || new Date().toISOString(),
});

// Map backend customer details to frontend Customer (with orders)
const mapDetailsCustomer = (backendCustomer: any): Customer => ({
  id: backendCustomer.id,
  customer_user_id: backendCustomer.customer_user_id || backendCustomer.user_id,
  user_id: backendCustomer.customer_user_id || backendCustomer.user_id,
  full_name: backendCustomer.full_name || '',
  name: backendCustomer.full_name || '',
  phone: backendCustomer.phone || '',
  governorate: backendCustomer.governorate,
  referred_by_name: backendCustomer.referred_by_name,
  referred_by_phone: backendCustomer.referred_by_phone,
  first_marketer_name: backendCustomer.first_marketer_name,
  first_marketer_phone: backendCustomer.first_marketer_phone,
  orders: backendCustomer.orders?.map((order: any) => ({
    id: order.id,
    order_number: order.order_number || order.id?.substring(0, 8),
    total_amount: order.total_amount || order.sold_price || 0,
    status: order.status,
    created_at: order.created_at,
    items: order.items?.map((item: any) => ({
      id: item.id,
      order_id: item.order_id,
      product_name: item.product_name || item.name || 'منتج',
      quantity: item.quantity || 0,
      price: item.price || item.main_price || 0,
    })) || [],
  })) || [],
  createdAt: backendCustomer.created_at || new Date().toISOString(),
});

// ==================== Mock Data ====================
let MOCK_CUSTOMERS: Customer[] = [];
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// ==================== API Methods ====================

export const customersApi = {
  // Get customers with pagination
  getCustomers: async (page: number = 1, limit: number = 20, search?: string): Promise<PaginatedResponse<Customer>> => {
    try {
      if (USE_MOCK_API) {
        await delay(700);
        let MOCK_DATA = MOCK_CUSTOMERS;
        if (search) {
          MOCK_DATA = MOCK_DATA.filter(c => c.name?.includes(search) || c.phone?.includes(search));
        }
        const start = (page - 1) * limit;
        const paginatedData = MOCK_DATA.slice(start, start + limit);
        return {
          data: paginatedData,
          pagination: {
            total: MOCK_DATA.length,
            page,
            limit,
            pages: Math.ceil(MOCK_DATA.length / limit),
          },
        };
      } else {
        const response = await apiClient.get<ApiResponse<PaginatedResponse<any>>>('/customers', {
          params: { page, limit, search },
        });
        
        // Backend returns: { success: true, data: { data: [...], pagination: {...} } }
        const backendData = response.data.data;
        
        return {
          data: (backendData.data || []).map(mapListCustomer),
          pagination: backendData.pagination || {
            total: 0,
            page,
            limit,
            pages: 0,
          },
        };
      }
    } catch (error: any) {
      console.error("getCustomers Error:", error);
      throw new Error(error.response?.data?.message || error.message || 'فشل جلب قائمة العملاء');
    }
  },

  // Add new customer
addCustomer: async (data: CreateCustomerInput): Promise<Customer> => {
  try {
    if (USE_MOCK_API) {
      await delay(800);
      const newCustomer: Customer = {
        id: `c${Date.now()}`,
        full_name: `${data.first_name} ${data.last_name}`,
        name: `${data.first_name} ${data.last_name}`,
        phone: data.phone,
        governorate: data.governorate_id, // سيتم تحويله لاحقاً
        createdAt: new Date().toISOString(),
      };
      MOCK_CUSTOMERS = [newCustomer, ...MOCK_CUSTOMERS];
      return newCustomer;
    } else {
      // Prepare payload for backend
      const payload = {
        first_name: data.first_name,
        last_name: data.last_name,
        phone: data.phone,
        password: data.password,
        governorate_id: data.governorate_id, // الآن UUID string
      };

      const response = await apiClient.post<ApiResponse<{ id: string }>>('/customers', payload);

      return {
        id: response.data.data.id,
        full_name: `${data.first_name} ${data.last_name}`,
        name: `${data.first_name} ${data.last_name}`,
        phone: data.phone,
        governorate: data.governorate_id, // مؤقتاً
        createdAt: new Date().toISOString(),
      };
    }
  } catch (error: any) {
    console.error("addCustomer Error:", error);
    throw new Error(error.response?.data?.message || error.message || 'فشل إضافة عميل جديد');
  }
},

  // Get customer details with orders
  getCustomerDetails: async (id: string): Promise<Customer> => {
    try {
      if (USE_MOCK_API) {
        await delay(500);
        const customer = MOCK_CUSTOMERS.find(c => c.id === id);
        if (!customer) throw new Error('Customer not found');
        return { ...customer, orders: [] };
      } else {
        const response = await apiClient.get<ApiResponse<any>>(`/customers/${id}`);
        // Backend returns: { success: true, data: { ...customer, orders: [...] } }
        return mapDetailsCustomer(response.data.data);
      }
    } catch (error: any) {
      console.error("getCustomerDetails Error:", error);
      throw new Error(error.response?.data?.message || error.message || 'فشل جلب تفاصيل العميل');
    }
  },
};