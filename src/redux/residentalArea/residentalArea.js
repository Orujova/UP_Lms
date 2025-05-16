import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchResidentalArea } from '@/api/residentalArea';

export const residentalAreaAsync = createAsyncThunk('data/fetchResidentalArea', async () => {
    const data = await fetchResidentalArea();
    return data;
});

const initialState = {
    data: null,
};

export const residentalAreaSlice = createSlice({
    name: 'residentalArea',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(residentalAreaAsync.fulfilled, (state, action) => {
            return { ...state, data: action.payload };
        });
    },
});

export default residentalAreaSlice.reducer;