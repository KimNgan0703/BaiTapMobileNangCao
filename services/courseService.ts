import apiClient, { ApiResponse, COURSE_API_URL } from './api';

export interface Course {
  id: string;
  title: string;
  description: string;
  category: string | null;
  price: number;
  duration: number;
}

export const courseService = {
  getCourses: async (query: string = '', page: number = 0, size: number = 10) => {
    // Note: User prompt has page=1 in URL example but meta response has page: 0. 
    // Usually APIs are 0-indexed or 1-indexed. I'll pass what defines.
    const response = await apiClient.get<ApiResponse<Course[]>>(`${COURSE_API_URL}/courses`, {
      params: { query, page, size }
    });
    return response.data;
  },

  getCourseById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Course>>(`${COURSE_API_URL}/courses/${id}`);
    return response.data;
  }
};
