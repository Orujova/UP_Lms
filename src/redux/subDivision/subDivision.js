import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchSubDivision } from '@/api/subDivision';

export const subDivisionAsync = createAsyncThunk('data/fetchSubDivision', async () => {
    const data = await fetchSubDivision();
    return data;
});

const initialState = {
    data: null,
};

export const subDivisionSlice = createSlice({
    name: 'subDivision',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(subDivisionAsync.fulfilled, (state, action) => {
            return { ...state, data: action.payload };
        });
    },
});

export default subDivisionSlice.reducer;