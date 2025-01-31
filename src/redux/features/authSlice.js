// src/redux/features/authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  phoneNumber: null,
  isLoading: false,
  error: null,
  isSuccess: false,
  otpVerified: false,
  otpError: null,
  otpLoading: false,
  resendOtpLoading: false,
};

export const loginUser = createAsyncThunk(
  "auth/login",
  async ({ username, password }, { rejectWithValue }) => {
    try {
      const response = await fetch(
        "https://bravoadmin.uplms.org/api/AdminApplicationUser/Login",
        {
          method: "POST",
          headers: {
            accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.title || "Unauthorized");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue("Login failed. Please check your credentials.");
    }
  }
);

export const verifyOTP = createAsyncThunk(
  "auth/verifyOTP",
  async (otpToken, userId, { rejectWithValue }) => {
    try {
      const response = await fetch(
        "https://bravoadmin.uplms.org/api/AdminApplicationUser/OtpConfirmationForLogin",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ otpToken, userId }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.title || "OTP verification failed");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const resendOTP = createAsyncThunk(
  "auth/resendOTP",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(
        "https://bravoadmin.uplms.org/api/AdminApplicationUser/ResendOTP",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || "Failed to resend OTP");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    resetState: (state) => {
      state.isLoading = false;
      state.error = null;
      state.isSuccess = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login reducers
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = action.payload.isSuccess;
        state.phoneNumber = action.payload.phoneNumber;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        toast.error(action.payload || "Login failed");
      })
      // OTP verification reducers
      .addCase(verifyOTP.pending, (state) => {
        state.otpLoading = true;
        state.otpError = null;
      })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        state.otpLoading = false;
        state.otpVerified = true;
        state.otpError = null;
        state.user = {
          jwtToken: action.payload.jwtToken,
          refreshToken: action.payload.refreshToken,
          userId: action.payload.userId,
        };
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.otpLoading = false;
        state.otpError = action.payload;
      })
      // Resend OTP reducers
      .addCase(resendOTP.pending, (state) => {
        state.resendOtpLoading = true;
      })
      .addCase(resendOTP.fulfilled, (state) => {
        state.resendOtpLoading = false;
      })
      .addCase(resendOTP.rejected, (state, action) => {
        state.resendOtpLoading = false;
        state.otpError = action.payload;
      });
  },
});

export const { resetState, clearError } = authSlice.actions;
export default authSlice.reducer;
