import { fetchFunctionalArea } from '@/api/functionalArea';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const functionalAreaAsync = createAsyncThunk('data/fetchFunctionalArea', async () => {
    const data = await fetchFunctionalArea();
    return data;
});

const initialState = {
    data: null,
};

export const functionalAreaSlice = createSlice({
    name: 'functionalArea',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(functionalAreaAsync.fulfilled, (state, action) => {
            return { ...state, data: action.payload };
        });
    },
});

export default functionalAreaSlice.reducer;