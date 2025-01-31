import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchNews } from "@/api/news";

// Fetch all news
export const newsAsync = createAsyncThunk("news/fetchNews", async () => {
  const data = await fetchNews();
  return data;
});

const initialState = {
  data: null,
};

export const newsSlice = createSlice({
  name: "news",
  initialState,
  reducers: {
    // Reducer to remove news
    removeNews: (state, action) => {
      const idToRemove = action.payload;
      if (state.data) {
        state.data = state.data.map((page) => ({
          ...page,
          news: page.news.filter((newsItem) => newsItem.id !== idToRemove),
        }));
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(newsAsync.fulfilled, (state, action) => {
      state.data = action.payload;
    });
  },
});

export const { removeNews } = newsSlice.actions;
export default newsSlice.reducer;
