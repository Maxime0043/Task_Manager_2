import express from "express";

const router = express.Router();

// Import Middlewares

// Import Controllers
import {
  create,
  details,
  listAll,
  update,
} from "../controllers/client.controller";

// Define the API routes
router.get("/", listAll);
router.get("/:id", details);
router.post("/", create);
router.put("/:id", update);

// Export the router
export default router;
