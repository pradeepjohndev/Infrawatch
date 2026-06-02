import { Router } from "express";
import { registerAgentRoute, storeMetricsRoute, inspectDeviceRoute } from "../controllers/agentController.js";

const router = Router();
router.post("/agent/register", registerAgentRoute);
router.post("/metrics", storeMetricsRoute);
router.get("/inspect", inspectDeviceRoute);

export default router;
