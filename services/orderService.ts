import apiClient, { ApiResponse } from './api';
import { CartItem } from './cartService';

export interface OrderItem {
  id: string;
  courseId: string;
  title: string;
  price: number;
  discountedPrice: number | null;
}

export interface PaymentInfo {
  id: string;
  amount: number;
  status: string;
  paymentDate: string | null;
  paymentInfo: string | null;
  paymentMessage: string;
}

export interface Order {
  id: string;
  items: OrderItem[];
  totalPrice: number;
  discounted: number;
  orderDate: string;
  payment?: PaymentInfo;
}

export interface CreateOrderRequest {
  paymentMethod: string;
  cartItems: CartItem[];
}

export const orderService = {
  getOrders: async (page = 1, limit = 10): Promise<ApiResponse<Order[]>> => {
    const response = await apiClient.get<ApiResponse<Order[]>>('/orders', {
      params: { page, limit },
    });
    return response.data;
  },

  getOrderById: async (id: string): Promise<ApiResponse<Order>> => {
    const response = await apiClient.get<ApiResponse<Order>>(`/orders/${id}`);
    return response.data;
  },

  createOrder: async (data: CreateOrderRequest): Promise<ApiResponse<Order>> => {
    const response = await apiClient.post<ApiResponse<Order>>('/orders', data);
    return response.data;
  },
};
