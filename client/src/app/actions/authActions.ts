import { createAsyncThunk } from "@reduxjs/toolkit";

export const signinUser = createAsyncThunk(
  "auth/signin",
  (data: { email: string; password: string }) => {
    return fetch(`${import.meta.env.VITE_API_URL}/api/v1/auth/signin`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  }
);

export const signoutUser = createAsyncThunk("auth/signout", () => {
  return fetch(`${import.meta.env.VITE_API_URL}/api/v1/auth/signout`, {
    method: "POST",
    credentials: "include",
  });
});
