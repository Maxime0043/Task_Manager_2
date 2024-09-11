import express from "express";
import { details, listAll } from "../controllers/task_scheduled.controller";

const router = express.Router();

// Import Middlewares

// Import Controllers

// Define the API routes
router.get("/", listAll);
router.get("/:id", details);

// Export the router
export default router;
