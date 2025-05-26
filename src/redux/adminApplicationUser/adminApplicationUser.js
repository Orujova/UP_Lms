import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchAdminApplicationUser } from "@/api/adminApplicationUser";

export const adminApplicationUserAsync = createAsyncThunk(
  "data/fetchAdminApplicationUser",
  async (params = {}) => {
    // If params is just a number, treat it as page
    if (typeof params === "number") {
      const data = await fetchAdminApplicationUser(params);
      return data;
    }

    // Otherwise, treat it as an object with page and filter params
    const data = await fetchAdminApplicationUser(params);
    return data;
  }
);

const initialState = {
  data: null,
};

export const adminApplicationUserSlice = createSlice({
  name: "adminApplicationUser",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(adminApplicationUserAsync.fulfilled, (state, action) => {
      return { ...state, data: action.payload };
    });
  },
});

export default adminApplicationUserSlice.reducer;
