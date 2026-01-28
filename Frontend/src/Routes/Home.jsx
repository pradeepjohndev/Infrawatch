import { CalendarDays } from "lucide-react";
import { useEffect, useState } from "react";
import { UsersRoundIcon, UserRoundCheckIcon, UserRoundXIcon } from 'lucide-react';
import RecentPCItem from "../Components/RecentPCItem";
import Devices from "../Dashboard/Device";
import { Link } from 'react-router-dom';

export default function Home({ ws }) {
    const date = new Date();
    const [pcs, setPcs] = useState([]);
    const [ready, setReady] = useState(false);
    
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    let monthname = null;
    const monthNames = ["January", "February", "March", "April", "May", "June","July", "August", "September", "October", "November", "December"];
    monthname = monthNames[month - 1];
    const day = date.getDate();

    const recentDevices = pcs.slice(-10).reverse();

    let today = `${day} ${monthname}, ${year}`;
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

            if (data.type === "DASHBOARD_UPDATE") {
                setPcs(data.payload);
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
            <div className="parent h-3/4 w-overflow-hidden m-4">
                <div className="div1 bg-amber-300"></div>
                <div className="div2 bg-linear-to-br from-blue-100 to-blue-400 rounded-2xl p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-400 rounded-xl">
                                <UsersRoundIcon className="w-8 h-8 text-blue-700" />
                            </div>
                            <h3 className="text-xl font-semibold text-blue-700">Total<br></br>Devices</h3>
                        </div>
                        <span className="text-5xl font-bold text-blue-900">{deviceCounts.total < 10 ? `0${deviceCounts.total}` : deviceCounts}</span>
                    </div>
                </div>

                <div className="div3 bg-linear-to-br from-green-100 to-green-400 rounded-2xl p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-green-400 rounded-xl">
                                <UserRoundCheckIcon className="w-8 h-8 text-green-700" />
                            </div>
                            <h3 className="text-xl font-semibold text-green-700">Online Devices</h3>
                        </div>
                        <span className="text-5xl font-bold text-green-900">{deviceCounts.online < 10 ? `0${deviceCounts.online}` : deviceCounts.online}</span>
                    </div>
                </div>

                <div className="div4 bg-linear-to-br from-red-100 to-red-400 rounded-2xl p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-red-400 rounded-xl">
                                <UserRoundXIcon className="w-8 h-8 text-red-700" />
                            </div>
                            <h3 className="text-xl font-semibold text-red-700">Offline Devices</h3>
                        </div>
                        <span className="text-5xl font-bold text-red-900">{deviceCounts.offline < 10 ? `0${deviceCounts.offline}` : deviceCounts.offline}</span>
                    </div>
                </div>

                <div className="div5 bg-linear-to-br from-amber-700 to-amber-800 rounded-2xl p-6 text-white">
                    <div className="flex justify-between mb-4">
                        <h3 className="text-xl font-bold">
                            Recently Added Devices<br></br>
                            <p className="text-white text-sm">Check all the devices</p>
                        </h3>
                        <Link to="/dashboard">
                            <button className="text-sm px-4 py-2 rounded-xl bg-white/20 hover:bg-white/10 hover:border ease-in-out text-white duration-300">View all</button>
                        </Link>
                    </div>

                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                        {recentDevices.length === 0 && (<p className="text-white/70 text-sm">No devices connected yet</p>)}
                        {recentDevices.map((pc) => (<RecentPCItem key={pc.pcId} pc={pc} />))}
                    </div>
                </div>

            </div>

        </>
    )
}