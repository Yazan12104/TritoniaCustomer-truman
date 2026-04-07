import { apiClient } from '../../../core/api/apiClient';
import { USE_MOCK_API } from '../../../config/env';
import { Notification } from '../types';

// Mappers
const mapNotification = (apiData: any): Notification => ({
  id: apiData.id || '',
  type: apiData.type || 'SYSTEM',
  title: apiData.title || '',
  body: apiData.body || apiData.message || '',
  isRead: Boolean(apiData.isRead || apiData.is_read),
  createdAt: apiData.createdAt || apiData.created_at || new Date().toISOString(),
  orderId: apiData.orderId || apiData.order_id,
  employeeId: apiData.employeeId || apiData.employee_id,
  salaryRequestId: apiData.salaryRequestId || apiData.salary_request_id,
});

// Mock Logic
let mockNotifications: Notification[] = [
  { id: 'notif_1', type: 'ORDER_CREATED', title: 'طلب جديد', body: 'تم إنشاء الطلب #ord_123 بنجاح وهو قيد المعالجة.', isRead: false, createdAt: new Date(Date.now() - 60000 * 5).toISOString(), orderId: 'ord_123' },
  { id: 'notif_2', type: 'ORDER_STATUS_UPDATED', title: 'تحديث حالة الطلب', body: 'تم تأكيد الطلب #ord_124 من قبل الفرع.', isRead: false, createdAt: new Date(Date.now() - 60000 * 30).toISOString(), orderId: 'ord_124' },
  { id: 'notif_3', type: 'SALARY_REQUEST_APPROVED', title: 'تمت الموافقة على طلب السحب', body: 'تمت الموافقة على طلب سحب الأرباح بمبلغ 150 د.ع.', isRead: true, createdAt: new Date(Date.now() - 86400000 * 1).toISOString(), salaryRequestId: 'req_001' },
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const notificationsApi = {
  getNotifications: async (userId: string): Promise<Notification[]> => {
    try {
      if (USE_MOCK_API) {
        await delay(400);
        return [...mockNotifications].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      } else {
        const response = await apiClient.get('/notifications');
        // Backend may return different shapes: array directly, { data: [...] }, { body: [...] }, or { data: { notifications: [...] } }
        const payload = response.data;
        let list: any[] = [];
        if (Array.isArray(payload)) list = payload;
        else if (Array.isArray(payload.data)) list = payload.data;
        else if (Array.isArray(payload.data?.data)) list = payload.data.data;
        else if (Array.isArray(payload.body)) list = payload.body;
        else if (Array.isArray(payload.data?.notifications)) list = payload.data.notifications;
        else if (Array.isArray(payload.notifications)) list = payload.notifications;

        return (list || []).map(mapNotification);
      }
    } catch (error: any) {
      console.error("getNotifications Error:", error);
      // Log server response body for debugging
      if (error.response) console.error('getNotifications response:', error.response.data);
      throw new Error(error.response?.data?.message || error.message || 'فشل جلب الإشعارات');
    }
  },

  markAsRead: async (notificationId: string): Promise<Notification> => {
    try {
      if (USE_MOCK_API) {
        await delay(200);
        const idx = mockNotifications.findIndex(n => n.id === notificationId);
        if (idx === -1) throw new Error('الإشعار غير موجود');
        mockNotifications[idx] = { ...mockNotifications[idx], isRead: true };
        return { ...mockNotifications[idx] };
      } else {
        const response = await apiClient.patch(`/notifications/${notificationId}/read`);
        const payload = response.data;
        // If backend returns the updated notification object, map it. Otherwise return a minimal fallback.
        const item = payload?.data || payload?.body || payload;
        if (item && (item.id || item.is_read || item.isRead)) {
          return mapNotification(item);
        }
        // Fallback: return a minimal object indicating the notification was marked as read
        return { id: notificationId, type: 'SYSTEM', title: '', body: '', isRead: true, createdAt: new Date().toISOString() } as Notification;
      }
    } catch (error: any) {
      console.error("markAsRead Error:", error);
      if (error.response) console.error('markAsRead response:', error.response.data);
      throw new Error(error.response?.data?.message || error.message || 'فشل تحديث حالة الإشعار');
    }
  },

  markAllAsRead: async (userId: string): Promise<void> => {
    try {
      if (USE_MOCK_API) {
        await delay(300);
        mockNotifications = mockNotifications.map(n => ({ ...n, isRead: true }));
      } else {
        await apiClient.put('/notifications/read-all');
      }
    } catch (error: any) {
      console.error("markAllAsRead Error:", error);
      throw new Error(error.response?.data?.message || error.message || 'فشل تحديث حالة الإشعارات');
    }
  },
};
