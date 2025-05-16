import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchDepartment } from '@/api/department';

export const departmentAsync = createAsyncThunk('data/fetchDepartment', async () => {
    const data = await fetchDepartment();
    return data;
});

const initialState = {
    data: null,
};

export const departmentSlice = createSlice({
    name: 'department',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(departmentAsync.fulfilled, (state, action) => {
            return { ...state, data: action.payload };
        });
    },
});

export default departmentSlice.reducer;