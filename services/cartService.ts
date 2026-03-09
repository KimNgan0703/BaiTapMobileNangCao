import apiClient, { ApiResponse } from './api';
import { Course } from './courseService';

export interface CartItem {
  id: string;
  course: Course;
}

export const cartService = {
  getCart: async (): Promise<ApiResponse<CartItem[]>> => {
    const response = await apiClient.get<ApiResponse<CartItem[]>>('/cart');
    return response.data;
  },

  addToCart: async (courseId: string): Promise<ApiResponse> => {
    const response = await apiClient.post<ApiResponse>('/cart', { courseId });
    return response.data;
  },

  removeFromCart: async (id: string): Promise<ApiResponse> => {
    const response = await apiClient.delete<ApiResponse>(`/cart/${id}`);
    return response.data;
  },

  clearCart: async (): Promise<ApiResponse> => {
    const response = await apiClient.delete<ApiResponse>('/cart/clear');
    return response.data;
  },
};
