import apiClient, { ApiResponse } from './api';

export interface ReviewReport {
  id: string;
  reviewId: string;
  reporterId: string;
  reason: string;
}

export interface ReviewReaction {
  id: string;
  userId: string;
  reviewId: string;
  liked: boolean;
}

export interface Review {
  id: string;
  userId: string;
  courseId: string;
  content: string;
  rating: number;
  reports: ReviewReport[];
  reactions: ReviewReaction[];
}

export const reviewService = {
  getReviews: async (courseId: string): Promise<ApiResponse<Review[]>> => {
    const response = await apiClient.get<ApiResponse<Review[]>>('/reviews', { params: { courseId } });
    return response.data;
  },

  createReview: async (data: { courseId: string; content: string; rating: number }): Promise<ApiResponse<null>> => {
    const response = await apiClient.post<ApiResponse<null>>('/reviews', data);
    return response.data;
  },

  updateReview: async (reviewId: string, data: { content: string; rating: number }): Promise<ApiResponse<null>> => {
    const response = await apiClient.put<ApiResponse<null>>(`/reviews/${reviewId}`, data);
    return response.data;
  },

  deleteReview: async (reviewId: string): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete<ApiResponse<null>>(`/reviews/${reviewId}`);
    return response.data;
  },

  reportReview: async (reviewId: string, reason: string): Promise<ApiResponse<null>> => {
    const response = await apiClient.post<ApiResponse<null>>(`/reviews/${reviewId}/report`, { reason });
    return response.data;
  },

  reactToReview: async (reviewId: string, liked: boolean): Promise<ApiResponse<null>> => {
    const response = await apiClient.post<ApiResponse<null>>(`/reviews/${reviewId}/react`, { liked });
    return response.data;
  },
};
