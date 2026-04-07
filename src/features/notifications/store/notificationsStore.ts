import { create } from 'zustand';
import { Notification } from '../types';
import { notificationsApi } from '../api/notificationsApi';

interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;

  fetchNotifications: (userId: string) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: (userId: string) => Promise<void>;
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,

  fetchNotifications: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const notifications = await notificationsApi.getNotifications(userId);
      const unreadCount = notifications.filter(n => !n.isRead).length;
      set({ notifications, unreadCount, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'فشل جلب الإشعارات', isLoading: false });
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
