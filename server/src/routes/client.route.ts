import express from "express";

const router = express.Router();

// Import Middlewares

// Import Controllers
import {
  create,
  details,
  listAll,
  remove,
  update,
} from "../controllers/client.controller";

// Define the API routes
router.get("/", listAll);
router.get("/:id", details);
router.post("/", create);
router.put("/:id", update);
router.delete("/:id", remove);

// Export the router
export default router;
