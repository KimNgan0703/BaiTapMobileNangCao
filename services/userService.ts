import { Platform } from 'react-native';
import apiClient, { ApiResponse, HOST } from './api';

interface UpdateProfileData {
    name: string;
    gender: string;
    avatarUri?: string;
}

interface ChangePasswordData {
    email: string;
    otp: string;
    oldPassword: string;
    newPassword: string;
}

interface ChangeEmailData {
    oldEmail: string;
    otp: string;
    newEmail: string;
}

export const userService = {
  getMe: async (): Promise<ApiResponse> => {
      const response = await apiClient.get<ApiResponse>(`${HOST}/users/me`);
      return response.data;
  },
  
  updateProfile: async (id: string, data: UpdateProfileData): Promise<ApiResponse> => {
    const formData = new FormData();

    const { avatarUri, ...profileData } = data;

    formData.append("name", profileData.name);
    formData.append("phone", profileData.gender);

  if (avatarUri) {

    // WEB
    if (Platform.OS === "web") {
      const response = await fetch(avatarUri);
      const blob = await response.blob();
      formData.append("avatar", blob, "avatar.jpg");
    }

    // ANDROID + IOS
    else {
      const fileType = avatarUri.split('.').pop()?.split('?')[0] || 'jpg';

      formData.append("avatar", {
        uri: avatarUri,
        name: `avatar.${fileType}`,
        type: `image/${fileType}`,
      } as any);
    }
  }

    const response = await apiClient.put<ApiResponse>(`${HOST}/users/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  
  sendChangePasswordOtp: async (email: string): Promise<ApiResponse> => {
    const response = await apiClient.post<ApiResponse>(`${HOST}/auth/send-change-password-otp`, { email });
    return response.data;
  },

  changePassword: async (data: ChangePasswordData): Promise<ApiResponse> => {
    const response = await apiClient.post<ApiResponse>(`${HOST}/auth/change-password`, data);
    return response.data;
  },

  sendChangeEmailOtp: async (email: string): Promise<ApiResponse> => {
    const response = await apiClient.post<ApiResponse>(`${HOST}/auth/send-change-email-otp`, { email });
    return response.data;
  },

  changeEmail: async (data: ChangeEmailData): Promise<ApiResponse> => {
     const response = await apiClient.post<ApiResponse>(`${HOST}/auth/change-email`, data);
     return response.data;
  },
};

