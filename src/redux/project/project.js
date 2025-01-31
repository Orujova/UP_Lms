import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchProject } from '@/api/project';

export const projectAsync = createAsyncThunk('data/fetchProject', async () => {
    const data = await fetchProject();
    return data;
});

const initialState = {
    data: null,
};

export const projectSlice = createSlice({
    name: 'project',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(projectAsync.fulfilled, (state, action) => {
            return { ...state, data: action.payload };
        });
    },
});

export default projectSlice.reducer;