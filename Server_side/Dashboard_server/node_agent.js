import WebSocket from "ws";
import dotenv from "dotenv";
import si from "systeminformation";
dotenv.config();

const SERVER_URL = process.env.SERVER_URL || 'ws://localhost:8080';
console.log("Agent connecting to:", SERVER_URL);

//ws://localhost:8080 ws://192.168.1.50:8080 //ws://192.168.4.14:8080 //ws://192.168.4.14:8080

let PC_ID = "UNKNOWN-PC";
let socket;
let metricsInterval;
let heartbeatInterval;
let staticPayload;

const gb = bytes => (bytes / 1024 ** 3).toFixed(2) + " GB";
const percent = v => v.toFixed(1) + " %";

async function resolvePcId() {
  try {
    const oss = await si.osInfo();
    PC_ID = os.hostname || `PC-${Math.floor(Math.random() * 10000)}`;
  } catch {
    PC_ID = `PC-${Math.floor(Math.random() * 10000)}`;
  }
}
async function connect() {
  socket = new WebSocket(SERVER_URL);

  socket.onopen = async () => {
    console.log(" Agent connected:", PC_ID);

     if (!staticPayload) {
      staticPayload = await getStaticInfo();
    }

    socket.send(JSON.stringify({
      type: "REGISTER",
      pcId: PC_ID,
      payload: await staticPayload
    }));

    sendHeartbeat();
    startFastMetrics();
    heartbeatInterval = setInterval(sendHeartbeat, 5000);
  };

  socket.onclose = () => {
    console.log(" Disconnected. Reconnecting...");

    clearInterval(metricsInterval);
    clearInterval(heartbeatInterval);

    setTimeout(connect, 3000);
  };

  socket.onerror = err => {
    console.error("WebSocket error:", err);
  };
}

async function getStaticInfo() {
  const [system, cpu, os, memory] = await Promise.all([
      si.system(),
      si.cpu(),
      si.osInfo(),
      si.mem()
    ]);

  return {
    system: {
      manufacturer: system.manufacturer,
      model: system.model
    },
    cpu: {
      brand: cpu.brand,
      cores: cpu.cores
    },
    os: {
      distro: os.distro,
      arch: os.arch
    },
    memory: {
      total: gb(memory.total)
    }
  };
}

function startFastMetrics() {
  metricsInterval = setInterval(async () => {
    if (socket.readyState !== WebSocket.OPEN) return;

    try {
          const [load, memory, uptime, disks, nets, stats] = await Promise.all([
            si.currentLoad(),
            si.mem(),
            si.time(),
            si.fsSize(),
            si.networkInterfaces(),
            si.networkStats()
          ]);

      const netlog = stats[0];
      const downloadKB = (netlog.rx_sec / 1024).toFixed(2);
      const uploadKB = (netlog.tx_sec / 1024).toFixed(2);
      const net = nets.find(n => !n.internal && n.ip4);


      socket.send(JSON.stringify({
        type: "SYSTEM_STATS",
        pcId: PC_ID,
        payload: {
          timestamp: Date.now(),
          uptime: uptime.uptime,
          cpu: { load: Number(load.currentLoad.toFixed(2)) },
          memory: {
            used: memory.used,
            free: memory.free,
            total: memory.total
          },
          network: {
            ip: net?.ip4 || "N/A",
            mac: net?.mac || "N/A",
            iface: net?.iface || "N/A",
            Upload: uploadKB,
            download: downloadKB,
          },
          disks: disks.map(d => ({
            mount: d.mount,
            type: d.type || "Unknown",
            size: gb(d.size),
            used: gb(d.used),
            available: gb(d.available),
            usage: percent(d.use)
          }))
        }
      }));

    } catch (err) {
      console.error("Metric error:", err.message);
    }
  }, 1000);
}

function sendHeartbeat() {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({
      type: "HEARTBEAT",
      pcId: PC_ID
    }));
  }
}

(async () => {
  await resolvePcId();
  setTimeout(connect, 1000);
})();
