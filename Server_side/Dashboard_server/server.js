import express from "express";
import jwt from "jsonwebtoken";
import http from "http";
import WebSocket, { WebSocketServer } from "ws";
import cors from "cors";
import dotenv from "dotenv";
import { poolPromise, sql } from "../config/Database_connection.js";
import cookieParser from "cookie-parser";
import bcrypt from "bcrypt";
import { verifyToken } from "../middleware/verifyToken.js";
dotenv.config({ path: '../.env' });

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

app.use(cookieParser(), express.json());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.set("trust proxy", true);

app.get("/", (_, res) => {
  res.send("Server running");
});

app.post("/register", async (req, res) => {
  try {
    const pool = await poolPromise;
    const { username, password } = req.body;
    const hash = await bcrypt.hash(password, 10);

    const result = await pool.request()
      .input("username", sql.NVarChar, username).input("password", sql.NVarChar, hash).query(`INSERT INTO Users (Username, PasswordHash) VALUES (@username, @password)`);

    res.sendStatus(201);
  } catch (err) {
    console.error("register ERROR:", err);
    res.status(500).send("Login failed");
  }
});

app.post("/login", async (req, res) => {
  try {
    const pool = await poolPromise;
    const { username, password } = req.body;

    const result = await pool
      .request().input("username", sql.NVarChar, username).query("SELECT * FROM Users WHERE Username = @username");

    const user = result.recordset[0];
    if (!user) return res.status(401).send("Invalid credentials");

    const valid = await bcrypt.compare(password, user.PasswordHash);
    if (!valid) return res.status(401).send("Invalid credentials");

    const token = jwt.sign(
      { id: user.UserId, username: user.Username },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    res.sendStatus(200);

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).send("Login failed");
  }
});

app.get("/auth-check", verifyToken, (req, res) => {
  return res.json({ user: req.user });
});

app.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
  });
  res.sendStatus(200);
});

app.get("/dashboard-data", verifyToken, (req, res) => {
  res.json({ message: "Secure dashboard data", user: req.user });
});

app.get("/api/health", (_, res) => {
  res.json({ status: "ok" });
});


app.post("/api/agent/register", async (req, res) => {
  const data = req.body;

  try {
    const pool = await poolPromise;

    const result = await pool.request()
      .input("pc_id", sql.VarChar, data.pc_id)
      .input("hostname", sql.VarChar, data.hostname)
      .input("ip_address", sql.VarChar, data.ip_address || null)
      .query(`
        MERGE dbo.devices AS target
        USING (SELECT @pc_id AS pc_id) AS source
        ON target.pc_id = source.pc_id

        WHEN MATCHED THEN
          UPDATE SET
            hostname = @hostname,
            ip_address = @ip_address,
            last_seen = GETDATE(),
            status = 'ONLINE',
            updated_at = GETDATE()

        WHEN NOT MATCHED THEN
          INSERT (pc_id, hostname, ip_address, status, last_seen)
          VALUES (@pc_id, @hostname, @ip_address, 'ONLINE', GETDATE())

        OUTPUT INSERTED.id;
      `);

    const deviceId = result.recordset[0].id;

    await pool.request()
      .input("device_id", sql.BigInt, deviceId)
      .input("manufacturer", sql.VarChar, data.manufacturer)
      .input("model", sql.VarChar, data.model)
      .input("cpu_brand", sql.VarChar, data.cpu_brand)
      .input("cpu_cores", sql.Int, data.cpu_cores)
      .input("os_distro", sql.VarChar, data.os_distro)
      .input("os_arch", sql.VarChar, data.os_arch)
      .input("total_memory_gb", sql.Decimal(10, 2), data.total_memory_gb)
      .query(`
        IF NOT EXISTS (
          SELECT 1 FROM dbo.device_static_info WHERE device_id = @device_id
        )
        INSERT INTO dbo.device_static_info
        (device_id, manufacturer, model, cpu_brand, cpu_cores, os_distro, os_arch, total_memory_gb)
        VALUES
        (@device_id, @manufacturer, @model, @cpu_brand, @cpu_cores, @os_distro, @os_arch, @total_memory_gb)
      `);

    res.json({ message: "Device registered successfully" });

  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Registration failed" });
  }
});
app.post("/api/metrics", async (req, res) => {
  const data = req.body;

  try {
    const pool = await poolPromise;

    const deviceResult = await pool.request()
      .input("pc_id", sql.VarChar, data.pc_id)
      .query(`
        SELECT id FROM dbo.devices WHERE pc_id = @pc_id
      `);

    if (!deviceResult.recordset.length) {
      return res.status(404).json({ error: "Device not registered" });
    }

    const deviceId = deviceResult.recordset[0].id;

    await pool.request()
      .input("device_id", sql.BigInt, deviceId)
      .input("cpu_load", sql.Decimal(5, 2), data.cpu_load)
      .input("memory_used", sql.BigInt, data.memory_used)
      .input("memory_free", sql.BigInt, data.memory_free)
      .input("memory_total", sql.BigInt, data.memory_total)
      .input("uptime", sql.BigInt, Math.floor(data.uptime))
      .input("upload_kbps", sql.Decimal(10, 2), data.upload_kbps || 0)
      .input("download_kbps", sql.Decimal(10, 2), data.download_kbps || 0)
      .query(`
        INSERT INTO dbo.device_metrics
        (device_id, cpu_load, memory_used, memory_free, memory_total, uptime, upload_kbps, download_kbps)
        VALUES
        (@device_id, @cpu_load, @memory_used, @memory_free, @memory_total, @uptime, @upload_kbps, @download_kbps)
      `);

    if (Array.isArray(data.disks) && data.disks.length) {

      const diskTable = new sql.Table("dbo.device_disks");
      diskTable.create = false;

      diskTable.columns.add("device_id", sql.BigInt, { nullable: false });
      diskTable.columns.add("mount_point", sql.VarChar(255), { nullable: true });
      diskTable.columns.add("disk_type", sql.VarChar(50), { nullable: true });
      diskTable.columns.add("total_gb", sql.Decimal(10, 2), { nullable: true });
      diskTable.columns.add("used_gb", sql.Decimal(10, 2), { nullable: true });
      diskTable.columns.add("available_gb", sql.Decimal(10, 2), { nullable: true });
      diskTable.columns.add("usage_percent", sql.Decimal(5, 2), { nullable: true });

      data.disks.forEach(d => {
        diskTable.rows.add(
          deviceId,
          String(d.mount || ""),
          String(d.type || "Unknown"),
          Number(d.total_gb) || 0,
          Number(d.used_gb) || 0,
          Number(d.available_gb) || 0,
          Number(d.usage_percent) || 0
        );
      });
      console.log("DISK SAMPLE:", data.disks[0]);
      await pool.request().bulk(diskTable);
    }
    console.log("DISKS FROM AGENT:", data.disks);

    await pool.request()
      .input("device_id", sql.BigInt, deviceId)
      .query(`
        UPDATE dbo.devices
        SET last_seen = GETDATE(),
            status = 'ONLINE',
            updated_at = GETDATE()
        WHERE id = @device_id
      `);

    res.json({ message: "Metrics stored successfully" });

  } catch (err) {
    console.error("Metrics error FULL:", err);
    res.status(500).json({
      error: err.message,
      sql: err.originalError?.info?.message
    });
  }
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

server.listen(8080, '0.0.0.0', () => {
  console.log("WebSocket + API server running on port 8080");
});
