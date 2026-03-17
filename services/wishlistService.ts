import apiClient, { ApiResponse } from './api';

export interface WishlistItem {
  id: string;
  userId: string;
  courseId: string;
}

export const wishlistService = {
  getWishlist: async (): Promise<ApiResponse<WishlistItem[]>> => {
    const response = await apiClient.get<ApiResponse<WishlistItem[]>>('/wishlist');
    return response.data;
  },

  addToWishlist: async (courseId: string): Promise<ApiResponse<null>> => {
    const response = await apiClient.post<ApiResponse<null>>('/wishlist', { courseId });
    return response.data;
  },

  removeFromWishlist: async (courseId: string): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete<ApiResponse<null>>('/wishlist', { params: { courseId } });
    return response.data;
  },
};
