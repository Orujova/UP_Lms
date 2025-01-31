import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchDivision } from '@/api/division';

export const divisionAsync = createAsyncThunk('data/fetchDivision', async () => {
    const data = await fetchDivision();
    return data;
});

const initialState = {
    data: null,
};

export const divisionSlice = createSlice({
    name: 'division',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(divisionAsync.fulfilled, (state, action) => {
            return { ...state, data: action.payload };
        });
    },
});

export default divisionSlice.reducer;