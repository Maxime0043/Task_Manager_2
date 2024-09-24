import express from "express";

const router = express.Router();

// Import Middlewares
import {
  constructMulterMiddleware,
  multerConversationsMiddleware,
} from "../storage";

// Import Controllers
import { create, listAll, remove } from "../controllers/message.controller";

// Define the API routes
router.get("/:id", listAll);
router.post(
  "/:id",
  constructMulterMiddleware(multerConversationsMiddleware, "files", false, 4),
  create
);
router.delete("/:conversationId/:messageId", remove);

// Export the router
export default router;
