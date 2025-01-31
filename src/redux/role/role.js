import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchRole } from '@/api/role';

export const roleAsync = createAsyncThunk('data/fetchRole', async () => {
    const data = await fetchRole();
    return data;
});

const initialState = {
    data: null,
};

export const roleSlice = createSlice({
    name: 'residentalArea',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(roleAsync.fulfilled, (state, action) => {
            return { ...state, data: action.payload };
        });
    },
});

export default roleSlice.reducer;