import { Platform } from 'react-native';
import { getAccessToken, getRefreshToken, saveTokens, clearAuth } from '@/utils/storage';

// Adjust for Android Emulator vs iOS Simulator vs Web
export const API_URL = Platform.OS === 'android' ? 'http://10.0.2.2:8888/api/v1' : 'http://localhost:8888/api/v1';

interface RequestConfig extends RequestInit {
  headers?: any;
}

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

export const fetchWithAuth = async (endpoint: string, config: RequestConfig = {}) => {
  const url = `${API_URL}${endpoint}`;
  let token = await getAccessToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...config.headers,
  };

  try {
    let response = await fetch(url, { ...config, headers });

    // Handle 401 Unauthorized (Token expired)
    if (response.status === 401) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((newToken) => {
            return fetch(url, {
              ...config,
              headers: { ...headers, Authorization: `Bearer ${newToken}` },
            });
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      // Start refreshing token
      isRefreshing = true;
      const refreshToken = await getRefreshToken();

      if (!refreshToken) {
        // No refresh token, force logout
        await clearAuth();
        // You might want to trigger a redirect here or handle it in the UI
        return response; 
      }

      try {
        const refreshResponse = await fetch(`${API_URL}/auth/refresh-token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: refreshToken }),
        });

        const refreshData = await refreshResponse.json();

        if (refreshResponse.ok && refreshData.data && refreshData.data.token) {
          // Assuming structure is data.token.accessToken/refreshToken based on user sample
          // Or user sample says: data: { token: { accessToken: "...", refreshToken: "..." } }
          // Actually user sample for refresh token response is NOT explicitly given, 
          // but login response has data.token.accessToken.
          // Let's assume refresh endpoint returns similar structure or at least new accessToken.
          
          // User request body for refresh-token: { token: "..." }
          // Let's assume response is standard success response
          
          const newAccessToken = refreshData.data.token?.accessToken || refreshData.data.accessToken; 
          const newRefreshToken = refreshData.data.token?.refreshToken || refreshData.data.refreshToken || refreshToken;

          if (newAccessToken) {
            await saveTokens(newAccessToken, newRefreshToken);
            processQueue(null, newAccessToken);
            
            // Retry original request
            return fetch(url, {
              ...config,
              headers: { ...headers, Authorization: `Bearer ${newAccessToken}` },
            });
          } else {
             throw new Error('No access token in refresh response');
          }
        } else {
          throw new Error('Refresh failed');
        }
      } catch (err) {
        processQueue(err, null);
        await clearAuth();
        throw err;
      } finally {
        isRefreshing = false;
      }
    }

    return response;
  } catch (error) {
    throw error;
  }
};

export const authService = {
  login: async (email, password) => {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });
    return response.json();
  },
  
  register: async (name, email, password, gender) => {
    const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, gender }),
    });
    return response.json();
  },

  verifyOtp: async (email, otp) => {
      const response = await fetch(`${API_URL}/auth/verify-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, otp }),
      });
      return response.json();
  },

  sendOtp: async (email) => {
     const response = await fetch(`${API_URL}/auth/send-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
      });
      return response.json();
  },

  resetPassword: async (email, otp, newPassword) => {
      const response = await fetch(`${API_URL}/auth/reset-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, otp, newPassword }),
      });
      return response.json();
  }
};
