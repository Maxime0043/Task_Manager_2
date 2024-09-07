import express from "express";

const router = express.Router();

// Import Controllers
import { signup } from "../controllers/auth.controller";

// Define the API routes
router.get("/signup", signup);

// Export the router
export default router;
