import express from "express";

const router = express.Router();

// Import Middlewares

// Import Controllers
import { info, listAll, update } from "../controllers/user.controller";

// Define the API routes
router.get("/", listAll);
router.get("/info", info);
router.put("/info", update);

// Export the router
export default router;
