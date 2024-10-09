import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/auth.slice";
import projectReducer from "./features/project.slice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    projects: projectReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
