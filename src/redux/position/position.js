import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchPosition } from '@/api/position';

export const positionAsync = createAsyncThunk('data/fetchPosition', async () => {
    const data = await fetchPosition();
    return data;
});

const initialState = {
    data: null,
};

export const positionSlice = createSlice({
    name: 'position',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(positionAsync.fulfilled, (state, action) => {
            return { ...state, data: action.payload };
        });
    },
});

export default positionSlice.reducer;