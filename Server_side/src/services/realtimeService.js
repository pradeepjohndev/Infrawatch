import WebSocket, { WebSocketServer } from "ws";

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

function sendCounts() {
    const totalDevices = pcs.size;
    const onlineDevices = [...pcs.values()].filter((p) => p.online).length;
    const offlineDevices = totalDevices - onlineDevices;
    const serverDevices = [...pcs.values()].filter((p) => getPcType(p) === "server").length;

    const msg = JSON.stringify({
        type: "COUNTS_UPDATE",
        payload: {
            totalDevices,
            onlineDevices,
            offlineDevices,
            serverDevices,
        },
    });

    dashboards.forEach((ws) => {
        if (ws.readyState === WebSocket.OPEN) ws.send(msg);
    });
}

function sendDashboardData() {
    const payload = [...pcs.values()];
    const msg = JSON.stringify({
        type: "DASHBOARD_UPDATE",
        payload,
    });

    dashboards.forEach((ws) => {
        if (ws.readyState === WebSocket.OPEN) ws.send(msg);
    });
}

function handleWebSocketMessage(ws, msg) {
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
            stats: null,
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
}

function initHeartbeat() {
    setInterval(() => {
        const now = Date.now();
        let changed = false;

        pcs.forEach((pc) => {
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
}

export function initWebSocketServer(server) {
    const wss = new WebSocketServer({ server, path: "/ws" });

    wss.on("connection", (ws) => {
        ws.isDashboard = false;

        ws.on("message", (msg) => handleWebSocketMessage(ws, msg));

        ws.on("close", () => {
            if (ws.isDashboard) {
                dashboards.delete(ws);
                console.log("Dashboard disconnected");
            }
        });
    });

    initHeartbeat();
}
