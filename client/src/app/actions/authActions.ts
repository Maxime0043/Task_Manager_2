import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

interface InfoUserResponse {
  user: Record<string, null | string | number | boolean>;
}

export const signinUser = createAsyncThunk(
  "auth/signin",
  (data: { email: string; password: string }) => {
    return axios.post(
      `${import.meta.env.VITE_API_URL}/api/v1/auth/signin`,
      data,
      {
        withCredentials: true,
      }
    );
  }
);

export const signoutUser = createAsyncThunk("auth/signout", () => {
  return axios.post(
    `${import.meta.env.VITE_API_URL}/api/v1/auth/signout`,
    {},
    {
      withCredentials: true,
    }
  );
});

export const infoUser = createAsyncThunk<InfoUserResponse>("auth/info", () => {
  return axios
    .get(`${import.meta.env.VITE_API_URL}/api/v1/users/info`, {
      withCredentials: true,
    })
    .then((response) => response.data);
});
