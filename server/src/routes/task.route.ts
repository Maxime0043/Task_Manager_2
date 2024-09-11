import express from "express";

const router = express.Router();

// Import Middlewares

// Import Controllers
import {
  create,
  details,
  listAll,
  remove,
  restore,
  update,
} from "../controllers/task.controller";

// Import routes
import taskScheduledRoutes from "./task_scheduled.route";

// Define the API routes
router.get("/", listAll);
router.get("/:id", details);
router.post("/", create);
router.put("/:id", update);
router.delete("/:id", remove);
router.post("/restore/:id", restore);

// Define the API routes
router.use("/scheduled", taskScheduledRoutes);

// Export the router
export default router;
