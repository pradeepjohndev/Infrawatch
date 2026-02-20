import { useEffect, useState, useMemo } from "react";
import Devices from "../Components/Device";
import PCPanel from "./Pcpanel";
import { useLocation } from "react-router-dom";
import { Computer, Server } from "lucide-react"

const getPcType = (pc) => {
  const rawType = pc?.variable ?? pc?.staticInfo?.variable ?? pc?.staticInfo?.system?.variable;
  if (typeof rawType === "string") {
    const normalized = rawType.trim().toLowerCase();
    if (normalized === "server" || normalized === "system") return normalized;
  }

  const os = pc?.staticInfo?.os?.distro ?? "";
  return os.toLowerCase().includes("server") ? "server" : "system";
};

export default function Dashboard({ clock, now }) {
  const [pcs, setPcs] = useState([]);
  const [ws, setWs] = useState(null);
  const [ready, setReady] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortOrder, setSortOrder] = useState("ONLINE_FIRST");
  const location = useLocation();
  const [viewMode, setViewMode] = useState(location.state?.viewMode || "ALL");

  useEffect(() => {
    const socket = new WebSocket(`ws://localhost:8080/ws`);
    // const socket = new WebSocket(`${window.location.protocol === "https:" ? "wss" : "ws"}://${window.location.host}/ws`);

    socket.onopen = () => {
      socket.send(JSON.stringify({
        type: "DASHBOARD_REGISTER",
        dashboardId: Date.now().toString(),
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

  const filteredAndSortedPcs = useMemo(() => {
    let result = pcs.filter((pc) => {
      const matchesSearch = pc.pcId
        .toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === "ALL" ? true : statusFilter === "ONLINE" ? pc.online === true : pc.online === false;
      const pcType = getPcType(pc);
      const matchesServer =
        viewMode === "ALL"
          ? true
          : viewMode === "SERVER"
            ? pcType === "server"
            : pcType === "system";
      return matchesSearch && matchesStatus && matchesServer;
    });

    result.sort((a, b) => {
      if (sortOrder === "ONLINE_FIRST") {
        return Number(b.online) - Number(a.online);
      } else {
        return Number(a.online) - Number(b.online);
      }
    });

    return result;
  }, [pcs, searchTerm, statusFilter, sortOrder, viewMode]);

  return (
    <div>
      <div className="flex-1 overflow-y-auto">
        <div className="header">
          <div className="side_left">
            <h1>IT Asset Monitoring</h1>
            <div className="time">Current Time: {clock}</div>
          </div>
          <div className="side">
            {ready && ws && <Devices ws={ws} />}
          </div>
        </div>
        <div className="flex gap-4 p-4">
          <input type="text" placeholder="Search by PC ID or Hostname" value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 p-2 rounded border focus:border-sky-500 focus:outline-2 focus:outline-blue-500 bg-gray-200 hover:cursor-type" />

          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="p-2 rounded border focus:border-sky-500 focus:outline-2 focus:outline-blue-700 bg-gray-200 hover:cursor-pointer">
            <option value="ALL">All</option>
            <option value="ONLINE" className="bg-green-200">Online</option>
            <option value="OFFLINE" className="bg-red-200">Offline</option>
          </select>

          <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="p-2 rounded border focus:border-sky-500 focus:outline-2 focus:outline-blue-500 bg-gray-200 hover:cursor-pointer">
            <option value="ONLINE_FIRST">Online first</option>
            <option value="OFFLINE_FIRST">Offline first</option>
          </select>

          <button onClick={() => setViewMode("ALL")} className={`p-2 rounded border flex gap-1 hover:cursor-pointer 
            ${viewMode === "ALL" ? "bg-blue-500 text-white border-blue-500" : "bg-gray-50 hover:bg-gray-200"}`}>
            <Computer />All System
          </button>

          <button onClick={() => setViewMode("SERVER")} className={`p-2 rounded border flex gap-1 hover:cursor-pointer
            ${viewMode === "SERVER" ? "bg-blue-500 text-white border-blue-500" : "bg-gray-50 hover:bg-gray-200"}`}>
            <Server />Server
          </button>

          <button onClick={() => setViewMode("SYSTEM")} className={`p-2 rounded border flex gap-1 hover:cursor-pointer
              ${viewMode === "SYSTEM" ? "bg-blue-500 text-white border-blue-500" : "bg-gray-50 hover:bg-gray-200"}`}>
            <Computer />System
          </button>
        </div>

        <div className="status pl-5 text-white">
          {pcs.length === 0 && <p>Connecting...</p>}
          {pcs.length > 0 && filteredAndSortedPcs.length === 0 && (<p>No devices found</p>)}
        </div>

        {filteredAndSortedPcs.map((pc) => (<PCPanel key={pc.pcId} pc={pc} now={now} />))}
      </div>
    </div>
  );
}
