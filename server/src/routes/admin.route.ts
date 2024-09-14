import express from "express";

const router = express.Router();

// Import Middlewares

// Import Controllers
import {
  create as createUser,
  remove as removeUser,
  restore as restoreUser,
  updateOther as updateUser,
} from "../controllers/user.controller";

// Import routes

// Define the API routes
router.post("/users", createUser);
router.put("/users/:id", updateUser);
router.delete("/users/:id", removeUser);
router.post("/users/restore/:id", restoreUser);

// Export the router
export default router;
