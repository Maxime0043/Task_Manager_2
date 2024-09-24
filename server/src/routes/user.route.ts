import express from "express";

const router = express.Router();

// Import Middlewares
import { constructMulterMiddleware, multerUserMiddleware } from "../storage";

// Import Controllers
import { info, listAll, update } from "../controllers/user.controller";

// Define the API routes
router.get("/", listAll);
router.get("/info", info);
router.put(
  "/info",
  constructMulterMiddleware(multerUserMiddleware, "image"),
  update
);

// Export the router
export default router;
