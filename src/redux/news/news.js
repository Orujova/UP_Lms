import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchNews } from "@/api/news";

export const newsAsync = createAsyncThunk("news/fetchNews", async (params) => {
  const data = await fetchNews(params);
  return data;
});

const initialState = {
  data: null,
  loading: false,
  error: null,
};

export const newsSlice = createSlice({
  name: "news",
  initialState,
  reducers: {
    removeNews: (state, action) => {
      const idToRemove = action.payload;
      if (state.data) {
        state.data = state.data.map((page) => ({
          ...page,
          news: page.news.filter((newsItem) => newsItem.id !== idToRemove),
          totalNewsCount: page.totalNewsCount - 1,
        }));
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(newsAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(newsAsync.fulfilled, (state, action) => {
        state.data = action.payload;
        state.loading = false;
      })
      .addCase(newsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { removeNews } = newsSlice.actions;
export default newsSlice.reducer;
