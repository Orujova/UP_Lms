import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchGetAllTargetGroups } from '@/api/getAllTargetGroups';

export const getAllTargetGroupsAsync = createAsyncThunk('data/fetchNews', async () => {
    const data = await fetchGetAllTargetGroups();
    return data;
});

const initialState = {
    data: null,
};

export const getAllTargetGroupsSlice = createSlice({
    name: 'getAllTargetGroups',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(getAllTargetGroupsAsync.fulfilled, (state, action) => {
            return { ...state, data: action.payload };
        });
    },
});

export default getAllTargetGroupsSlice.reducer;