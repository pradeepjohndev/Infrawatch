import { useEffect, useMemo, useState } from "react";
import { CircleAlert, TriangleAlert } from "lucide-react";
import PCPanel from "../Dashboard/Pcpanel";
import { analyzeHealth } from "../utils/healthAnalyzer";
import Sidebar from "../Dashboard/Sidebar";

export default function Alerts({ now = 0, onAlertCountsChange }) {
    const [pcs, setPcs] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [severityFilter, setSeverityFilter] = useState("ALL");

    useEffect(() => {
        const socket = new WebSocket(`${window.location.protocol === "https:" ? "wss" : "ws"}://${window.location.host}/ws`);

        socket.onopen = () => {
            socket.send(JSON.stringify({
                type: "DASHBOARD_REGISTER",
                dashboardId: Date.now().toString(),
            }));
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

    const alertPcs = useMemo(() => {
        return pcs.map((pc) => ({ pc, ...analyzeHealth(pc) })).filter((item) => item.severity === "CRITICAL" || item.severity === "WARNING");
    }, [pcs]);

    const warningCount = useMemo(() => alertPcs.filter((item) => item.severity === "WARNING").length, [alertPcs]);
    const criticalCount = useMemo(() => alertPcs.filter((item) => item.severity === "CRITICAL").length, [alertPcs]);
    const alert_total = useMemo(
        () => alertPcs.filter((item) => item.severity === "WARNING" || item.severity === "CRITICAL").length,
        [alertPcs]
    );

    useEffect(() => {
        onAlertCountsChange?.({ total: alert_total });
    }, [alert_total, onAlertCountsChange]);

    const filteredAlertPcs = useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase();

        return alertPcs
            .filter((item) => {
                const matchesSearch = item.pc.pcId?.toLowerCase().includes(normalizedSearch);
                const matchesSeverity = severityFilter === "ALL" ? true : item.severity === severityFilter;
                return matchesSearch && matchesSeverity;
            })
            .sort((a, b) => {
                const severityScore = { CRITICAL: 2, WARNING: 1 };
                return severityScore[b.severity] - severityScore[a.severity];
            });
    }, [alertPcs, searchTerm, severityFilter]);

    return (
        <>
            <div className="text-white p-4 flex justify-between">
                <div>
                    <h1>Alerts</h1>
                    <span>View all critical and warning systems</span>
                </div>
                <div className="border rounded-4xl h-10 p-8 mt-2 bg-gray-700 flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <TriangleAlert className="w-6 h-6 text-yellow-400" />
                        <span>{`${warningCount} warning alerts`}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <CircleAlert className="w-6 h-6 text-red-400" />
                        <span>{`${criticalCount} critical alerts`}</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4 p-4 text-white w-full">
                <input type="text" placeholder="Search by PC ID" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-4 bg-gray-200 text-black px-2 py-2 rounded-md border focus:border-sky-500 focus:outline-none" />

                <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)} className="flex-1 px-2 py-2 bg-white rounded-md text-black font-medium border focus:border-sky-500">
                    <option value="ALL">All severities</option>
                    <option value="WARNING">Warning</option>
                    <option value="CRITICAL">Critical</option>
                </select>
            </div>

            <div className="status pl-5 text-white">
                {pcs.length === 0 && <p>Connecting...</p>}
                {pcs.length > 0 && alertPcs.length === 0 && <p>No warning or critical systems found.</p>}
                {alertPcs.length > 0 && filteredAlertPcs.length === 0 && <p>No matching systems found.</p>}
            </div>

            {filteredAlertPcs.map((item) => (
                <PCPanel key={item.pc.pcId} pc={item.pc} now={now} />
            ))}
        </>
    );
}





