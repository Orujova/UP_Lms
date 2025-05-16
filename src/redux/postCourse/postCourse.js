import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  name: '',
  description: '',
  duration: 0,
  verifiedCertificate: false,
  imageFile: null,
  userId: null,
  targetGroupId: null,
  categoryId: null,
  tagIds: [],
  sections: [],
  successionRates: [],
};

const postCourseSlice = createSlice({
  name: 'postCourse',
  initialState,
  reducers: {
    setName: (state, action) => {
      state.name = action.payload;
    },
    setDescription: (state, action) => {
      state.description = action.payload;
    },
    setDuration: (state, action) => {
      state.duration = action.payload;
    },
    setVerifiedCertificate: (state, action) => {
      state.verifiedCertificate = action.payload;
    },
    setImageFile: (state, action) => {
      state.imageFile = action.payload;
    },
    setUserId: (state, action) => {
      state.userId = action.payload;
    },
    setTargetGroupId: (state, action) => {
      state.targetGroupId = action.payload;
    },
    setCategoryId: (state, action) => {
      state.categoryId = action.payload;
    },
    setTagIds: (state, action) => {
      state.tagIds = action.payload;
    },
    setSections: (state, action) => {
      state.sections = action.payload;
    },
    setSuccessionRates: (state, action) => {
      state.successionRates = action.payload;
    },
    resetFormData: () => initialState,
  },
});

export const {
  setName,
  setDescription,
  setDuration,
  setVerifiedCertificate,
  setImageFile,
  setUserId,
  setTargetGroupId,
  setCategoryId,
  setTagIds,
  setSections,
  setSuccessionRates,
  resetFormData,
} = postCourseSlice.actions;

export default postCourseSlice.reducer;
