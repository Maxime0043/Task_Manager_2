import express from "express";

const router = express.Router();

// Import Middlewares

// Import Controllers
import {
  create as createUser,
  remove as removeUser,
  updateOther as updateUser,
} from "../controllers/user.controller";

// Import routes

// Define the API routes
router.post("/users", createUser);
router.put("/users/:id", updateUser);
router.delete("/users/:id", removeUser);

// Export the router
export default router;
