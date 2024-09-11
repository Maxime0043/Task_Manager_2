import express from "express";
import {
  create,
  details,
  listAll,
} from "../controllers/task_scheduled.controller";

const router = express.Router();

// Import Middlewares

// Import Controllers

// Define the API routes
router.get("/", listAll);
router.get("/:id", details);
router.post("/", create);

// Export the router
export default router;
