import { createSlice } from "@reduxjs/toolkit";
import { signinUser, signoutUser } from "../actions/authActions";
import Cookies from "js-cookie";

export type InitialStateType = {
  loading: boolean;
  error: null | string;
  success: boolean;
  userSid: null | string;
  user: {
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
          lastName: null,
          firstName: null,
          icon: null,
        };
      })
      .addCase(signinUser.fulfilled, (state, action) => {
        if (action.payload.status !== 200) {
          state.loading = false;
          state.error = action.payload.statusText;
        } else {
          state.loading = false;
          state.success = true;
          state.userSid = Cookies.get("connect.sid") ?? null;
        }
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
          lastName: null,
          firstName: null,
          icon: null,
        };
      })
      .addCase(signoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message as string;
      });
  },
});

export default authSlice.reducer;
