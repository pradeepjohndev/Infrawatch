import { useEffect, useState } from "react";
import { UsersRoundIcon, UserRoundCheckIcon, UserRoundXIcon } from 'lucide-react';

export default function Devices({ ws }) {
    const [total, setTotal] = useState(0);
    const [online, setOnline] = useState(0);
    const [offline, setOffline] = useState(0);

    useEffect(() => {
        if (!ws) return;

        const handleMessage = (e) => {
            const data = JSON.parse(e.data);

            if (data.type === "COUNTS_UPDATE") {
                setTotal(data.payload.totalDevices);
                setOnline(data.payload.onlineDevices);
                setOffline(data.payload.offlineDevices);
            }
        };

        ws.addEventListener("message", handleMessage);

        return () => {
            ws.removeEventListener("message", handleMessage);
        };
    }, [ws]);

    return (
        <div className="devices flex gap-5 border border-white p-2 rounded-lg text-white">
            <p><UsersRoundIcon />Total Devices: {total}</p>
            <p style={{ color: "#c7ffbf" }}><UserRoundCheckIcon /> Online: {online}</p>
            <p style={{ color: "#ffc3c7" }}><UserRoundXIcon /> Offline: {offline}</p>
        </div>
    );
}
