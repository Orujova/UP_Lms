import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchAdminApplicationUser } from "@/api/adminApplicationUser";

export const adminApplicationUserAsync = createAsyncThunk(
  "data/fetchAdminApplicationUser",
  async (page = 1) => {
    const data = await fetchAdminApplicationUser(page);
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
