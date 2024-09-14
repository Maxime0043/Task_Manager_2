import express from "express";

const router = express.Router();

// Import Middlewares

// Import Controllers
import {
  create as createUser,
  updateOther as updateUser,
} from "../controllers/user.controller";

// Import routes

// Define the API routes
router.post("/users", createUser);
router.put("/users/:id", updateUser);

// Export the router
export default router;
