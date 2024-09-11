import express from "express";
import {
  create,
  details,
  listAll,
  remove,
  update,
} from "../controllers/task_scheduled.controller";

const router = express.Router();

// Import Middlewares

// Import Controllers

// Define the API routes
router.get("/", listAll);
router.get("/:id", details);
router.post("/", create);
router.put("/:id", update);
router.delete("/:id", remove);

// Export the router
export default router;
