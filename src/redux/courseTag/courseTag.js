import { fetchCourseTag } from '@/api/courseTag';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';


export const courseTagAsync = createAsyncThunk('data/fetchCourseTag', async () => {
    const data = await fetchCourseTag();
    return data;
});

const initialState = {
    data: null,
};

export const courseTagSlice = createSlice({
    name: 'courseTag',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(courseTagAsync.fulfilled, (state, action) => {
            return { ...state, data: action.payload };
        });
    },
});

export default courseTagSlice.reducer;