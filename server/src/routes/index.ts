import express from "express";

const router = express.Router();

// Import Middlewares
import { auth, authRequired } from "../middlewares/auth.middleware";

// Import Routes
import authRoutes from "./auth.route";
import clientRoutes from "./client.route";

// Define the API routes
router.use("/auth", [auth], authRoutes);
router.use("/client", [auth, authRequired], clientRoutes);

// Export the router
export default router;
