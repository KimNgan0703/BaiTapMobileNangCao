import apiClient, { ApiResponse } from './api';

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
  updateProfile: async (id: number | string, data: UpdateProfileData): Promise<ApiResponse> => {
    const formData = new FormData();
    
    // Append JSON data as a string for the 'user' part
    formData.append('user', JSON.stringify({
        name: data.name,
        gender: data.gender
    }));

    // Append Avatar file if present
    if (data.avatarUri) {
        const uriParts = data.avatarUri.split('.');
        const fileType = uriParts[uriParts.length - 1];
        
        formData.append('avatar', {
            uri: data.avatarUri,
            name: `avatar.${fileType}`,
            type: `image/${fileType}`,
        } as any);
    }

    const response = await apiClient.put<ApiResponse>(`/users/${id}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
  },

  sendChangePasswordOtp: async (email: string): Promise<ApiResponse> => {
    const response = await apiClient.post<ApiResponse>('/auth/send-change-password-otp', { email });
    return response.data;
  },

  changePassword: async (data: ChangePasswordData): Promise<ApiResponse> => {
    const response = await apiClient.post<ApiResponse>('/auth/change-password', data);
    return response.data;
  },

  sendChangeEmailOtp: async (email: string): Promise<ApiResponse> => {
    const response = await apiClient.post<ApiResponse>('/auth/send-change-email-otp', { email });
    return response.data;
  },

  changeEmail: async (data: ChangeEmailData): Promise<ApiResponse> => {
     const response = await apiClient.post<ApiResponse>('/auth/change-email', data);
     return response.data;
  },
};
