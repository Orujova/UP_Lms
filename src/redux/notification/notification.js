import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchNotifications,
  updateNotificationReadStatus,
} from "@/api/notification";

export const fetchNotificationsData = createAsyncThunk(
  "notification/fetchNotifications",
  async (userId, thunkAPI) => {
    const response = await fetchNotifications(userId);
    return response;
  }
);

export const markNotificationAsRead = createAsyncThunk(
  "notification/markAsRead",
  async ({ notificationId, isRead }, thunkAPI) => {
    await updateNotificationReadStatus(notificationId, isRead);
    return { notificationId, isRead };
  }
);

export const notificationSlice = createSlice({
  name: "notification",
  initialState: {
    data: [],
    unreadCount: 0,
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotificationsData.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchNotificationsData.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload[0].userNotifications || [];
        state.unreadCount = action.payload[0].unreadNotificationCount || 0;
      })
      .addCase(fetchNotificationsData.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const { notificationId, isRead } = action.payload;
        state.data = state.data.map((notif) =>
          notif.id === notificationId ? { ...notif, isRead } : notif
        );
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      });
  },
});

export default notificationSlice.reducer;
