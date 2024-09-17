import express from "express";

const router = express.Router();

// Import Middlewares

// Import Routes
import statusRoutes from "./project_status.route";

// Import Controllers
import {
  create,
  details,
  listAll,
  remove,
  restore,
  update,
} from "../controllers/project.controller";

// Define the API routes
router.use("/status", statusRoutes);

router.get("/", listAll);
router.get("/:id", details);
router.post("/", create);
router.put("/:id", update);
router.delete("/:id", remove);
router.post("/restore/:id", restore);

// Export the router
export default router;
