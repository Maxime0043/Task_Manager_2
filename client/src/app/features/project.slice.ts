import { createSlice } from "@reduxjs/toolkit";

export type InitialStateType = {
  loading: boolean;
  error: null | string;
  success: boolean;
  projects: {
    id: number;
    name: string;
    statusId: number;
    description: string;
    isInternalProject: boolean;
    managerId: string;
    clientId: string;
    creatorId: string | null;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
  }[];
};

export const projectSlice = createSlice({
  name: "projects",
  initialState: {
    loading: false,
    error: null,
    success: false, // This is used to display a success message to the user
    projects: [],
  } as InitialStateType,
  reducers: {},
  extraReducers: () => {},
});

export default projectSlice.reducer;
