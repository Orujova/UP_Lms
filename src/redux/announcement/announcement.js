// src/redux/announcement/announcement.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  createAnnouncement,
  fetchAnnouncements,
  getAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement as apiDeleteAnnouncement,
} from "@/api/announcement";

// Create announcement thunk
export const createAnnouncementAsync = createAsyncThunk(
  "announcement/createAnnouncement",
  async (announcementData, { rejectWithValue }) => {
    try {
      const data = await createAnnouncement(announcementData);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch announcements thunk
export const fetchAnnouncementsAsync = createAsyncThunk(
  "announcement/fetchAnnouncements",
  async (params, { rejectWithValue }) => {
    try {
      const data = await fetchAnnouncements(params);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Get announcement by ID thunk
export const getAnnouncementByIdAsync = createAsyncThunk(
  "announcement/getAnnouncementById",
  async (id, { rejectWithValue }) => {
    try {
      const data = await getAnnouncementById(id);
      return data;
    } catch (error) {
      console.error("Error in getAnnouncementByIdAsync:", error);
      return rejectWithValue(error.message);
    }
  }
);

// Update announcement thunk
export const updateAnnouncementAsync = createAsyncThunk(
  "announcement/updateAnnouncement",
  async (announcementData, { rejectWithValue }) => {
    try {
      const data = await updateAnnouncement(announcementData);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Delete announcement thunk
export const deleteAnnouncementAsync = createAsyncThunk(
  "announcement/deleteAnnouncement",
  async (id, { rejectWithValue }) => {
    try {
      await apiDeleteAnnouncement(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  announcements: null,
  currentAnnouncement: null,
  loading: false,
  error: null,
  createSuccess: false,
  updateSuccess: false,
  deleteSuccess: false,
};

export const announcementSlice = createSlice({
  name: "announcement",
  initialState,
  reducers: {
    // Remove an announcement
    removeAnnouncement: (state, action) => {
      const idToRemove = action.payload;
      if (state.announcements) {
        state.announcements = state.announcements.map((page) => ({
          ...page,
          announcements: page.announcements.filter(
            (item) => item.id !== idToRemove
          ),
          totalAnnouncementCount: page.totalAnnouncementCount - 1,
        }));
      }
    },
    // Reset status flags
    resetCreateStatus: (state) => {
      state.createSuccess = false;
    },
    resetUpdateStatus: (state) => {
      state.updateSuccess = false;
    },
    resetDeleteStatus: (state) => {
      state.deleteSuccess = false;
    },
    clearCurrentAnnouncement: (state) => {
      state.currentAnnouncement = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create announcement
      .addCase(createAnnouncementAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.createSuccess = false;
      })
      .addCase(createAnnouncementAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.createSuccess = true;
        if (state.announcements && state.announcements.length > 0) {
          state.announcements[0].announcements = [
            action.payload,
            ...state.announcements[0].announcements,
          ];
          state.announcements[0].totalAnnouncementCount += 1;
        }
      })
      .addCase(createAnnouncementAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.createSuccess = false;
      })

      // Fetch announcements
      .addCase(fetchAnnouncementsAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAnnouncementsAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.announcements = action.payload;
      })
      .addCase(fetchAnnouncementsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get announcement by ID
      .addCase(getAnnouncementByIdAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.currentAnnouncement = null; // Clear previous data while loading
      })
      .addCase(getAnnouncementByIdAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.currentAnnouncement = action.payload;
      })
      .addCase(getAnnouncementByIdAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update announcement
      .addCase(updateAnnouncementAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.updateSuccess = false;
      })
      .addCase(updateAnnouncementAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.updateSuccess = true;
        if (state.announcements) {
          state.announcements = state.announcements.map((page) => ({
            ...page,
            announcements: page.announcements.map((item) =>
              item.id === action.payload.id ? action.payload : item
            ),
          }));
        }
        if (
          state.currentAnnouncement &&
          state.currentAnnouncement.id === action.payload.id
        ) {
          state.currentAnnouncement = action.payload;
        }
      })
      .addCase(updateAnnouncementAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.updateSuccess = false;
      })

      // Delete announcement
      .addCase(deleteAnnouncementAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.deleteSuccess = false;
      })
      .addCase(deleteAnnouncementAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.deleteSuccess = true;
        if (state.announcements) {
          state.announcements = state.announcements.map((page) => ({
            ...page,
            announcements: page.announcements.filter(
              (item) => item.id !== action.payload
            ),
            totalAnnouncementCount: page.totalAnnouncementCount - 1,
          }));
        }
      })
      .addCase(deleteAnnouncementAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.deleteSuccess = false;
      });
  },
});

export const {
  removeAnnouncement,
  resetCreateStatus,
  resetUpdateStatus,
  resetDeleteStatus,
  clearCurrentAnnouncement,
} = announcementSlice.actions;

export default announcementSlice.reducer;
