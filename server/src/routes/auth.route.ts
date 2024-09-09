import express from "express";

const router = express.Router();

// Import Controllers
import { signin, signup, signout } from "../controllers/auth.controller";

// Define the API routes
router.post("/signup", signup);
router.post("/signin", signin);
router.post("/signout", signout);

// Export the router
export default router;
