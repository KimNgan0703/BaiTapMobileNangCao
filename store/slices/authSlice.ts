import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiClient, { ApiResponse } from '@/services/api';
import { userService } from '@/services/userService';
import { clearAuth } from '@/utils/storage';

export interface User {
    id: string;
    email: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    gender?: string;
    phoneNumber?: string;
    avatar?: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  isLoggedIn: boolean;
  updateStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
  isLoggedIn: false,
  updateStatus: 'idle',
};

export const fetchUserProfile = createAsyncThunk(
  'auth/fetchUserProfile',
  async (_, { rejectWithValue }) => {
    try {
      // apiClient returns AxiosResponse, .data is the server response body (ApiResponse)
      const response = await apiClient.get<ApiResponse<User>>('/users/me');
      return response.data.data; // response.data is ApiResponse, data is User
    } catch (error: any) {
        return rejectWithValue(error || 'Network Error');
    }
  }
);

export const updateUserInfo = createAsyncThunk(
    'auth/updateUserInfo',
    async ({ id, data }: { id: string | number, data: { name: string; gender: string; avatarUri?: string } }, { rejectWithValue }) => {
        try {
            const response = await userService.updateProfile(id, data);
            // Backend returns { status, message, data: UserDto }
            return response.data; 
        } catch (error: any) {
            return rejectWithValue(typeof error === 'string' ? error : error.message || 'Update failed');
        }
    }
);

export const changeUserPassword = createAsyncThunk(
    'auth/changeUserPassword',
    async (data: { email: string; otp: string; oldPassword: string; newPassword: string }, { rejectWithValue }) => {
        try {
            await userService.changePassword(data);
            return true;
        } catch (error: any) {
            return rejectWithValue(typeof error === 'string' ? error : error.message || 'Change password failed');
        }
    }
);

export const changeUserEmail = createAsyncThunk(
    'auth/changeUserEmail',
    async (data: { oldEmail: string; otp: string; newEmail: string }, { rejectWithValue }) => {
        try {
            await userService.changeEmail(data);
            return data.newEmail;
        } catch (error: any) {
            return rejectWithValue(typeof error === 'string' ? error : error.message || 'Change email failed');
        }
    }
);

export const logoutUser = createAsyncThunk(
    'auth/logout',
    async () => {
        await clearAuth();
        return;
    }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isLoggedIn = !!action.payload;
      state.error = null;
    },
    resetAuth: (state) => {
        state.user = null;
        state.isLoggedIn = false;
        state.loading = false;
        state.error = null;
        state.updateStatus = 'idle';
    },
    clearError: (state) => {
        state.error = null;
        state.updateStatus = 'idle';
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isLoggedIn = true;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
          state.user = null;
          state.isLoggedIn = false;
      })
      // Update Info
      .addCase(updateUserInfo.pending, (state) => {
          state.updateStatus = 'loading';
          state.error = null;
      })
      .addCase(updateUserInfo.fulfilled, (state, action) => {
          state.updateStatus = 'succeeded';
          if (state.user) {
              state.user = { ...state.user, ...action.payload };
          }
      })
      .addCase(updateUserInfo.rejected, (state, action) => {
          state.updateStatus = 'failed';
          state.error = action.payload as string;
      })
      // Change Email
      .addCase(changeUserEmail.pending, (state) => {
          state.updateStatus = 'loading';
      })
      .addCase(changeUserEmail.fulfilled, (state, action) => {
          state.updateStatus = 'succeeded';
          if (state.user) {
              state.user.email = action.payload;
          }
      })
      .addCase(changeUserEmail.rejected, (state, action) => {
          state.updateStatus = 'failed';
          state.error = action.payload as string;
      })
      // Change Password (usually doesn't change user state, but updates status)
      .addCase(changeUserPassword.pending, (state) => {
          state.updateStatus = 'loading';
      })
      .addCase(changeUserPassword.fulfilled, (state) => {
          state.updateStatus = 'succeeded';
      })
      .addCase(changeUserPassword.rejected, (state, action) => {
          state.updateStatus = 'failed';
          state.error = action.payload as string;
      });
  },
});

export const { setUser, resetAuth, clearError } = authSlice.actions;
export default authSlice.reducer;
