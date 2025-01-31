import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchGender } from '@/api/gender';

export const genderAsync = createAsyncThunk('data/fetchGender', async () => {
    const data = await fetchGender();
    return data;
});

const initialState = {
    data: null,
};

export const genderSlice = createSlice({
    name: 'gender',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(genderAsync.fulfilled, (state, action) => {
            return { ...state, data: action.payload };
        });
    },
});

export default genderSlice.reducer;