import express from "express";
import http from "http";
import WebSocket, { WebSocketServer } from "ws";
import cors from "cors";
import dotenv from "dotenv";
import { poolPromise, sql } from "../DB_server/DB_conn/Database_connection.js";

dotenv.config();

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: "/ws" });
const pcs = new Map();
const dashboards = new Set();

function getPcType(pc) {
  const rawType = pc?.variable ?? pc?.staticInfo?.variable ?? pc?.staticInfo?.system?.variable;
  if (typeof rawType === "string") {
    const normalized = rawType.trim().toLowerCase();
    if (normalized === "server" || normalized === "system") return normalized;
  }

  const os = pc?.staticInfo?.os?.distro ?? "";
  return os.toLowerCase().includes("server") ? "server" : "system";
}

app.use(cors({ origin: "*" }));
app.set("trust proxy", true);
app.use(express.json());

app.get("/", (_, res) => {
  res.send("Server running");
});

app.get("/api/health", (_, res) => {
  res.json({ status: "ok" });
});

wss.on("connection", (ws) => {
  ws.isDashboard = false;

  ws.on("message", (msg) => {
    let data;
    try {
      data = JSON.parse(msg.toString());
    } catch {
      return;
    }

    if (data.type === "DASHBOARD_REGISTER") {
      ws.isDashboard = true;
      dashboards.add(ws);

      console.log("Dashboard connected");
      sendCounts();
      sendDashboardData();
      return;
    }

    if (data.type === "REGISTER") {
      console.log("Device registered:", data.pcId);

      pcs.set(data.pcId, {
        pcId: data.pcId,
        online: true,
        lastSeen: Date.now(),
        staticInfo: data.payload,
        stats: null
      });

      sendCounts();
      sendDashboardData();
      return;
    }

    if (data.type === "SYSTEM_STATS") {
      const pc = pcs.get(data.pcId);
      if (!pc) return;

      pc.stats = data.payload;
      pc.lastSeen = Date.now();
      pc.online = true;

      sendCounts();
      sendDashboardData();
      return;
    }

    if (data.type === "HEARTBEAT") {
      const pc = pcs.get(data.pcId);
      if (pc) {
        pc.lastSeen = Date.now();
        pc.online = true;
      }
    }
  });

  ws.on("close", () => {
    if (ws.isDashboard) {
      dashboards.delete(ws);
      console.log("Dashboard disconnected");
    }
  });
});

setInterval(() => {
  const now = Date.now();
  let changed = false;

  pcs.forEach(pc => {
    if (pc.online && now - pc.lastSeen > 6000) {
      pc.online = false;
      changed = true;
    }
  });

  if (changed) {
    sendCounts();
    sendDashboardData();
  }
}, 1000);

function sendCounts() {
  const totalDevices = pcs.size;
  const onlineDevices = [...pcs.values()].filter(p => p.online).length;
  const offlineDevices = totalDevices - onlineDevices;
  const serverDevices = [...pcs.values()].filter(p => getPcType(p) === "server").length;

  const msg = JSON.stringify({
    type: "COUNTS_UPDATE",
    payload: {
      totalDevices,
      onlineDevices,
      offlineDevices,
      serverDevices,
    }
  });

  dashboards.forEach(ws => {
    if (ws.readyState === WebSocket.OPEN) ws.send(msg);
  });
}

function sendDashboardData() {
  const payload = [...pcs.values()];

  const msg = JSON.stringify({
    type: "DASHBOARD_UPDATE",
    payload
  });

  dashboards.forEach(ws => {
    if (ws.readyState === WebSocket.OPEN) ws.send(msg);
  });
}

