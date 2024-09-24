import express from "express";

const router = express.Router();

// Import Middlewares
import {
  constructMulterMiddleware,
  multerConversationsMiddleware,
} from "../storage";
import {
  conversationExists,
  messageExists,
} from "../middlewares/conversation.middleware";

// Import Controllers
import { create, listAll, remove } from "../controllers/message.controller";

// Define the API routes
router.get("/:id", conversationExists, listAll);
router.post(
  "/:id",
  [
    constructMulterMiddleware(multerConversationsMiddleware, "files", false, 4),
    conversationExists,
  ],
  create
);
router.delete(
  "/:conversationId/:messageId",
  [conversationExists, messageExists],
  remove
);

// Export the router
export default router;
