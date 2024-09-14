import express from "express";

const router = express.Router();

// Import Middlewares

// Import Controllers
import {
  create as createRole,
  details as detailsUserRole,
  listAll as listAllUserRoles,
  remove as removeUserRole,
  update as updateUserRole,
} from "../controllers/user_role.controller";
import {
  create as createUser,
  remove as removeUser,
  restore as restoreUser,
  updateOther as updateUser,
} from "../controllers/user.controller";
import {
  create as createProjectStatus,
  details as detailsProjectStatus,
  listAll as listAllProjectStatus,
  remove as removeProjectStatus,
  update as updateProjectStatus,
} from "../controllers/project_status.controller";
import { listAll as listAllTaskStatus } from "../controllers/task_status.controller";

// Import routes

// Define the API routes
router.get("/user_roles", listAllUserRoles);
router.get("/user_roles/:id", detailsUserRole);
router.post("/user_roles", createRole);
router.put("/user_roles/:id", updateUserRole);
router.delete("/user_roles/:id", removeUserRole);

router.post("/users", createUser);
router.put("/users/:id", updateUser);
router.delete("/users/:id", removeUser);
router.post("/users/restore/:id", restoreUser);

router.get("/project_status", listAllProjectStatus);
router.get("/project_status/:id", detailsProjectStatus);
router.post("/project_status", createProjectStatus);
router.put("/project_status/:id", updateProjectStatus);
router.delete("/project_status/:id", removeProjectStatus);

router.get("/task_status", listAllTaskStatus);

// Export the router
export default router;
