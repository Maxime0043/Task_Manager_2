import { createSlice } from "@reduxjs/toolkit";
import { listProjects } from "../actions/projectActions";

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
  extraReducers: (builder) => {
    builder
      // List projects
      .addCase(listProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(listProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;

        // If the offset is 0, we reset the projects array
        if (action.meta.arg.offset === 0) {
          state.projects = action.payload
            .projects as InitialStateType["projects"];
        } else {
          state.projects = [
            ...state.projects,
            ...(action.payload.projects as InitialStateType["projects"]),
          ];
        }
      })
      .addCase(listProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message as string;
        state.projects = [];

        console.log(action.error);
      });
  },
});

export default projectSlice.reducer;
