import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchCourse } from '@/api/course';

export const courseAsync = createAsyncThunk('data/fetchCourses', async () => {
    const data = await fetchCourse();
    return data;
});

const initialState = {
    data: null,
};

export const coursesSlice = createSlice({
    name: 'course',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(courseAsync.fulfilled, (state, action) => {
            return { ...state, data: action.payload };
        });
    },
});

export default coursesSlice.reducer;