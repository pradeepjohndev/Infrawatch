import { useEffect, useState } from "react";
import Devices from "./Device";
import PCPanel from "./Pcpanel";
import Sidebar from "./Sidebar";

export default function Dashboard() {
  const [pcs, setPcs] = useState([]);
  const [time, setTime] = useState("");
  const [now, setNow] = useState(() => Date.now());
  const [ws, setWs] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080");

    socket.onopen = () => {
      socket.send(JSON.stringify({
        type: "DASHBOARD_REGISTER",
        dashboardId: crypto.randomUUID()
      }));
      setWs(socket);
      setReady(true);
    };

    socket.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === "DASHBOARD_UPDATE") {
        setPcs(data.payload);
      }
    };

    socket.onerror = () => console.error("WebSocket error");
    return () => socket.close();
  }, []);

  return (
    <div>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 overflow-y-auto">
          <div className="header">
            <div className="side_left">
              <h1>IT Asset Monitoring</h1>
              <div className="time">Current Time: {time}</div>
            </div>
            <div className="side">
              {ready && ws && <Devices ws={ws} />}
            </div>
          </div>

          {pcs.length === 0 && <p>Connecting...</p>}

          {pcs.map(pc => (
            <PCPanel key={pc.pcId} pc={pc} now={now} />
          ))}
        </div>
      </div>
    </div>
  );
}
