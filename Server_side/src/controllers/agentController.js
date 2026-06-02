import { registerAgent, storeAgentMetrics, inspectDevice } from "../services/agentService.js";

export async function registerAgentRoute(req, res) {
    try {
        await registerAgent(req.body);
        res.json({ message: "Device registered successfully" });
    } catch (err) {
        console.error("Register error:", err);
        res.status(500).json({ error: "Registration failed" });
    }
}

export async function storeMetricsRoute(req, res) {
    try {
        await storeAgentMetrics(req.body);
        res.json({ message: "Metrics stored successfully" });
    } catch (err) {
        console.error("Metrics error FULL:", err);
        if (err.message === "Device not registered") {
            return res.status(404).json({ error: err.message });
        }
        res.status(500).json({ error: err.message });
    }
}

export async function inspectDeviceRoute(req, res) {
    try {
        const { search, date } = req.query;
        const result = await inspectDevice(search, date);
        if (!result) {
            return res.status(404).json({ error: "Device not found" });
        }
        res.json(result);
    } catch (err) {
        console.error("Inspect error:", err);
        res.status(500).json({ error: "Failed to fetch device info" });
    }
}
