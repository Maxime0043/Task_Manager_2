import express from "express";

const router = express.Router();

// Import Middlewares
import {
  adminRequired,
  auth,
  authRequired,
} from "../middlewares/auth.middleware";

// Import Routes
import authRoutes from "./auth.route";
import clientRoutes from "./client.route";
import projectRoutes from "./project.route";
import taskRoutes from "./task.route";
import userRoutes from "./user.route";
import messageRoutes from "./message.route";
import adminRoutes from "./admin.route";

// Define the API routes
router.use("/auth", [auth], authRoutes);
router.use("/clients", [auth, authRequired], clientRoutes);
router.use("/projects", [auth, authRequired], projectRoutes);
router.use("/tasks", [auth, authRequired], taskRoutes);
router.use("/users", [auth, authRequired], userRoutes);
router.use("/messages", [auth, authRequired], messageRoutes);

router.use("/admin", [auth, authRequired, adminRequired], adminRoutes);

// Export the router
export default router;
