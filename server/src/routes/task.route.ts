import express from "express";

const router = express.Router();

// Import Middlewares
import { constructMulterMiddleware, multerTaskMiddleware } from "../storage";

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
import statusRoutes from "./task_status.route";

// Define the API routes
router.use("/scheduled", taskScheduledRoutes);
router.use("/status", statusRoutes);

router.get("/", listAll);
router.get("/:id", details);
router.post(
  "/",
  constructMulterMiddleware(multerTaskMiddleware, "files", false, 20),
  create
);
router.put("/:id", update);
router.delete("/:id", remove);
router.post("/restore/:id", restore);

// Export the router
export default router;
