import apiClient, { ApiResponse } from './api';

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
}

export interface NotificationQueryParams {
  page?: number;
  limit?: number;
}

export const notificationService = {
  getNotifications: async (
    params: NotificationQueryParams = { page: 1, limit: 10 }
  ): Promise<ApiResponse<NotificationItem[]>> => {
    const response = await apiClient.get<ApiResponse<NotificationItem[]>>('/notifications', { params });
    return response.data;
  },

  getUnreadCount: async (): Promise<ApiResponse<number>> => {
    const response = await apiClient.get<ApiResponse<number>>('/notifications/unread-count');
    return response.data;
  },

  toggleRead: async (notificationId: string): Promise<ApiResponse<null>> => {
    const response = await apiClient.post<ApiResponse<null>>(`/notifications/${notificationId}/toggle-read`);
    return response.data;
  },

  deleteNotification: async (notificationId: string): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete<ApiResponse<null>>(`/notifications/${notificationId}`);
    return response.data;
  },
};
