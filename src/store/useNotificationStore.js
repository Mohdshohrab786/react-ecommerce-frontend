import { create } from 'zustand';
import axios from 'axios';
import { useAuthStore } from './useAuthStore';

export const useNotificationStore = create((set, get) => ({
    notifications: [],
    unreadCount: 0,
    totalCount: 0,
    loading: false,
    error: null,

    getAuthConfig: () => {
        const userInfo = useAuthStore.getState().userInfo;
        if (userInfo && userInfo.token) {
            return {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`
                }
            };
        }
        return {};
    },

    fetchNotifications: async (type = '', unreadOnly = false) => {
        const config = get().getAuthConfig();
        if (!config.headers) return;

        try {
            const params = new URLSearchParams();
            if (type && type !== 'all') params.append('type', type);
            if (unreadOnly) params.append('unreadOnly', 'true');

            const url = `${window.API_BASE_URL}/api/admin/notifications?${params.toString()}`;
            const { data } = await axios.get(url, config);

            if (data && data.success) {
                set({
                    notifications: data.notifications,
                    unreadCount: data.unreadCount,
                    totalCount: data.totalCount,
                    error: null
                });
            }
        } catch (err) {
            set({ error: err.response?.data?.message || err.message });
        }
    },

    markAsRead: async (id) => {
        const config = get().getAuthConfig();
        if (!config.headers) return;

        // Optimistic update
        const prevList = get().notifications;
        const target = prevList.find(n => n._id === id);
        const wasUnread = target && !target.isRead;

        set({
            notifications: prevList.map(n => n._id === id ? { ...n, isRead: true } : n),
            unreadCount: wasUnread ? Math.max(0, get().unreadCount - 1) : get().unreadCount
        });

        try {
            await axios.put(`${window.API_BASE_URL}/api/admin/notifications/${id}/read`, {}, config);
        } catch (err) {
            // Revert on error
            set({ notifications: prevList });
            console.error('Failed to mark notification as read:', err);
        }
    },

    markAllAsRead: async () => {
        const config = get().getAuthConfig();
        if (!config.headers) return;

        const prevList = get().notifications;
        const prevUnread = get().unreadCount;

        // Optimistic update
        set({
            notifications: prevList.map(n => ({ ...n, isRead: true })),
            unreadCount: 0
        });

        try {
            await axios.put(`${window.API_BASE_URL}/api/admin/notifications/mark-all-read`, {}, config);
        } catch (err) {
            set({ notifications: prevList, unreadCount: prevUnread });
            console.error('Failed to mark all notifications as read:', err);
        }
    },

    deleteNotification: async (id) => {
        const config = get().getAuthConfig();
        if (!config.headers) return;

        const prevList = get().notifications;
        const target = prevList.find(n => n._id === id);
        const wasUnread = target && !target.isRead;

        set({
            notifications: prevList.filter(n => n._id !== id),
            unreadCount: wasUnread ? Math.max(0, get().unreadCount - 1) : get().unreadCount,
            totalCount: Math.max(0, get().totalCount - 1)
        });

        try {
            await axios.delete(`${window.API_BASE_URL}/api/admin/notifications/${id}`, config);
        } catch (err) {
            set({ notifications: prevList });
            console.error('Failed to delete notification:', err);
        }
    },

    clearAll: async () => {
        const config = get().getAuthConfig();
        if (!config.headers) return;

        const prevList = get().notifications;
        const prevUnread = get().unreadCount;
        const prevTotal = get().totalCount;

        set({
            notifications: [],
            unreadCount: 0,
            totalCount: 0
        });

        try {
            await axios.delete(`${window.API_BASE_URL}/api/admin/notifications/clear-all`, config);
        } catch (err) {
            set({ notifications: prevList, unreadCount: prevUnread, totalCount: prevTotal });
            console.error('Failed to clear notifications:', err);
        }
    }
}));
