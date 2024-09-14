import express from "express";

const router = express.Router();

// Import Middlewares

// Import Controllers
import {
  create as createRole,
  details as detailsUserRole,
  listAll as listAllUserRoles,
  update as updateRole,
} from "../controllers/user_role.controller";
import {
  create as createUser,
  remove as removeUser,
  restore as restoreUser,
  updateOther as updateUser,
} from "../controllers/user.controller";

// Import routes

// Define the API routes
router.get("/user_roles", listAllUserRoles);
router.get("/user_roles/:id", detailsUserRole);
router.post("/user_roles", createRole);
router.put("/user_roles/:id", updateRole);

router.post("/users", createUser);
router.put("/users/:id", updateUser);
router.delete("/users/:id", removeUser);
router.post("/users/restore/:id", restoreUser);

// Export the router
export default router;
