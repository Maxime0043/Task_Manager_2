import express from "express";

const router = express.Router();

// Import Middlewares

// Import Controllers
import { create as createUser } from "../controllers/user.controller";

// Import routes

// Define the API routes
router.post("/users", createUser);

// Export the router
export default router;