/*app.post("/api/agent/register", async (req, res) => {
  const data = req.body;

  try {
    const pool = await poolPromise;
    await pool.request()
      .input("agent_uuid", sql.VarChar, data.agent_id)
      .input("hostname", sql.VarChar, data.hostname)
      .query(`
        IF NOT EXISTS (SELECT 1 FROM agents WHERE agent_uuid = @agent_uuid) INSERT INTO agents (agent_uuid, hostname) VALUES (@agent_uuid, @hostname)
      `);

    const agentResult = await pool.request()
      .input("agent_uuid", sql.VarChar, data.agent_id)
      .query(`SELECT agent_id FROM agents WHERE agent_uuid = @agent_uuid`);

    const agentId = agentResult.recordset[0].agent_id;

    await pool.request()
      .input("agent_id", sql.Int, agentId)
      .input("os", sql.VarChar, data.os)
      .input("architecture", sql.VarChar, data.architecture)
      .input("cpu_model", sql.VarChar, data.cpu_model)
      .input("cpu_cores", sql.Int, data.cpu_cores)
      .input("total_ram_gb", sql.Float, data.total_ram_gb)
      .input("manufacturer", sql.VarChar, data.manufacturer)
      .input("model", sql.VarChar, data.model)
      .query(`
        IF NOT EXISTS (SELECT 1 FROM system_static_info WHERE agent_id = @agent_id)
        INSERT INTO system_static_info (agent_id,os,architecture,cpu_model,cpu_cores,total_ram_gb,manufacturer,model)
        VALUES ( @agent_id, @os, @architecture, @cpu_model, @cpu_cores, @total_ram_gb, @manufacturer,@model)
      `);

    await pool.request()
      .input("agent_id", sql.Int, agentId)
      .query(`UPDATE agents SET last_seen = GETDATE() WHERE agent_id = @agent_id`);

    res.json({ message: "Agent registered successfully" });

  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Agent registration failed" });
  }
});

 app.post("/api/metrics", async (req, res) => {
  const data = req.body;

  try {
    const pool = await poolPromise;

    const agentResult = await pool.request()
      .input("agent_uuid", sql.VarChar, data.agent_id)
      .query(`SELECT agent_id FROM agents WHERE agent_uuid = @agent_uuid
      `);

    if (!agentResult.recordset.length) {
      return res.status(404).json({ error: "Agent not registered" });
    }

    const agentId = agentResult.recordset[0].agent_id;

    await pool.request()
      .input("agent_id", sql.Int, agentId)
      .input("cpu_usage", sql.Float, data.cpu_usage)
      .input("ram_usage", sql.Float, data.ram_usage)
      .input("uptime_minutes", sql.BigInt, data.uptime_minutes)
      .query(`
        INSERT INTO system_metrics ( agent_id, cpu_usage, ram_usage, uptime_minutes)
        VALUES ( @agent_id, @cpu_usage, @ram_usage, @uptime_minutes)
      `);

    if (Array.isArray(data.disks)) {
      for (const disk of data.disks) {
        await pool.request()
          .input("agent_id", sql.Int, agentId)
          .input("mount", sql.VarChar, disk.mount)
          .input("disk_type", sql.VarChar, disk.type)
          .input("total_gb", sql.Float, disk.total_gb)
          .input("used_gb", sql.Float, disk.used_gb)
          .input("free_gb", sql.Float, disk.free_gb)
          .input("usage_percent", sql.Float, disk.usage_percent)
          .query(`
            INSERT INTO disk_metrics (agent_id, mount, disk_type, total_gb, used_gb, free_gb, usage_perce)
            VALUES (@agent_id,@mount,@disk_type,@total_gb,@used_gb,@free_gb,@usage_percent)
          `);
      }
    }

    await pool.request()
      .input("agent_id", sql.Int, agentId)
      .query(`
        UPDATE agents SET last_seen = GETDATE() WHERE agent_id = @agent_id
      `);

    res.json({ message: "Metrics stored successfully" });

  } catch (err) {
    console.error("Metrics error:", err);
    res.status(500).json({ error: "Metrics insert failed" });
  }
}); */

server.listen(8080, "0.0.0.0", () => {
  console.log("WebSocket + API server running on port 8080");
});
