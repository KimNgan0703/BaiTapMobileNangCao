import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { Platform } from 'react-native';
import { getAccessToken, getRefreshToken, saveTokens, clearAuth } from '@/utils/storage';

// Adjust for Android Emulator vs iOS Simulator vs Web
export const API_URL = Platform.OS === 'android' ? 'http://10.0.2.2:8888/api/v1' : 'http://localhost:8888/api/v1';

export interface ApiResponse<T = any> {
  status: number;
  message: string;
  data: T;
}

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Request Interceptor
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Prevent infinite loops and handle missing config
    if (!originalRequest) {
        return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await getRefreshToken();

        if (!refreshToken) {
           throw new Error('No refresh token');
        }

        const response = await axios.post(`${API_URL}/auth/refresh-token`, { token: refreshToken });
        const { data } = response;

        if (data && data.data && data.data.accessToken) {
            const newAccessToken = data.data.accessToken;
            const newRefreshToken = data.data.refreshToken || refreshToken;

            await saveTokens(newAccessToken, newRefreshToken);
            
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
            processQueue(null, newAccessToken);

            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return apiClient(originalRequest);
        } else {
             throw new Error('Refresh failed');
        }
      } catch (err) {
        processQueue(err, null);
        await clearAuth();
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    
    // Standardize error message to return string if possible or keep error object
    // But userService expects to catch error
    const errorMessage = (error.response?.data as any)?.message || error.message || 'Network Error';
    // Throwing just message might lose context, but UI usually wants message.
    // Let's attach message to error object
    if (error.response && error.response.data && typeof (error as any).response.data === 'object') {
         // (error as any).message = (error.response.data as any).message;
    }
    return Promise.reject(errorMessage); 
  }
);

export default apiClient;

export const authService = {
  login: async (email, password) => {
    const response = await apiClient.post('/auth/login', { email, password });
    return response.data;
  },
  
  register: async (name, email, password, gender) => {
    const response = await apiClient.post('/auth/register', { name, email, password, gender });
    return response.data;
  },

  verifyOtp: async (email, otp) => {
      const response = await apiClient.post('/auth/verify-otp', { email, otp });
      return response.data;
  },

  sendOtp: async (email) => {
     const response = await apiClient.post('/auth/send-otp', { email });
     return response.data;
  },

  resetPassword: async (email, otp, newPassword) => {
      const response = await apiClient.post('/auth/reset-password', { email, otp, newPassword });
      return response.data;
  }
};
