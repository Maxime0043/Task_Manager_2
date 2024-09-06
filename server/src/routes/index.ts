import express from "express";

const router = express.Router();

// Import Middlewares

// Import Routes
import authRoutes from "./auth.route";

// Define the API routes
router.use("/auth", authRoutes);

// Export the router
export default router;
