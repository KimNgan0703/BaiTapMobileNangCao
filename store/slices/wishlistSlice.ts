import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { wishlistService, WishlistItem } from '@/services/wishlistService';

interface WishlistState {
  items: WishlistItem[];
  courseIds: string[];
  loading: boolean;
}

const initialState: WishlistState = {
  items: [],
  courseIds: [],
  loading: false,
};

export const fetchWishlist = createAsyncThunk('wishlist/fetch', async () => {
  const res = await wishlistService.getWishlist();
  return res.data || [];
});

export const addToWishlist = createAsyncThunk('wishlist/add', async (courseId: string) => {
  await wishlistService.addToWishlist(courseId);
  return courseId;
});

export const removeFromWishlist = createAsyncThunk('wishlist/remove', async (courseId: string) => {
  await wishlistService.removeFromWishlist(courseId);
  return courseId;
});

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.pending, (state) => { state.loading = true; })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.courseIds = action.payload.map(item => item.courseId);
      })
      .addCase(fetchWishlist.rejected, (state) => { state.loading = false; })
      .addCase(addToWishlist.fulfilled, (state, action) => {
        if (!state.courseIds.includes(action.payload)) {
          state.courseIds.push(action.payload);
        }
      })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.courseIds = state.courseIds.filter(id => id !== action.payload);
        state.items = state.items.filter(item => item.courseId !== action.payload);
      });
  },
});

export default wishlistSlice.reducer;
