import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { eventApi } from "@/api/event";

// Fetch target groups
export const fetchTargetGroups = createAsyncThunk(
  "event/fetchTargetGroups",
  async (_, { rejectWithValue }) => {
    try {
      const response = await eventApi.getTargetGroups();
      return response || [];
    } catch (error) {
      console.error("Error in fetchTargetGroups thunk:", error);
      return rejectWithValue(error.message);
    }
  }
);

// Fetch poll units
export const fetchPollUnits = createAsyncThunk(
  "event/fetchPollUnits",
  async (_, { dispatch }) => {
    try {
      dispatch(setPollUnitsLoading(true));
      const response = await eventApi.getPollUnits();
      return response || [];
    } catch (error) {
      console.error("Error in fetchPollUnits thunk:", error);
      return [];
    } finally {
      dispatch(setPollUnitsLoading(false));
    }
  }
);

// Create event
export const createEvent = createAsyncThunk(
  "event/createEvent",
  async (eventData, { rejectWithValue }) => {
    try {
      const response = await eventApi.createEvent(eventData);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

// Update event
export const updateEvent = createAsyncThunk(
  "event/updateEvent",
  async (eventData, { rejectWithValue }) => {
    try {
      const response = await eventApi.updateEvent(eventData);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

// Delete event
export const deleteEvent = createAsyncThunk(
  "event/deleteEvent",
  async (eventId, { rejectWithValue }) => {
    try {
      await eventApi.deleteEvent(eventId);
      return eventId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

// Get specific event
export const getEvent = createAsyncThunk(
  "event/getEvent",
  async (eventId, { rejectWithValue }) => {
    try {
      const response = await eventApi.getEvent(eventId);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message }
      );
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
  currentEvent: null,
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
    resetAllEventState: () => initialState,
    setPollUnitsLoading: (state, action) => {
      state.pollUnitsLoading = action.payload;
    },
    clearCurrentEvent: (state) => {
      state.currentEvent = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Target Groups
      .addCase(fetchTargetGroups.pending, (state) => {
        state.targetGroupsLoading = true;
        state.error = null;
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
        state.error = null;
      })
      .addCase(fetchPollUnits.fulfilled, (state, action) => {
        state.pollUnitsLoading = false;
        state.pollUnits = action.payload;
      })
      .addCase(fetchPollUnits.rejected, (state, action) => {
        state.pollUnitsLoading = false;
        state.pollUnits = []; // Ensure we have an empty array on error
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
        state.error = action.payload || { message: "An error occurred" };
        state.success = false;
      })

      // Update Event
      .addCase(updateEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateEvent.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(updateEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || { message: "An error occurred" };
        state.success = false;
      })

      // Delete Event
      .addCase(deleteEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteEvent.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(deleteEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || { message: "An error occurred" };
      })

      // Get Event
      .addCase(getEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getEvent.fulfilled, (state, action) => {
        state.loading = false;
        state.currentEvent = action.payload;
      })
      .addCase(getEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || { message: "An error occurred" };
      });
  },
});

export const {
  resetEventState,
  resetAllEventState,
  setPollUnitsLoading,
  clearCurrentEvent,
} = eventSlice.actions;

export default eventSlice.reducer;
