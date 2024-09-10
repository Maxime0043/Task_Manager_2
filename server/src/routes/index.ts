import express from "express";

const router = express.Router();

// Import Middlewares
import { auth } from "../middlewares/auth.middleware";

// Import Routes
import authRoutes from "./auth.route";

// Define the API routes
router.use("/auth", [auth], authRoutes);

// Export the router
export default router;
