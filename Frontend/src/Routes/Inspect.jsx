import React, { useState } from "react";
import axios from "axios";
import { Calendar, Clock } from "lucide-react";
import Pcpanel from "../Dashboard/Pcpanel";

export default function Inspect({ today, clock }) {

    const [search, setSearch] = useState("");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");

    const [pcData, setPcData] = useState(null);
    const [history, setHistory] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSearch = async () => {

        if (!search.trim()) {
            setError("Please enter PC ID or Hostname");
            return;
        }

        try {
            setLoading(true);
            setError("");
            setPcData(null);
            setHistory([]);
            setCurrentIndex(0);
            // ${window.location.host} localhost:8080
            const res = await axios.get(`http://${window.location.host}/api/inspect`, { params: { search, date, time } });
            const data = res.data;
            console.log("Inspect API Response:", res.data);

            if (!data || !data.statsHistory) {
                setError("No history data available");
                return;
            }

            if (data.statsHistory.length === 0) {
                setError("No records found for selected date");
                return;
            }
            setPcData(data);
            setHistory(data.statsHistory);
            console.log("History length:", data.statsHistory.length);
            setCurrentIndex(data.statsHistory.length - 1);

        } catch (err) {
            console.error(err);
            if (err.response?.status === 404) {
                setError("Device not found");
            } else {
                setError("Failed to fetch device data");
            }
        } finally {
            setLoading(false);
        }
    };

    const currentSnapshot = history.length > 0 && history[currentIndex] ? history[currentIndex] : null;
    const currentPc = pcData && currentSnapshot ? { ...pcData, stats: currentSnapshot } : null;
    const currentTimestamp = currentSnapshot?.timestamp ? new Date(currentSnapshot.timestamp) : null;
    const sliderPercentage = history.length > 1 ? (currentIndex / (history.length - 1)) * 100 : 0;

    return (
        <>
            <div className="text-white p-4 flex justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Inspect</h1>
                    <span className="text-sm text-gray-300">
                        Look into your device's historical information
                    </span>
                </div>

                <div className="border rounded-4xl h-10 p-8 mt-2 bg-gray-700 flex items-center gap-2">
                    <Calendar /> {today}
                    <Clock /> {clock}
                </div>
            </div>

            <div className="flex items-center gap-4 p-4 text-white w-full">

                <input type="text" placeholder="Search by PC ID or Hostname" value={search}
                    onChange={(e) => setSearch(e.target.value)} className="flex-1 bg-gray-200 text-black px-3 py-2 rounded-md border focus:border-sky-500 focus:outline-none" />

                <input type="date" value={date} max={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setDate(e.target.value)} className="flex-1 bg-gray-200 text-black px-3 py-2 rounded-md border focus:border-sky-500 focus:outline-none hover:cursor-pointer" />

                <input type="time" value={time}
                    onChange={(e) => setTime(e.target.value)} className="flex-1 bg-gray-200 text-black px-3 py-2 rounded-md border focus:border-sky-500 focus:outline-none hover:cursor-pointer" />

                <button onClick={handleSearch} className="px-6 py-2 bg-blue-500 hover:bg-blue-600 rounded-md text-white font-medium hover:cursor-pointer">
                    View Report
                </button>
            </div>

            {loading && (
                <div className="text-center text-white mt-4">
                    Loading device information...
                </div>
            )}

            {error && (
                <div className="text-center text-red-500 mt-4">
                    {error}
                </div>
            )}

            {history.length > 0 && currentSnapshot && (
                <div className="px-8 mt-6 text-white relative">

                    <div className="mb-2 text-sm text-gray-400">
                        Timeline (Slide to inspect history)
                    </div>

                    <div className="relative">
                        <input type="range" min="0" max={history.length - 1} value={currentIndex} onChange={(e) => setCurrentIndex(Number(e.target.value))} className="w-full" />
                        {currentTimestamp && (
                            <div
                                className="absolute -top-10 bg-gray-800 px-3 py-1 rounded text-xs shadow-lg"
                                style={{ left: `${sliderPercentage}%`, transform: "translateX(-50%)" }}>
                                {currentTimestamp.toLocaleString()}
                            </div>
                        )}
                    </div>

                    <div className="flex justify-between text-xs text-gray-400 mt-2">
                        <span>
                            {new Date(pcData.firstSeen).toLocaleString()}
                        </span>
                        <span>
                            {new Date(history[history.length - 1]?.timestamp).toLocaleString()}
                        </span>
                    </div>
                </div>
            )}

            {currentPc && (
                <div className="mt-6">
                    <Pcpanel pc={currentPc} now={Date.now()} />
                </div>
            )}
        </>
    );
}