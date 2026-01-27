import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { fetchWithAuth } from '@/services/api';
import { clearAuth } from '@/utils/storage';

interface AuthState {
  user: any | null;
  loading: boolean;
  error: string | null;
  isLoggedIn: boolean;
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
  isLoggedIn: false,
};

export const fetchUserProfile = createAsyncThunk(
  'auth/fetchUserProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchWithAuth('/user/me', {
        method: 'GET',
      });
      const data = await response.json();
      if (response.ok) {
        return data;
      } else {
        return rejectWithValue(data.message || 'Error fetching profile');
      }
    } catch (error) {
        return rejectWithValue('Network Error');
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
    setUser: (state, action: PayloadAction<any>) => {
      state.user = action.payload;
      state.isLoggedIn = !!action.payload;
    },
    resetAuth: (state) => {
        state.user = null;
        state.isLoggedIn = false;
        state.loading = false;
        state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
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
      .addCase(logoutUser.fulfilled, (state) => {
          state.user = null;
          state.isLoggedIn = false;
      })
  },
});

export const { setUser, resetAuth } = authSlice.actions;
export default authSlice.reducer;
