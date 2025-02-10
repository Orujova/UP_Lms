import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchUserData } from "@/api/notification";

export const fetchUser = createAsyncThunk(
  "user/fetchUser",
  async (userId, thunkAPI) => {
    const response = await fetchUserData(userId);
    return response;
  }
);

export const userSlice = createSlice({
  name: "user",
  initialState: {
    data: null,
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export default userSlice.reducer;
