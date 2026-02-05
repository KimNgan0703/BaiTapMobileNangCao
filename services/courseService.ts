import apiClient, { ApiResponse, HOST } from './api';

export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  discountedPrice: number | null;
  rating: number;
  enrolmentCount: number;
  isPublished: boolean;
  isInSubscription: boolean;
  duration: number;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface CourseParams {
  query?: string;
  page?: number;
  size?: number;
  sort?: string; // JSON string like '{"createdAt":"desc"}'
  category?: string;
}

export const courseService = {
  getCourses: async (params: CourseParams = {}) => {
    // Determine sort string. Using provided format or defaults.
    const { query, page = 1, size = 10, sort, category } = params;
    const response = await apiClient.get<ApiResponse<Course[]>>('/courses', {
      params: { 
        query, 
        page, 
        size, 
        sort,
        ...(category && { category }) 
      }
    });
    return response.data;
  },

  getCategories: async () => {
    const response = await apiClient.get<ApiResponse<Category[]>>('/categories');
    return response.data;
  },

  getCourseById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Course>>(`/courses/${id}`);
    return response.data;
  }
};
