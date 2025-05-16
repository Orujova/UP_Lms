"use client";

import { configureStore, createSlice } from "@reduxjs/toolkit";
import { useEffect } from "react";

//Slicers
const userSlice = createSlice({
  name: "user",
  initialState: {
    isUserLogged: false,
    localUserInfo: false,
  },
  reducers: {
    user_login: (state) => {
      state.isUserLogged = true;
    },
    user_logout: (state) => {
      state.isUserLogged = false;
    },
  },
});

export const { user_login, user_logout } = userSlice.actions;

export const user_state = (state) => state.user.isUserLogged;

//admin
const adminSlice = createSlice({
  name: "admin",
  initialState: {
    isAdminLogged: false,
    localAdminInfo: false,
  },
  reducers: {
    admin_login: (state) => {
      state.isAdminLogged = true;
    },
    admin_logout: (state) => {
      state.isAdminLogged = false;
    },
  },
});

export const { admin_login, admin_logout } = adminSlice.actions;

//Store
const store = configureStore({
  reducer: {
    user: userSlice.reducer,
    admin: adminSlice.reducer,
  },
});

export default store;
