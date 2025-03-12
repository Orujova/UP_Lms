// src/redux/news/news.js - Enhanced with additional thunks and reducers

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchNews,
  addNews,
  getNewsById,
  updateNews,
  deleteNews as apiDeleteNews,
  exportNews,
  fetchNewsCategories,
} from "@/api/news";

// Existing thunk
export const newsAsync = createAsyncThunk("news/fetchNews", async (params) => {
  const data = await fetchNews(params);
  return data;
});

// New thunks for additional API operations
export const addNewsAsync = createAsyncThunk(
  "news/addNews",
  async (newsData, { rejectWithValue }) => {
    try {
      const data = await addNews(newsData);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getNewsByIdAsync = createAsyncThunk(
  "news/getNewsById",
  async (id, { rejectWithValue }) => {
    try {
      const data = await getNewsById(id);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateNewsAsync = createAsyncThunk(
  "news/updateNews",
  async (newsData, { rejectWithValue }) => {
    try {
      const data = await updateNews(newsData);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteNewsAsync = createAsyncThunk(
  "news/deleteNews",
  async (id, { rejectWithValue }) => {
    try {
      await apiDeleteNews(id);
      return id; // Return the ID for the reducer
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const exportNewsAsync = createAsyncThunk(
  "news/exportNews",
  async (params, { rejectWithValue }) => {
    try {
      const blob = await exportNews(params);
      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);

      // Create a temporary anchor element and trigger download
      const a = document.createElement("a");
      a.href = url;
      a.download = `news_export_${new Date().toISOString().split("T")[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();

      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      return true;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchNewsCategoriesAsync = createAsyncThunk(
  "news/fetchCategories",
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchNewsCategories();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  data: null,
  categories: [],
  currentNews: null,
  loading: false,
  error: null,
  addSuccess: false,
  updateSuccess: false,
  deleteSuccess: false,
  exportSuccess: false,
};

export const newsSlice = createSlice({
  name: "news",
  initialState,
  reducers: {
    // Existing reducer
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
    // Additional reset status reducers
    resetAddStatus: (state) => {
      state.addSuccess = false;
    },
    resetUpdateStatus: (state) => {
      state.updateSuccess = false;
    },
    resetDeleteStatus: (state) => {
      state.deleteSuccess = false;
    },
    clearCurrentNews: (state) => {
      state.currentNews = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Existing cases for newsAsync
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
      })

      // Add news
      .addCase(addNewsAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.addSuccess = false;
      })
      .addCase(addNewsAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.addSuccess = true;
        // Optionally update the state with the new item if needed
        if (state.data && state.data.length > 0) {
          state.data[0].news = [action.payload, ...state.data[0].news];
          state.data[0].totalNewsCount += 1;
        }
      })
      .addCase(addNewsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.addSuccess = false;
      })

      // Get news by ID
      .addCase(getNewsByIdAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getNewsByIdAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.currentNews = action.payload;
      })
      .addCase(getNewsByIdAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update news
      .addCase(updateNewsAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.updateSuccess = false;
      })
      .addCase(updateNewsAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.updateSuccess = true;
        // Update the item in the data array if it exists
        if (state.data) {
          state.data = state.data.map((page) => ({
            ...page,
            news: page.news.map((newsItem) =>
              newsItem.id === action.payload.id ? action.payload : newsItem
            ),
          }));
        }
        // Update current news if it's the same item
        if (state.currentNews && state.currentNews.id === action.payload.id) {
          state.currentNews = action.payload;
        }
      })
      .addCase(updateNewsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.updateSuccess = false;
      })

      // Delete news
      .addCase(deleteNewsAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.deleteSuccess = false;
      })
      .addCase(deleteNewsAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.deleteSuccess = true;
        // Remove the item from the state
        if (state.data) {
          state.data = state.data.map((page) => ({
            ...page,
            news: page.news.filter(
              (newsItem) => newsItem.id !== action.payload
            ),
            totalNewsCount: page.totalNewsCount - 1,
          }));
        }
      })
      .addCase(deleteNewsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.deleteSuccess = false;
      })

      // Export news
      .addCase(exportNewsAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.exportSuccess = false;
      })
      .addCase(exportNewsAsync.fulfilled, (state) => {
        state.loading = false;
        state.exportSuccess = true;
      })
      .addCase(exportNewsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.exportSuccess = false;
      })

      // Fetch categories
      .addCase(fetchNewsCategoriesAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNewsCategoriesAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchNewsCategoriesAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  removeNews,
  resetAddStatus,
  resetUpdateStatus,
  resetDeleteStatus,
  clearCurrentNews,
} = newsSlice.actions;

export default newsSlice.reducer;
