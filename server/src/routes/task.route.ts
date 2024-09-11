import express from "express";

const router = express.Router();

// Import Middlewares

// Import Controllers
import { listAll } from "../controllers/task.controller";

// Define the API routes
router.get("/", listAll);

// Export the router
export default router;
