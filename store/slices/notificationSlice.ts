import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { notificationService, NotificationItem } from '@/services/notificationService';

interface NotificationState {
  items: NotificationItem[];
  unreadCount: number;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

const initialState: NotificationState = {
  items: [],
  unreadCount: 0,
  loading: false,
  refreshing: false,
  error: null,
  page: 1,
  limit: 10,
  totalPages: 0,
  hasMore: true,
};

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async ({ page = 1, limit = 10 }: { page?: number; limit?: number } = {}, { rejectWithValue }) => {
    try {
      const response = await notificationService.getNotifications({ page, limit });
      return {
        items: response.data || [],
        meta: response.meta,
        page,
        limit,
      };
    } catch (error: any) {
      return rejectWithValue(typeof error === 'string' ? error : error?.message || 'Fetch notifications failed');
    }
  }
);

export const fetchUnreadCount = createAsyncThunk(
  'notifications/fetchUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await notificationService.getUnreadCount();
      return response.data || 0;
    } catch (error: any) {
      return rejectWithValue(typeof error === 'string' ? error : error?.message || 'Fetch unread count failed');
    }
  }
);

export const toggleNotificationRead = createAsyncThunk(
  'notifications/toggleRead',
  async (notificationId: string, { rejectWithValue }) => {
    try {
      await notificationService.toggleRead(notificationId);
      return notificationId;
    } catch (error: any) {
      return rejectWithValue(typeof error === 'string' ? error : error?.message || 'Toggle read failed');
    }
  }
);

export const removeNotification = createAsyncThunk(
  'notifications/removeNotification',
  async (notificationId: string, { rejectWithValue }) => {
    try {
      await notificationService.deleteNotification(notificationId);
      return notificationId;
    } catch (error: any) {
      return rejectWithValue(typeof error === 'string' ? error : error?.message || 'Delete notification failed');
    }
  }
);

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    resetNotifications: () => initialState,
    notificationReceived: (state, action: PayloadAction<NotificationItem>) => {
      const incoming = action.payload;
      const index = state.items.findIndex((item) => item.id === incoming.id);

      if (index >= 0) {
        const previous = state.items[index];
        state.items[index] = incoming;
        if (previous.isRead && !incoming.isRead) {
          state.unreadCount += 1;
        } else if (!previous.isRead && incoming.isRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        return;
      }

      state.items.unshift(incoming);
      if (!incoming.isRead) {
        state.unreadCount += 1;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state, action) => {
        state.error = null;
        const page = action.meta.arg?.page ?? 1;
        if (page === 1) {
          state.loading = true;
          state.refreshing = true;
        }
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        const { items, meta, page, limit } = action.payload;
        state.loading = false;
        state.refreshing = false;
        state.error = null;
        state.page = page;
        state.limit = limit;

        if (page === 1) {
          state.items = items;
        } else {
          const existingIds = new Set(state.items.map((item) => item.id));
          const merged = items.filter((item) => !existingIds.has(item.id));
          state.items = [...state.items, ...merged];
        }

        if (meta) {
          state.totalPages = meta.totalPages;
          state.hasMore = page < meta.totalPages;
        } else {
          state.hasMore = items.length >= limit;
        }
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.refreshing = false;
        state.error = action.payload as string;
      })
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      })
      .addCase(toggleNotificationRead.fulfilled, (state, action) => {
        const notificationId = action.payload;
        const item = state.items.find((notification) => notification.id === notificationId);
        if (!item) return;

        item.isRead = !item.isRead;
        if (item.isRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        } else {
          state.unreadCount += 1;
        }
      })
      .addCase(removeNotification.fulfilled, (state, action) => {
        const notificationId = action.payload;
        const deleted = state.items.find((item) => item.id === notificationId);

        state.items = state.items.filter((item) => item.id !== notificationId);
        if (deleted && !deleted.isRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      });
  },
});

export const { notificationReceived, resetNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;
