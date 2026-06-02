import { Router } from "express";
import { login, register, authorization, resetUser, authCheck, logout, getDashboardData, healthCheck } from "../controllers/authController.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { validateLoginPayload, validateRegisterPayload } from "../validations/authValidation.js";

const router = Router();
router.post("/login", validateLoginPayload, login);
router.post("/register", validateRegisterPayload, requireAdmin, register);
router.get("/Authorization", authorization);
router.post("/reset", requireAdmin, resetUser);
router.get("/auth-check", verifyToken, authCheck);
router.post("/logout", logout);
router.get("/dashboard-data", verifyToken, getDashboardData);
router.get("/health", healthCheck);

export default router;
