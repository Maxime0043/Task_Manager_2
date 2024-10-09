import { createSlice } from "@reduxjs/toolkit";
import { infoUser, signinUser, signoutUser } from "../actions/authActions";
import Cookies from "js-cookie";

export type InitialStateType = {
  loading: boolean;
  error: null | string;
  success: boolean;
  userSid: null | string;
  user: {
    id: null | string;
    lastName: null | string;
    firstName: null | string;
    icon: null | string;
  };
};

export const authSlice = createSlice({
  name: "auth",
  initialState: {
    loading: false,
    error: null,
    success: false, // This is used to display a success message to the user
    userSid: null,
    user: {
      id: null,
      lastName: null,
      firstName: null,
      icon: null,
    },
  } as InitialStateType,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Signin
      .addCase(signinUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
        state.userSid = null;
        state.user = {
          id: null,
          lastName: null,
          firstName: null,
          icon: null,
        };
      })
      .addCase(signinUser.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
        state.userSid = Cookies.get("connect.sid") ?? null;
      })
      .addCase(signinUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message as string;
      })

      // Signout
      .addCase(signoutUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(signoutUser.fulfilled, (state) => {
        state.loading = false;
        state.userSid = null;
        state.user = {
          id: null,
          lastName: null,
          firstName: null,
          icon: null,
        };

        Cookies.remove("connect.sid", {
          secure: true,
          sameSite: "none",
          domain: import.meta.env.VITE_COOKIE_DOMAIN,
        });
      })
      .addCase(signoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message as string;
      })

      // Info
      .addCase(infoUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(infoUser.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.userSid = Cookies.get("connect.sid") ?? null;

        state.user.id = action.payload.user.id as string;
        state.user.firstName = action.payload.user.firstName as string;
        state.user.lastName = action.payload.user.lastName as string;
        state.user.icon = action.payload.user.icon as string | null;
      })
      .addCase(infoUser.rejected, (state) => {
        state.loading = false;
        // state.error = action.error.message as string;

        Cookies.remove("connect.sid", {
          secure: true,
          sameSite: "none",
          domain: import.meta.env.VITE_COOKIE_DOMAIN,
        });
      });
  },
});

export default authSlice.reducer;
