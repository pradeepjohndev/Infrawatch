import { useEffect, useState } from "react";

export function useDashboardSocket(url = `ws://${window.location.host}/ws`) {
  const [ws, setWs] = useState(null);
  const [ready, setReady] = useState(false);

  const [pcs, setPcs] = useState([]);
  const [counts, setCounts] = useState({
    total: 0,
    online: 0,
    offline: 0,
  });

  useEffect(() => {
    const socket = new WebSocket(url);

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

      if (data.type === "COUNTS_UPDATE") {
        setCounts({
          total: data.payload.totalDevices ?? 0,
          online: data.payload.onlineDevices ?? 0,
          offline: data.payload.offlineDevices ?? 0,
        });
      }
    };

    socket.onerror = () => console.error("WebSocket error");

    return () => socket.close();
  }, [url]);

  return {
    ws,
    ready,
    pcs,
    counts,
  };
}
