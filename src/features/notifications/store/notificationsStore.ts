import { create } from 'zustand';
import { Notification } from '../types';
import { notificationsApi } from '../api/notificationsApi';

interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  pagination: { total: number; page: number; limit: number; pages: number };
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;

  fetchNotifications: (userId: string, page?: number, limit?: number, loadMore?: boolean) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: (userId: string) => Promise<void>;
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  pagination: { total: 0, page: 1, limit: 20, pages: 1 },
  isLoading: false,
  isLoadingMore: false,
  error: null,

  fetchNotifications: async (userId: string, page = 1, limit = 20, loadMore = false) => {
    const state = get();
    if (loadMore && state.isLoadingMore) return;

    set({ isLoading: !loadMore, isLoadingMore: loadMore, error: null });
    try {
      const response = await notificationsApi.getNotifications(userId, page, limit);
      set((state) => {
        const existingIds = new Set(state.notifications.map((n) => n.id));
        const uniqueNewData = response.data.filter((n) => !existingIds.has(n.id));
        const notifications = loadMore ? [...state.notifications, ...uniqueNewData] : response.data;
        const unreadCount = notifications.filter((n) => !n.isRead).length;

        return {
          notifications,
          unreadCount,
          pagination: response.pagination,
          isLoading: false,
          isLoadingMore: false,
        };
      });
    } catch (error: any) {
      console.warn('Failed to fetch notifications:', error.message);
      set({ notifications: [], unreadCount: 0, isLoading: false, isLoadingMore: false, error: error.message || 'فشل جلب الإشعارات' });
    }
  },

  markAsRead: async (notificationId: string) => {
    try {
      const updated = await notificationsApi.markAsRead(notificationId);
      set(state => ({
        notifications: state.notifications.map(n =>
          n.id === notificationId
            ? {
                ...n,
                // only overwrite title/body if backend returned non-empty values
                ...(updated.title && updated.title.length > 0 ? { title: updated.title } : {}),
                ...(updated.body && updated.body.length > 0 ? { body: updated.body } : {}),
                isRead: typeof updated.isRead === 'boolean' ? updated.isRead : n.isRead,
                createdAt: updated.createdAt || n.createdAt,
              }
            : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch (error: any) {
      set({ error: error.message || 'فشل تحديث الإشعار' });
    }
  },

  markAllAsRead: async (userId: string) => {
    try {
      await notificationsApi.markAllAsRead(userId);
      set(state => ({
        notifications: state.notifications.map(n => ({ ...n, isRead: true })),
        unreadCount: 0,
      }));
    } catch (error: any) {
      set({ error: error.message || 'فشل تحديث الإشعارات' });
    }
  },
}));
