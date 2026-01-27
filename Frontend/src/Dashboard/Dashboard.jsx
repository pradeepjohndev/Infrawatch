import { useEffect, useState, useMemo } from "react";
import Devices from "./Device";
import PCPanel from "./Pcpanel";

export default function Dashboard() {
  const [pcs, setPcs] = useState([]);
  const [time, setTime] = useState("");
  const [now, setNow] = useState(() => Date.now());
  const [ws, setWs] = useState(null);
  const [ready, setReady] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortOrder, setSortOrder] = useState("ONLINE_FIRST");

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

   const filteredAndSortedPcs = useMemo(() => {
    let result = pcs.filter((pc) => {
      const matchesSearch = pc.pcId || pc.ip || pc.hostname
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === "ALL" ? true : statusFilter === "ONLINE" ? pc.online === true : pc.online === false;
      return matchesSearch && matchesStatus;
    });

    result.sort((a, b) => {
      if (sortOrder === "ONLINE_FIRST") {
        return Number(b.online) - Number(a.online);
      } else {
        return Number(a.online) - Number(b.online);
      }
    });

    return result;
  }, [pcs, searchTerm, statusFilter, sortOrder]);

  return (
    <div>
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
        <div className="flex gap-4 p-4">
          <input type="text" placeholder="Search by PC ID or Hostname" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="flex-1 p-2 rounded border focus:border-sky-500 focus:outline-2 focus:outline-blue-500 bg-gray-200" />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="p-2 rounded border focus:border-sky-500 focus:outline-2 focus:outline-blue-700 bg-gray-200">
            <option value="ALL">All</option>
            <option value="ONLINE" className="bg-green-200">Online</option>
            <option value="OFFLINE" className="bg-red-200">Offline</option>
          </select>

          <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="p-2 rounded border focus:border-sky-500 focus:outline-2 focus:outline-blue-500 bg-gray-200 ">
            <option value="ONLINE_FIRST">Online first</option>
            <option value="OFFLINE_FIRST">Offline first</option>
          </select>
        </div>

        <div className="status pl-5 text-white">
          {pcs.length === 0 && <p>Connecting...</p>}
          {pcs.length > 0 && filteredAndSortedPcs.length === 0 && (<p>No devices found</p>)}
        </div>

        {filteredAndSortedPcs.map((pc) => ( <PCPanel key={pc.pcId} pc={pc} now={now} />))}
      </div>
    </div>
  );
}
