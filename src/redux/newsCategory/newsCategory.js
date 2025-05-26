// redux/slices/newsCategorySlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchNewsCategory } from "@/api/newsCategory";
import axios from "axios";
import { getToken } from "@/authtoken/auth.js";

const API_URL = "https://bravoadmin.uplms.org/api/";

// Existing thunk
export const newsCategoryAsync = createAsyncThunk(
  "data/fetchNewsCategory",
  async () => {
    const data = await fetchNewsCategory();
    return data;
  }
);

// Additional thunks that work with your structure
export const addNewsCategoryAsync = createAsyncThunk(
  "data/addNewsCategory",
  async (categoryName, { dispatch }) => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error("Token bulunamadı. Lütfen giriş yapınız.");
      }

      await axios.post(
        `${API_URL}NewsCategory`,
        { categoryName },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            accept: "application/json",
          },
        }
      );

      // Refresh the categories list after adding
      await dispatch(newsCategoryAsync());
      return true;
    } catch (error) {
      console.error("Error adding news category:", error);
      throw error;
    }
  }
);

export const updateNewsCategoryAsync = createAsyncThunk(
  "data/updateNewsCategory",
  async ({ id, categoryName }, { dispatch }) => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error("Token bulunamadı. Lütfen giriş yapınız.");
      }

      await axios.put(
        `${API_URL}NewsCategory`,
        { id, categoryName },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            accept: "application/json",
          },
        }
      );

      // Refresh the categories list after updating
      await dispatch(newsCategoryAsync());
      return true;
    } catch (error) {
      console.error("Error updating news category:", error);
      throw error;
    }
  }
);

export const deleteNewsCategoryAsync = createAsyncThunk(
  "data/deleteNewsCategory",
  async (id, { dispatch }) => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error("Token bulunamadı. Lütfen giriş yapınız.");
      }

      await axios.delete(`${API_URL}NewsCategory`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          accept: "application/json",
        },
        data: { id },
      });

      // Refresh the categories list after deleting
      await dispatch(newsCategoryAsync());
      return true;
    } catch (error) {
      console.error("Error deleting news category:", error);
      throw error;
    }
  }
);

const initialState = {
  data: null,
  loading: false,
  error: null,
};

export const newsCategorySlice = createSlice({
  name: "newsCategory",
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(newsCategoryAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(newsCategoryAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(newsCategoryAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { setLoading, setError, clearError } = newsCategorySlice.actions;

export default newsCategorySlice.reducer;
