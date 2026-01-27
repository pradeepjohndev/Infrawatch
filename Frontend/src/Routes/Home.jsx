import { CalendarDays } from "lucide-react";
import { useEffect, useState } from "react";

export default function Home({ ws }) {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    let monthname = null;
    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];
    monthname = monthNames[month - 1];

    const day = date.getDate();
    let today = `${day} ${monthname}, ${year}`;
    const [ready, setReady] = useState(false);
    const [deviceCounts, setDeviceCounts] = useState({
        total: 0,
        online: 0,
        offline: 0,
    });

    useEffect(() => {
        const socket = new WebSocket("ws://localhost:8080");

        socket.onopen = () => {
            socket.send(JSON.stringify({
                type: "DASHBOARD_REGISTER",
                dashboardId: crypto.randomUUID()
            }));
            setReady(true);
        };

        socket.onmessage = (e) => {
            const data = JSON.parse(e.data);

            if (data.type === "COUNTS_UPDATE") {
                setDeviceCounts({
                    total: data.payload.totalDevices ?? 0,
                    online: data.payload.onlineDevices ?? 0,
                    offline: data.payload.offlineDevices ?? 0,
                });
            }
        };

        socket.onerror = () => console.error("WebSocket error");

        return () => socket.close();
    }, []);


    return (
        <>
            {ready && ws && <Device counts={deviceCounts} />}
            <div className="flex justify-between text-white ">
                <div className="m-5">
                    <h1>Hello user!</h1>
                    <span>Track all your system in one single place.</span>
                </div>
                <div className="border rounded-4xl h-10 mt-8 p-8 bg-gray-700 flex items-center">
                    <span className="text-white font-bold bg-gray-900 h-10 w-10 rounded-4xl flex items-center justify-center"><CalendarDays /></span>
                    <span className="inline-block text-white ml-2">{today}</span>
                </div>
            </div>
            <div className="parent h-screen w-overflow-hidden m-2">
                <div className="div1 bg-amber-300"></div>
                <div className="div2 bg-amber-400"><p>Total: {deviceCounts.total}</p></div>
                <div className="div3 bg-amber-500"><p>Online: {deviceCounts.online}</p></div>
                <div className="div4 bg-amber-700"><p>Offline: {deviceCounts.offline}</p></div>
                <div className="div5 bg-amber-800"></div>
            </div>

        </>
    )
}