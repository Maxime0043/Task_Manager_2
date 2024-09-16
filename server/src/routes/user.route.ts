import express from "express";

const router = express.Router();

// Import Middlewares

// Import Controllers
import { info, listAll } from "../controllers/user.controller";

// Define the API routes
router.get("/", listAll);
router.get("/info", info);

// Export the router
export default router;
