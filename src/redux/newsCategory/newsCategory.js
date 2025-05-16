import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchNewsCategory } from '@/api/newsCategory';

export const newsCategoryAsync = createAsyncThunk('data/fetchNewsCategory', async () => {
    const data = await fetchNewsCategory();
    return data;
});

const initialState = {
    data: null,
};

export const newsCategorySlice = createSlice({
    name: 'newsCategory',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(newsCategoryAsync.fulfilled, (state, action) => {
            return { ...state, data: action.payload };
        });
    },
});

export default newsCategorySlice.reducer;