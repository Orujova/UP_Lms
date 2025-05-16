// File: /redux/eventSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { eventApi } from "@/api/event";

export const fetchTargetGroups = createAsyncThunk(
  "event/fetchTargetGroups",
  async (_, { rejectWithValue }) => {
    try {
      const response = await eventApi.getTargetGroups();
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchPollUnits = createAsyncThunk(
  "event/fetchPollUnits",
  async (_, { rejectWithValue }) => {
    try {
      const response = await eventApi.getPollUnits();
      return response;
    } catch (error) {
      console.error("Error in fetchPollUnits thunk:", error);
      // Return empty array instead of rejecting to prevent UI breakage
      return [];
    }
  }
);

export const createEvent = createAsyncThunk(
  "event/createEvent",
  async (eventData, { rejectWithValue }) => {
    try {
      const response = await eventApi.createEvent(eventData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  targetGroups: [],
  pollUnits: [],
  loading: false,
  targetGroupsLoading: false,
  pollUnitsLoading: false,
  error: null,
  success: false,
};

const eventSlice = createSlice({
  name: "event",
  initialState,
  reducers: {
    resetEventState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Target Groups
      .addCase(fetchTargetGroups.pending, (state) => {
        state.targetGroupsLoading = true;
      })
      .addCase(fetchTargetGroups.fulfilled, (state, action) => {
        state.targetGroupsLoading = false;
        state.targetGroups = action.payload;
      })
      .addCase(fetchTargetGroups.rejected, (state, action) => {
        state.targetGroupsLoading = false;
        state.error = action.payload;
      })
      // Poll Units
      .addCase(fetchPollUnits.pending, (state) => {
        state.pollUnitsLoading = true;
      })
      .addCase(fetchPollUnits.fulfilled, (state, action) => {
        state.pollUnitsLoading = false;
        state.pollUnits = action.payload;
      })
      .addCase(fetchPollUnits.rejected, (state, action) => {
        state.pollUnitsLoading = false;
        state.error = action.payload;
      })
      // Create Event
      .addCase(createEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createEvent.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(createEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });
  },
});

export const { resetEventState } = eventSlice.actions;
export default eventSlice.reducer;
