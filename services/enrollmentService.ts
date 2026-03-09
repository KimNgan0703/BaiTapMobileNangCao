import apiClient, { ApiResponse } from './api';

export interface EnrollmentCheck {
  courseId: string;
  isEnrolled: boolean;
}

export const enrollmentService = {
  checkEnrollment: async (courseIds: string[]): Promise<ApiResponse<EnrollmentCheck[]>> => {
    const response = await apiClient.post<ApiResponse<EnrollmentCheck[]>>('/enrollments/check', courseIds);
    return response.data;
  },
};
