import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchPositionGroup } from '@/api/positionGroup';

export const positionGroupAsync = createAsyncThunk('data/fetchPositionGroup', async () => {
    const data = await fetchPositionGroup();
    return data;
});

const initialState = {
    data: null,
};

export const positionGroupSlice = createSlice({
    name: 'positionGroup',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(positionGroupAsync.fulfilled, (state, action) => {
            return { ...state, data: action.payload };
        });
    },
});

export default positionGroupSlice.reducer;