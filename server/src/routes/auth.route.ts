import express from "express";

const router = express.Router();

// Import Controllers
import { signin, signup } from "../controllers/auth.controller";

// Define the API routes
router.post("/signup", signup);
router.post("/signin", signin);

// Export the router
export default router;
