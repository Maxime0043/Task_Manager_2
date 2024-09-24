import express from "express";

const router = express.Router();

// Import Middlewares

// Import Controllers
import { create, listAll } from "../controllers/message.controller";
import {
  constructMulterMiddleware,
  multerConversationsMiddleware,
} from "../storage";

// Define the API routes
router.get("/:id", listAll);
router.post(
  "/:id",
  constructMulterMiddleware(multerConversationsMiddleware, "files", false, 4),
  create
);

// Export the router
export default router;
