import express from "express";
import http from "http";
import WebSocket, { WebSocketServer } from "ws";

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.set("trust proxy", true);

const pcs = new Map();        
const dashboards = new Set(); 
  
app.get("/", (_, res) => {
  res.send(" Server running");
});

app.get("/api/health", (req, res) => {
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

      console.log(" Dashboard connected");

      sendCounts();
      sendDashboardData();
      return;
    }

    if (data.type === "REGISTER") {
      console.log(" Device registered:", data.pcId);

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

  const msg = JSON.stringify({
    type: "COUNTS_UPDATE",
    payload: {
      totalDevices,
      onlineDevices,
      offlineDevices
    }
  });

  dashboards.forEach(ws => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(msg);
    }
  });
}

function sendDashboardData() {
  const payload = [...pcs.values()];

  const msg = JSON.stringify({
    type: "DASHBOARD_UPDATE",
    payload
  });

  dashboards.forEach(ws => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(msg);
    }
  });
}

server.listen(8080, () => {
  console.log(" WebSocket server running on port 8080");
});