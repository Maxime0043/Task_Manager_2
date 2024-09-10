import express from "express";

const router = express.Router();

// Import Middlewares
import { auth, authRequired } from "../middlewares/auth.middleware";

// Import Routes
import authRoutes from "./auth.route";
import clientRoutes from "./client.route";
import projectRoutes from "./project.route";

// Define the API routes
router.use("/auth", [auth], authRoutes);
router.use("/clients", [auth, authRequired], clientRoutes);
router.use("/projects", [auth, authRequired], projectRoutes);

// Export the router
export default router;
