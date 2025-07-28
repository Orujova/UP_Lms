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
  formatCertificateForDisplay,
  getCertificateTypeStats,
} from '@/api/certifcate';

// ======================== CERTIFICATE ASYNC THUNKS ========================

export const fetchCertificatesAsync = createAsyncThunk(
  'certificate/fetchCertificates',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await fetchCertificates(params);
      return response.map(cert => formatCertificateForDisplay(cert));
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
      return formatCertificateForDisplay(response);
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
      return formatCertificateForDisplay(response);
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
      return formatCertificateForDisplay(response);
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

// ======================== CERTIFICATE TYPE ASYNC THUNKS ========================

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

export const fetchCertificateTypeByIdAsync = createAsyncThunk(
  'certificate/fetchCertificateTypeById',
  async (typeId, { rejectWithValue }) => {
    try {
      const response = await fetchCertificateTypeById(typeId);
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

export const getCertificatesByTypeAsync = createAsyncThunk(
  'certificate/getCertificatesByType',
  async (typeId, { rejectWithValue }) => {
    try {
      const response = await getCertificatesByCertificateTypeId(typeId);
      return { typeId, certificates: response };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getCertificateTypeStatsAsync = createAsyncThunk(
  'certificate/getCertificateTypeStats',
  async (typeId, { rejectWithValue }) => {
    try {
      const stats = await getCertificateTypeStats(typeId);
      return { typeId, stats };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ======================== INITIAL STATE ========================

const certificateInitialState = {
  // Certificate data
  certificates: [],
  currentCertificate: null,
  totalCertificateCount: 0,
  
  // Certificate type data
  certificateTypes: [],
  currentCertificateType: null,
  totalTypeCount: 0,
  typeStats: {},
  
  // Loading states
  loading: false,
  typeLoading: false,
  certificateLoading: false,
  
  // Error states
  error: null,
  typeError: null,
  certificateError: null,
  
  // Form data
  formData: {
    name: '',
    certificateTypeId: '',
    templateFile: null,
  },
  
  typeFormData: {
    name: '',
  },
  
  // UI state
  showCreateModal: false,
  showEditModal: false,
  showDeleteModal: false,
  showTypeModal: false,
  showTypeCreateModal: false,
  showTypeEditModal: false,
  showTypeDeleteModal: false,
  selectedItem: null,
  selectedType: null,
  
  // Filters and search
  filters: {
    search: '',
    typeId: '',
    status: '', // 'active', 'draft'
    page: 1,
    take: 10,
  },
  
  typeFilters: {
    search: '',
    page: 1,
    take: 10,
  },
  
  // Statistics
  statistics: {
    totalCertificates: 0,
    activeCertificates: 0,
    draftCertificates: 0,
    totalTypes: 0,
    averageCertificatesPerType: 0,
  },
};

// ======================== SLICE ========================

const certificateSlice = createSlice({
  name: 'certificate',
  initialState: certificateInitialState,
  reducers: {
    // Form data management
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
    
    // Modal management
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
    
    setShowTypeCreateModal: (state, action) => {
      state.showTypeCreateModal = action.payload;
    },
    
    setShowTypeEditModal: (state, action) => {
      state.showTypeEditModal = action.payload;
    },
    
    setShowTypeDeleteModal: (state, action) => {
      state.showTypeDeleteModal = action.payload;
    },
    
    // Selection management
    setSelectedItem: (state, action) => {
      state.selectedItem = action.payload;
      if (action.payload) {
        state.formData = {
          name: action.payload.name || '',
          certificateTypeId: action.payload.certificateTypeId || '',
          templateFile: null,
        };
      }
    },
    
    setSelectedType: (state, action) => {
      state.selectedType = action.payload;
      if (action.payload) {
        state.typeFormData = {
          name: action.payload.name || '',
        };
      }
    },
    
    // Filter management
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    setTypeFilters: (state, action) => {
      state.typeFilters = { ...state.typeFilters, ...action.payload };
    },
    
    resetFilters: (state) => {
      state.filters = certificateInitialState.filters;
      state.typeFilters = certificateInitialState.typeFilters;
    },
    
    // Error management
    clearError: (state) => {
      state.error = null;
      state.typeError = null;
      state.certificateError = null;
    },
    
    // Statistics update
    updateStatistics: (state) => {
      const certificates = state.certificates;
      const types = state.certificateTypes;
      
      state.statistics = {
        totalCertificates: certificates.length,
        activeCertificates: certificates.filter(cert => cert.status === 'active').length,
        draftCertificates: certificates.filter(cert => cert.status === 'draft').length,
        totalTypes: types.length,
        averageCertificatesPerType: types.length > 0 ? 
          Math.round(certificates.length / types.length * 10) / 10 : 0,
      };
    },
    
    // Bulk operations
    selectAllCertificates: (state) => {
      state.selectedItems = state.certificates.map(cert => cert.id);
    },
    
    deselectAllCertificates: (state) => {
      state.selectedItems = [];
    },
    
    toggleCertificateSelection: (state, action) => {
      const certId = action.payload;
      if (!state.selectedItems) {
        state.selectedItems = [];
      }
      
      const index = state.selectedItems.indexOf(certId);
      if (index > -1) {
        state.selectedItems.splice(index, 1);
      } else {
        state.selectedItems.push(certId);
      }
    },
  },
  
  extraReducers: (builder) => {
    builder
      // Fetch certificates
      .addCase(fetchCertificatesAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCertificatesAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.certificates = action.payload;
        state.totalCertificateCount = action.payload.length;
        certificateSlice.caseReducers.updateStatistics(state);
      })
      .addCase(fetchCertificatesAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch single certificate
      .addCase(fetchCertificateByIdAsync.pending, (state) => {
        state.certificateLoading = true;
        state.certificateError = null;
      })
      .addCase(fetchCertificateByIdAsync.fulfilled, (state, action) => {
        state.certificateLoading = false;
        state.currentCertificate = action.payload;
      })
      .addCase(fetchCertificateByIdAsync.rejected, (state, action) => {
        state.certificateLoading = false;
        state.certificateError = action.payload;
      })
      
      // Create certificate
      .addCase(createCertificateAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCertificateAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.certificates.unshift(action.payload);
        state.totalCertificateCount += 1;
        state.showCreateModal = false;
        state.formData = certificateInitialState.formData;
        certificateSlice.caseReducers.updateStatistics(state);
      })
      .addCase(createCertificateAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update certificate
      .addCase(updateCertificateAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCertificateAsync.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.certificates.findIndex(cert => cert.id === action.payload.id);
        if (index !== -1) {
          state.certificates[index] = action.payload;
        }
        if (state.currentCertificate?.id === action.payload.id) {
          state.currentCertificate = action.payload;
        }
        state.showEditModal = false;
        state.formData = certificateInitialState.formData;
        certificateSlice.caseReducers.updateStatistics(state);
      })
      .addCase(updateCertificateAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete certificate
      .addCase(deleteCertificateAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCertificateAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.certificates = state.certificates.filter(cert => cert.id !== action.payload);
        state.totalCertificateCount = Math.max(0, state.totalCertificateCount - 1);
        state.showDeleteModal = false;
        state.selectedItem = null;
        if (state.currentCertificate?.id === action.payload) {
          state.currentCertificate = null;
        }
        certificateSlice.caseReducers.updateStatistics(state);
      })
      .addCase(deleteCertificateAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch certificate types
      .addCase(fetchCertificateTypesAsync.pending, (state) => {
        state.typeLoading = true;
        state.typeError = null;
      })
      .addCase(fetchCertificateTypesAsync.fulfilled, (state, action) => {
        state.typeLoading = false;
        state.certificateTypes = action.payload;
        state.totalTypeCount = action.payload.length;
        certificateSlice.caseReducers.updateStatistics(state);
      })
      .addCase(fetchCertificateTypesAsync.rejected, (state, action) => {
        state.typeLoading = false;
        state.typeError = action.payload;
      })
      
      // Create certificate type
      .addCase(createCertificateTypeAsync.fulfilled, (state, action) => {
        state.certificateTypes.unshift(action.payload);
        state.totalTypeCount += 1;
        state.showTypeCreateModal = false;
        state.typeFormData = certificateInitialState.typeFormData;
        certificateSlice.caseReducers.updateStatistics(state);
      })
      
      // Update certificate type
      .addCase(updateCertificateTypeAsync.fulfilled, (state, action) => {
        const index = state.certificateTypes.findIndex(type => type.id === action.payload.id);
        if (index !== -1) {
          state.certificateTypes[index] = action.payload;
        }
        state.showTypeEditModal = false;
        state.typeFormData = certificateInitialState.typeFormData;
      })
      
      // Delete certificate type
      .addCase(deleteCertificateTypeAsync.fulfilled, (state, action) => {
        state.certificateTypes = state.certificateTypes.filter(type => type.id !== action.payload);
        state.totalTypeCount = Math.max(0, state.totalTypeCount - 1);
        state.showTypeDeleteModal = false;
        state.selectedType = null;
        certificateSlice.caseReducers.updateStatistics(state);
      })
      
      // Get certificates by type
      .addCase(getCertificatesByTypeAsync.fulfilled, (state, action) => {
        const { typeId, certificates } = action.payload;
        // You might want to store this in a separate field or update existing certificates
        // For now, we'll update the type stats
        if (!state.typeStats) {
          state.typeStats = {};
        }
        state.typeStats[typeId] = {
          certificateCount: certificates.length,
          certificates: certificates,
        };
      })
      
      // Get certificate type stats
      .addCase(getCertificateTypeStatsAsync.fulfilled, (state, action) => {
        const { typeId, stats } = action.payload;
        if (!state.typeStats) {
          state.typeStats = {};
        }
        state.typeStats[typeId] = { ...state.typeStats[typeId], ...stats };
      });
  },
});

// ======================== ACTIONS EXPORT ========================

export const certificateActions = certificateSlice.actions;

export const {
  setFormData,
  setTypeFormData,
  resetFormData,
  setShowCreateModal,
  setShowEditModal,
  setShowDeleteModal,
  setShowTypeModal,
  setShowTypeCreateModal,
  setShowTypeEditModal,
  setShowTypeDeleteModal,
  setSelectedItem,
  setSelectedType,
  setFilters,
  setTypeFilters,
  resetFilters,
  clearError,
  updateStatistics,
  selectAllCertificates,
  deselectAllCertificates,
  toggleCertificateSelection,
} = certificateSlice.actions;

// ======================== SELECTORS ========================

// Certificate selectors
export const selectCertificates = (state) => state.certificate.certificates;
export const selectCurrentCertificate = (state) => state.certificate.currentCertificate;
export const selectCertificateLoading = (state) => state.certificate.loading;
export const selectCertificateError = (state) => state.certificate.error;

// Certificate type selectors
export const selectCertificateTypes = (state) => state.certificate.certificateTypes;
export const selectCurrentCertificateType = (state) => state.certificate.currentCertificateType;
export const selectTypeLoading = (state) => state.certificate.typeLoading;
export const selectTypeError = (state) => state.certificate.typeError;

// UI selectors
export const selectFormData = (state) => state.certificate.formData;
export const selectTypeFormData = (state) => state.certificate.typeFormData;
export const selectSelectedItem = (state) => state.certificate.selectedItem;
export const selectSelectedType = (state) => state.certificate.selectedType;

// Filter selectors
export const selectFilters = (state) => state.certificate.filters;
export const selectTypeFilters = (state) => state.certificate.typeFilters;

// Statistics selectors
export const selectStatistics = (state) => state.certificate.statistics;
export const selectTypeStats = (state) => state.certificate.typeStats;

// Filtered data selectors
export const selectFilteredCertificates = (state) => {
  const certificates = state.certificate.certificates;
  const filters = state.certificate.filters;
  
  return certificates.filter(cert => {
    // Search filter
    if (filters.search && !cert.name.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    
    // Type filter
    if (filters.typeId && cert.certificateTypeId !== parseInt(filters.typeId)) {
      return false;
    }
    
    // Status filter
    if (filters.status && cert.status !== filters.status) {
      return false;
    }
    
    return true;
  });
};

export const selectFilteredCertificateTypes = (state) => {
  const types = state.certificate.certificateTypes;
  const filters = state.certificate.typeFilters;
  
  return types.filter(type => {
    // Search filter
    if (filters.search && !type.name.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    
    return true;
  });
};

export default certificateSlice.reducer;