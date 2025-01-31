import { fetchCourseCategory } from '@/api/courseCategory';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';


export const courseCategoryAsync = createAsyncThunk('data/fetchCourseCategory', async () => {
    const data = await fetchCourseCategory();
    return data;
});

const initialState = {
    data: null,
};

export const courseCategorySlice = createSlice({
    name: 'courseCategory',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(courseCategoryAsync.fulfilled, (state, action) => {
            return { ...state, data: action.payload };
        });
    },
});

export default courseCategorySlice.reducer;