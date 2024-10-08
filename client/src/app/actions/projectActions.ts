import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const listProjects = createAsyncThunk(
  "projects/list",
  (data: {
    limit: number;
    offset: number;
    orderBy?: string;
    dir?: string;
    name?: string;
    statusId?: number;
    isInternalProject?: boolean;
    managerId?: string;
    clientId?: string;
    deleted?: boolean;
  }) => {
    const query = new URLSearchParams(
      Object.entries(data).reduce((acc, [key, value]) => {
        acc[key] = value?.toString();
        return acc;
      }, {} as Record<string, string>)
    ).toString();

    return axios
      .get(`${import.meta.env.VITE_API_URL}/api/v1/projects?${query}`, {
        withCredentials: true,
      })
      .then((response) => response.data);
  }
);
