import apiClient, { ApiResponse } from './api';

export interface PaymentRequest {
  paymentMethod: string;
  orderId: string;
}

export const paymentService = {
  getPaymentUrl: async (data: PaymentRequest): Promise<ApiResponse<string>> => {
    const response = await apiClient.post<ApiResponse<string>>('/payments', data);
    return response.data;
  },
};
