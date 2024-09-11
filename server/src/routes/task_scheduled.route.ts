import express from "express";
import { listAll } from "../controllers/task_scheduled.controller";

const router = express.Router();

// Import Middlewares

// Import Controllers

// Define the API routes
router.get("/", listAll);

// Export the router
export default router;
