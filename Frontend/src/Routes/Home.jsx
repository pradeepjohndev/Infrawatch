import { CalendarDays } from "lucide-react";
import { useEffect, useState } from "react";
import { UsersRoundIcon, UserRoundCheckIcon, UserRoundXIcon, CircleAlert, TriangleAlert, ArrowBigRightDash } from 'lucide-react';
import RecentPCItem from "../utils/RecentPCItem.jsx";
import { Link, useNavigate } from 'react-router-dom';
import { analyzeHealth } from "../utils/healthAnalyzer";

export default function Home({ ws, today }) {
    const navigate = useNavigate();
    const [pcs, setPcs] = useState([]);
    const [ready, setReady] = useState(false);
    const recentDevices = pcs.slice(-10).reverse();

    const alerts = pcs.map(pc => ({ pcId: pc.pcId, ...analyzeHealth(pc) })).filter(a => a.severity !== "NORMAL");
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
                    <span>Track all your system's in one single place.</span>
                </div>
                <div className="border rounded-4xl h-10 mt-8 p-8 bg-gray-700 flex items-center">
                    <span className="text-white font-bold bg-gray-900 h-10 w-10 rounded-4xl flex items-center justify-center"><CalendarDays /></span>
                    <span className="inline-block text-white ml-2">{today}</span>
                </div>
            </div>
            <div className="parent h-3/4 w-overflow-hidden m-4">
                <div className="div1 bg-slate-500/90 rounded-2xl p-6 text-white">
                    <div className="flex justify-between mb-4">
                        <h3 className="text-xl font-bold">
                            Alerts<br></br>
                            <p className="text-white text-sm">Action required for the following systems</p>
                        </h3>
                        <Link to="/alerts">
                            <button className="text-sm px-4 py-2 rounded-xl bg-white/20 hover:bg-white/10 hover:border ease-in-out text-white duration-300">View all</button>
                        </Link>
                    </div>
                    <div className="space-y-2 max-h-70 overflow-y-auto scrollbar-color-blue-200 pr-1">
                        {alerts.length === 0 && (
                            <p className="text-white/70 text-sm">
                                No alerts at the moment. All systems are running smoothly!
                            </p>
                        )}

                        {alerts.map(alert => {
                            const isCritical = alert.severity?.trim().toUpperCase() === "CRITICAL";
                            const severityStyles = isCritical
                                ? {
                                    bg: "bg-red-400/70",
                                    icon: <CircleAlert className="w-6 h-6 text-red-900" />,
                                }
                                : {
                                    bg: "bg-yellow-400/70",
                                    icon: <TriangleAlert className="w-6 h-6 text-yellow-900" />,
                                };

                            return (
                                <div>
                                    <div key={alert.pcId}
                                        className={`cursor-pointer flex items-center justify-between gap-3 mb-2 rounded-2xl p-3 transition hover:border-black/30 
                            ${severityStyles.bg}`}>
                                        <div className="flex items-center gap-3">
                                            {severityStyles.icon}
                                            <div className="flex flex-row items-baseline gap-2 ">
                                                <span className="font-medium text-white">{alert.pcId}</span>
                                                <span className="text-xs text-black/70">{alert.issues.join(", ")}</span>
                                            </div>
                                        </div>

                                        <button onClick={() => navigate(`/dashboard#pc-${alert.pcId}`)}
                                            className="flex items-center justify-center rounded-xl bg-white/20 px-6 py-2 text-white transition hover:bg-white/30 hover:border duration-200 ease-in-out" aria-label={`View ${alert.pcId}`}>
                                            <ArrowBigRightDash className="w-5 h-5" />
                                        </button>
                                    </div>

                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="div2 bg-linear-to-br from-blue-100 to-blue-400  hover:from-blue-200 hover:to-blue-500 rounded-2xl p-6 duration-300 transition ease-in-out hover:scale-105">
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

                <div className="div3 bg-linear-to-br from-green-100 to-green-400  hover:from-green-200 hover:to-green-500 rounded-2xl p-6 duration-300 transition ease-in-out hover:scale-105">
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

                <div className="div4 bg-linear-to-br from-red-100 to-red-400 rounded-2xl p-6 hover:from-red-200 hover:to-red-500 duration-300 transition ease-in-out hover:scale-105">
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
                            Recently Connected Device's<br></br>
                            <p className="text-white text-sm">Check all the devices</p>
                        </h3>
                        <Link to="/dashboard">
                            <button className="text-sm px-4 py-2 rounded-xl bg-white/20 hover:bg-white/10 hover:border ease-in-out text-white duration-300">View all</button>
                        </Link>
                    </div>

                    <div className="space-y-2 max-h-98 overflow-y-auto scrollbar-color-blue-200 pr-1">
                        {recentDevices.length === 0 && (<p className="text-white/70 text-sm">No devices connected yet...</p>)}
                        {recentDevices.map((pc) => (<RecentPCItem key={pc.pcId} pc={pc} />))}
                    </div>
                </div>
            </div>

        </>
    )
}