import express from "express";

const router = express.Router();

// Import Middlewares

// Import Controllers
import { create, details, listAll } from "../controllers/client.controller";

// Define the API routes
router.get("/", listAll);
router.get("/:id", details);
router.post("/", create);

// Export the router
export default router;
