import http from "http";
import dotenv from "dotenv";
import app from "./app.js";
import { initWebSocketServer } from "./services/realtimeService.js";

dotenv.config({ path: "../.env" });

const PORT = process.env.PORT || 8080;
const server = http.createServer(app);
initWebSocketServer(server);

server.listen(PORT, "0.0.0.0", () => {
    console.log(`WebSocket + API server running on port:${PORT}`);
});
