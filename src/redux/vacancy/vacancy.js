// @/redux/vacancy/vacancySlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { vacancyService } from "@/api/vacancy";

// Async thunks
export const fetchVacanciesAsync = createAsyncThunk(
  "vacancy/fetchVacancies",
  async (filters, { rejectWithValue }) => {
    try {
      return await vacancyService.getAllVacancies(filters);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchVacancyByIdAsync = createAsyncThunk(
  "vacancy/fetchVacancyById",
  async (vacancyId, { rejectWithValue }) => {
    try {
      return await vacancyService.getVacancyById(vacancyId);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createVacancyAsync = createAsyncThunk(
  "vacancy/createVacancy",
  async (vacancyData, { rejectWithValue }) => {
    try {
      return await vacancyService.createVacancy(vacancyData);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateVacancyAsync = createAsyncThunk(
  "vacancy/updateVacancy",
  async (vacancyData, { rejectWithValue }) => {
    try {
      return await vacancyService.updateVacancy(vacancyData);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchDepartmentsAsync = createAsyncThunk(
  "vacancy/fetchDepartments",
  async (_, { rejectWithValue }) => {
    try {
      return await vacancyService.getAllDepartments();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchLineManagersAsync = createAsyncThunk(
  "vacancy/fetchLineManagers",
  async (_, { rejectWithValue }) => {
    try {
      return await vacancyService.getAllLineManagers();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchTargetGroupsAsync = createAsyncThunk(
  "vacancy/fetchTargetGroups",
  async (_, { rejectWithValue }) => {
    try {
      return await vacancyService.getAllTargetGroups();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Initial state
const initialState = {
  vacancies: [],
  totalCount: 0,
  currentVacancy: null,
  departments: [],
  lineManagers: [],
  targetGroups: [],
  loading: false,
  error: null,
  success: false,
};

// Slice
const vacancySlice = createSlice({
  name: "vacancy",
  initialState,
  reducers: {
    resetVacancyState: (state) => {
      state.currentVacancy = null;
      state.error = null;
      state.success = false;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch vacancies
      .addCase(fetchVacanciesAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVacanciesAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.vacancies = action.payload.vacancies;
        state.totalCount = action.payload.totalCount;
      })
      .addCase(fetchVacanciesAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch vacancy by ID
      .addCase(fetchVacancyByIdAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVacancyByIdAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.currentVacancy = action.payload;
      })
      .addCase(fetchVacancyByIdAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create vacancy
      .addCase(createVacancyAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createVacancyAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(createVacancyAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update vacancy
      .addCase(updateVacancyAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateVacancyAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(updateVacancyAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch departments
      .addCase(fetchDepartmentsAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDepartmentsAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.departments = action.payload[0]?.departments || [];
      })
      .addCase(fetchDepartmentsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch line managers
      .addCase(fetchLineManagersAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchLineManagersAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.lineManagers = action.payload[0]?.appUsers || [];
      })
      .addCase(fetchLineManagersAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch target groups
      .addCase(fetchTargetGroupsAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTargetGroupsAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.targetGroups = action.payload[0]?.targetGroups || [];
      })
      .addCase(fetchTargetGroupsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetVacancyState, setLoading, clearError } =
  vacancySlice.actions;
export default vacancySlice.reducer;
