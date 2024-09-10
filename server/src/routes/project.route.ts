import express from "express";

const router = express.Router();

// Import Middlewares

// Import Controllers
import { details, listAll } from "../controllers/project.controller";

// Define the API routes
router.get("/", listAll);
router.get("/:id", details);

// Export the router
export default router;
