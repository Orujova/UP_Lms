// redux/certificate/certificateSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  fetchCertificates,
  fetchCertificateById,
  createCertificate,
  updateCertificate,
  deleteCertificate,
  fetchCertificateTypes,
  fetchCertificateTypeById,
  createCertificateType,
  updateCertificateType,
  deleteCertificateType,
  getCertificatesByCertificateTypeId,
  validateCertificateData,
  validateCertificateTypeData,
} from '@/api/certificate';

// Async thunks for certificates
export const fetchCertificatesAsync = createAsyncThunk(
  'certificate/fetchCertificates',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await fetchCertificates(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchCertificateByIdAsync = createAsyncThunk(
  'certificate/fetchCertificateById',
  async (certificateId, { rejectWithValue }) => {
    try {
      const response = await fetchCertificateById(certificateId);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createCertificateAsync = createAsyncThunk(
  'certificate/createCertificate',
  async (certificateData, { rejectWithValue }) => {
    try {
      const errors = validateCertificateData(certificateData);
      if (errors.length > 0) {
        return rejectWithValue(errors.join(', '));
      }
      const response = await createCertificate(certificateData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateCertificateAsync = createAsyncThunk(
  'certificate/updateCertificate',
  async (certificateData, { rejectWithValue }) => {
    try {
      const errors = validateCertificateData(certificateData);
      if (errors.length > 0) {
        return rejectWithValue(errors.join(', '));
      }
      const response = await updateCertificate(certificateData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteCertificateAsync = createAsyncThunk(
  'certificate/deleteCertificate',
  async (certificateId, { rejectWithValue }) => {
    try {
      await deleteCertificate(certificateId);
      return certificateId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunks for certificate types
export const fetchCertificateTypesAsync = createAsyncThunk(
  'certificate/fetchCertificateTypes',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await fetchCertificateTypes(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createCertificateTypeAsync = createAsyncThunk(
  'certificate/createCertificateType',
  async (typeData, { rejectWithValue }) => {
    try {
      const errors = validateCertificateTypeData(typeData);
      if (errors.length > 0) {
        return rejectWithValue(errors.join(', '));
      }
      const response = await createCertificateType(typeData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateCertificateTypeAsync = createAsyncThunk(
  'certificate/updateCertificateType',
  async (typeData, { rejectWithValue }) => {
    try {
      const errors = validateCertificateTypeData(typeData);
      if (errors.length > 0) {
        return rejectWithValue(errors.join(', '));
      }
      const response = await updateCertificateType(typeData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteCertificateTypeAsync = createAsyncThunk(
  'certificate/deleteCertificateType',
  async (typeId, { rejectWithValue }) => {
    try {
      await deleteCertificateType(typeId);
      return typeId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const certificateInitialState = {
  certificates: [],
  currentCertificate: null,
  totalCertificateCount: 0,
  certificateTypes: [],
  currentCertificateType: null,
  totalTypeCount: 0,
  loading: false,
  typeLoading: false,
  error: null,
  typeError: null,
  formData: {
    name: '',
    certificateTypeId: '',
    templateFile: null,
  },
  typeFormData: {
    name: '',
  },
  showCreateModal: false,
  showEditModal: false,
  showDeleteModal: false,
  showTypeModal: false,
  selectedItem: null,
  filters: {
    search: '',
    typeId: '',
    page: 1,
    take: 10,
  },
};

const certificateSlice = createSlice({
  name: 'certificate',
  initialState: certificateInitialState,
  reducers: {
    setFormData: (state, action) => {
      state.formData = { ...state.formData, ...action.payload };
    },
    setTypeFormData: (state, action) => {
      state.typeFormData = { ...state.typeFormData, ...action.payload };
    },
    resetFormData: (state) => {
      state.formData = certificateInitialState.formData;
      state.typeFormData = certificateInitialState.typeFormData;
    },
    setShowCreateModal: (state, action) => {
      state.showCreateModal = action.payload;
    },
    setShowEditModal: (state, action) => {
      state.showEditModal = action.payload;
    },
    setShowDeleteModal: (state, action) => {
      state.showDeleteModal = action.payload;
    },
    setShowTypeModal: (state, action) => {
      state.showTypeModal = action.payload;
    },
    setSelectedItem: (state, action) => {
      state.selectedItem = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
      state.typeError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCertificatesAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCertificatesAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.certificates = action.payload;
        state.totalCertificateCount = action.payload.length;
      })
      .addCase(fetchCertificatesAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createCertificateAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.certificates.unshift(action.payload);
        state.totalCertificateCount += 1;
        state.showCreateModal = false;
        state.formData = certificateInitialState.formData;
      })
      .addCase(deleteCertificateAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.certificates = state.certificates.filter(cert => cert.id !== action.payload);
        state.totalCertificateCount = Math.max(0, state.totalCertificateCount - 1);
        state.showDeleteModal = false;
        state.selectedItem = null;
      });
  },
});

export const certificateActions = certificateSlice.actions;
export default certificateSlice.reducer;
