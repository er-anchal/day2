import express from "express";
import {
  createRoleAccess,
  getRoleAccessList,
  getUserAccess,
  updateRoleAccess,
  getRoleAccessByRole,
} from "../controllers/roleAccessController.js";

const router = express.Router();

router.post("/", createRoleAccess);
router.get("/", getRoleAccessList);
router.get("/role/:roleName", getRoleAccessByRole);
router.get("/:id", getUserAccess);
router.put("/:id", updateRoleAccess);

export default router;
