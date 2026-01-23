import express from "express";
import http from "http";
import WebSocket, { WebSocketServer } from "ws";
import cors from "cors";
import dotenv from "dotenv";

import { poolPromise, sql } from "../DB_server/DB_conn/Database_connection.js"; // ✅ your existing DB file

dotenv.config();

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.set("trust proxy", true);
app.use(cors());
app.use(express.json()); // ✅ REQUIRED for DB APIs

/* ================= IN-MEMORY STATE ================= */
const pcs = new Map();
const dashboards = new Set();
/* =================================================== */

/* ================= BASIC ROUTES ================= */
app.get("/", (_, res) => {
  res.send("Server running");
});

app.get("/api/health", (_, res) => {
  res.json({ status: "ok" });
});
/* ================================================= */

/* ================= WEBSOCKET (UNCHANGED) ================= */
wss.on("connection", (ws) => {
  ws.isDashboard = false;

  ws.on("message", (msg) => {
    let data;
    try {
      data = JSON.parse(msg.toString());
    } catch {
      return;
    }

    /* -------- DASHBOARD -------- */
    if (data.type === "DASHBOARD_REGISTER") {
      ws.isDashboard = true;
      dashboards.add(ws);

      console.log("Dashboard connected");
      sendCounts();
      sendDashboardData();
      return;
    }

    /* -------- AGENT REGISTER -------- */
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

    /* -------- LIVE METRICS -------- */
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

    /* -------- HEARTBEAT -------- */
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
/* ======================================================== */

/* ================= OFFLINE CHECK (UNCHANGED) ================= */
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
/* ============================================================ */

/* ================= DASHBOARD HELPERS (UNCHANGED) ================= */
function sendCounts() {
  const totalDevices = pcs.size;
  const onlineDevices = [...pcs.values()].filter(p => p.online).length;
  const offlineDevices = totalDevices - onlineDevices;

  const msg = JSON.stringify({
    type: "COUNTS_UPDATE",
    payload: { totalDevices, onlineDevices, offlineDevices }
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
/* ================================================================= */

/* ================= DB API: REGISTER AGENT ================= */
app.post("/api/agent/register", async (req, res) => {
  const data = req.body;

  try {
    const pool = await poolPromise;

    /* ======================================================
       1. INSERT AGENT (identity only)
    ====================================================== */
    await pool.request()
      .input("agent_uuid", sql.VarChar, data.agent_id)
      .input("hostname", sql.VarChar, data.hostname)
      .query(`
        IF NOT EXISTS (SELECT 1 FROM agents WHERE agent_uuid = @agent_uuid)
        INSERT INTO agents (agent_uuid, hostname)
        VALUES (@agent_uuid, @hostname)
      `);

    /* ======================================================
       2. FETCH agent_id
    ====================================================== */
    const agentResult = await pool.request()
      .input("agent_uuid", sql.VarChar, data.agent_id)
      .query(`
        SELECT agent_id 
        FROM agents 
        WHERE agent_uuid = @agent_uuid
      `);

    const agentId = agentResult.recordset[0].agent_id;

    /* ======================================================
       3. INSERT STATIC INFO (ONLY ONCE)
    ====================================================== */
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
        IF NOT EXISTS (
          SELECT 1 FROM system_static_info WHERE agent_id = @agent_id
        )
        INSERT INTO system_static_info (
          agent_id,
          os,
          architecture,
          cpu_model,
          cpu_cores,
          total_ram_gb,
          manufacturer,
          model
        )
        VALUES (
          @agent_id,
          @os,
          @architecture,
          @cpu_model,
          @cpu_cores,
          @total_ram_gb,
          @manufacturer,
          @model
        )
      `);

    /* ======================================================
       4. UPDATE last_seen
    ====================================================== */
    await pool.request()
      .input("agent_id", sql.Int, agentId)
      .query(`
        UPDATE agents
        SET last_seen = GETDATE()
        WHERE agent_id = @agent_id
      `);

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

    const agent = await pool.request()
      .input("agent_uuid", sql.VarChar, data.agent_id)
      .query("SELECT agent_id FROM agents WHERE agent_uuid = @agent_uuid");

    if (!agent.recordset.length) {
      return res.status(404).json({ error: "Agent not registered" });
    }

    const agentId = agent.recordset[0].agent_id;

    await pool.request()
      .input("agent_id", sql.Int, agentId)
      .input("cpu_usage", sql.Float, data.cpu_usage)
      .input("ram_usage", sql.Float, data.ram_usage)
      .input("uptime_minutes", sql.BigInt, data.uptime_minutes)
      .query(`
        INSERT INTO system_metrics (
          agent_id, cpu_usage, ram_usage, uptime_minutes
        )
        VALUES (
          @agent_id, @cpu_usage, @ram_usage, @uptime_minutes
        )
      `);

    await pool.request()
      .input("agent_id", sql.Int, agentId)
      .query("UPDATE agents SET last_seen = GETDATE() WHERE agent_id = @agent_id");

    res.json({ message: "Metrics stored" });
  } catch (err) {
    console.error("Metrics error:", err);
    res.status(500).json({ error: "Metrics insert failed" });
  }
});

server.listen(8080, () => {
  console.log("WebSocket + API server running on port 8080");
});
