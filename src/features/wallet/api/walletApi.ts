import { apiClient } from '../../../core/api/apiClient';
import { USE_MOCK_API } from '../../../config/env';
import { WalletSummary, WalletTransaction, SalaryRequest, SalaryRequestTransaction } from '../types';

// Mappers
const mapWalletSummary = (apiData: any): WalletSummary => ({
  currentBalance: Number(apiData.currentBalance || apiData.current_balance) || 0,
  totalEarned: Number(apiData.totalEarned || apiData.total_earned) || 0,
  totalWithdrawn: Number(apiData.totalWithdrawn || apiData.total_withdrawn) || 0,
  pendingRequestsTotal: Number(apiData.pendingRequestsTotal || apiData.pending_requests_total) || 0,
});

const mapWalletTransaction = (apiData: any): WalletTransaction => ({
  id: apiData.id || '',
  type: apiData.type || 'CREDIT',
  amount: Number(apiData.amount) || 0,
  description: apiData.description || '',
  date: apiData.date || apiData.created_at || new Date().toISOString(),
  orderId: apiData.orderId || apiData.order_id,
});

const mapSalaryRequest = (apiData: any): SalaryRequest => ({
  id: apiData.id || '',
  amount: Number(apiData.amount || apiData.requested_amount) || 0,
  status: apiData.status || 'PENDING',
  requestDate: apiData.requestDate || apiData.request_date || apiData.created_at || new Date().toISOString(),
  employeeName: apiData.employeename || apiData.employeeName || 'موظف غير معروف',
  phone: apiData.phone,
  role: apiData.role,
  branch: apiData.branch,
  processedDate: apiData.processedDate || apiData.processed_at,
});

const mapSalaryRequestTransaction = (apiData: any): SalaryRequestTransaction => ({
  id: apiData.id || '',
  amount: Number(apiData.amount) || 0,
  order_id: apiData.order_id || apiData.orderId,
  created_at: apiData.created_at || new Date().toISOString(),
  total_main_price: Number(apiData.total_main_price) || 0,
  total_sold_price: Number(apiData.total_sold_price) || 0,
});

// Mock data
let mockTransactions: WalletTransaction[] = [
  { id: 'tx1', type: 'CREDIT', amount: 150.00, description: 'عمولة طلب #ord_123', date: new Date(Date.now() - 86400000 * 2).toISOString(), orderId: 'ord_123' },
  { id: 'tx2', type: 'CREDIT', amount: 50.00, description: 'عمولة طلب #ord_124', date: new Date(Date.now() - 86400000 * 1).toISOString(), orderId: 'ord_124' },
  { id: 'tx3', type: 'DEBIT', amount: 100.00, description: 'سحب أرباح', date: new Date(Date.now() - 86400000 * 0.5).toISOString() }
];

let mockSalaryRequests: SalaryRequest[] = [];

let mockSummary: WalletSummary = {
  currentBalance: 100.00,
  totalEarned: 200.00,
  totalWithdrawn: 100.00,
  pendingRequestsTotal: 0,
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
export const walletApi = {
  getWalletSummary: async (userId: string): Promise<WalletSummary> => {
    try {
      const response = await apiClient.get('/wallet/summary');
      return mapWalletSummary(response.data.data);
    } catch (error: any) {
      console.error("getWalletSummary Error:", error);
      throw new Error(error.response?.data?.message || error.message || 'فشل جلب ملخص المحفظة');
    }
  },

  getTransactions: async (userId: string): Promise<WalletTransaction[]> => {
    try {
      const response = await apiClient.get('/wallet/transactions');
      return (response.data.data || []).map(mapWalletTransaction);
    } catch (error: any) {
      console.error("getTransactions Error:", error);
      throw new Error(error.response?.data?.message || error.message || 'فشل جلب الحركات المالية');
    }
  },

  getSalaryRequests: async (page = 1, limit = 20): Promise<{ data: SalaryRequest[]; pagination: any }> => {
    try {
      const response = await apiClient.get(`/salary-requests?limit=${limit}&page=${page}`);
      const data = response.data.data?.data || response.data.data || [];
      const pagination = response.data.data?.pagination || { total: data.length, page, limit, pages: 1 };
      return {
        data: data.map(mapSalaryRequest),
        pagination,
      };
    } catch (error: any) {
      console.error("getSalaryRequests Error:", error);
      throw new Error(error.response?.data?.message || error.message || 'فشل جلب طلبات السحب');
    }
  },

  createSalaryRequest: async (): Promise<SalaryRequest> => {
    try {
      // Backend automatically bundles available balance
      const response = await apiClient.post('/salary-requests');
      return mapSalaryRequest(response.data.data);
    } catch (error: any) {
      console.error("createSalaryRequest Error:", error);
      throw new Error(error.response?.data?.message || error.message || 'فشل تقديم طلب السحب');
    }
  },

  approveRequest: async (requestId: string): Promise<void> => {
    try {
      await apiClient.patch(`/salary-requests/${requestId}/approve`);
    } catch (error: any) {
      console.error("approveRequest Error:", error);
      throw new Error(error.response?.data?.message || error.message || 'فشل الموافقة على الطلب');
    }
  },

  rejectRequest: async (requestId: string): Promise<void> => {
    try {
      await apiClient.patch(`/salary-requests/${requestId}/reject`);
    } catch (error: any) {
      console.error("rejectRequest Error:", error);
      throw new Error(error.response?.data?.message || error.message || 'فشل رفض الطلب');
    }
  },

  getSalaryRequestDetails: async (requestId: string): Promise<SalaryRequest> => {
    try {
      const response = await apiClient.get(`/salary-requests/${requestId}`);
      const data = response.data.data || response.data.body;
      
      return {
        ...mapSalaryRequest(data),
        transactions: (data.transactions || []).map(mapSalaryRequestTransaction),
      };
    } catch (error: any) {
      console.error("getSalaryRequestDetails Error:", error);
      throw new Error(error.response?.data?.message || error.message || 'فشل جلب تفاصيل طلب الراتب');
    }
  },

  removeTransactionFromRequest: async (requestId: string, transactionId: string): Promise<{ newAmount: number }> => {
    try {
      const response = await apiClient.patch(`/salary-requests/${requestId}/remove-transaction`, {
        transactionId,
      });
      const result = response.data.data;
      return {
        newAmount: Number(result.newAmount) || 0,
      };
    } catch (error: any) {
      console.error("removeTransactionFromRequest Error:", error);
      throw new Error(error.response?.data?.message || error.message || 'فشل إزالة المعاملة من الطلب');
    }
  }
};

