import express from "express";

const router = express.Router();

// Import Middlewares

// Import Controllers
import { listAll } from "../controllers/message.controller";

// Define the API routes
router.get("/:id", listAll);

// Export the router
export default router;
