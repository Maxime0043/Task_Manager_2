import express from "express";

const router = express.Router();

// Import Middlewares
import { authRequired } from "../middlewares/auth.middleware";

// Import Controllers
import { signin, signup, signout } from "../controllers/auth.controller";

// Define the API routes
router.post("/signup", signup);
router.post("/signin", signin);
router.post("/signout", [authRequired], signout);

// Export the router
export default router;
