import { useState } from "react";
import { Collapse } from "react-collapse";
import DiskDonut from "../Components/Diskdonut";
import Netlog from "../Components/Netlog";
import Cpuload from "../Components/Cpuload";
import RAMStackedBar from "../Components/RAMStackedBar";
import { GoDotFill } from "react-icons/go";
import { HardDrive, Wifi, Activity, Laptop, Cpu, ArrowUpRight, ArrowDownRight, CircleArrowRight, CircleArrowDown } from 'lucide-react';

const gb = bytes => (bytes / 1024 ** 3).toFixed(2) + " GB";
const THRESHOLDS = {
    cpu: 50,
    ram: 50,
    storage: 50,
    network: 50
};

function formatUptime(sec) {
    const d = Math.floor(sec / 86400);
    sec %= 86400;
    const h = Math.floor(sec / 3600);
    sec %= 3600;
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${d ? d + "d " : ""}${h}h ${m}m ${s}s`;
}

function calculateSeverity(pc) {
    if (!pc.stats) return "NORMAL";

    let abnormalCount = 0;
    let storage = null;
    const cpu = pc.stats?.cpu?.load;
    const ram = pc.stats?.memory?.used && pc.stats?.memory?.total ? (pc.stats.memory.used / pc.stats.memory.total) * 100 : null;
    if (pc.stats?.disks?.length) {
        let used = 0;
        let total = 0;

        pc.stats.disks.forEach(d => {
            used += d.used;
            total += d.size;
        });

        storage = total ? (used / total) * 100 : null;
    }

    const network = pc.stats?.network?.Upload && pc.stats?.network?.download ?
        Math.max(pc.stats.network.Upload, pc.stats.network.download) : null;

    if (typeof cpu === "number" && cpu >= THRESHOLDS.cpu) abnormalCount++;
    if (typeof ram === "number" && ram >= THRESHOLDS.ram) abnormalCount++;
    if (typeof storage === "number" && storage >= THRESHOLDS.storage) abnormalCount++;
    if (typeof network === "number" && network >= THRESHOLDS.network) abnormalCount++;

    if (abnormalCount >= 3) return "CRITICAL";
    if (abnormalCount === 2) return "WARNING";
    return "NORMAL";
}

export default function Pcpanel({ pc, now }) {
    const [collapsed, setCollapsed] = useState(false);
    const [openStatic, setOpenStatic] = useState(false);
    const [openLive, setOpenLive] = useState(false);

    const lastUpdate = pc.stats?.timestamp ? new Date(pc.stats.timestamp).toLocaleTimeString() : "N/A";
    const cpuLoad = pc.stats?.cpu?.load;
    const cpuColor = typeof cpuLoad === "number" ?
        cpuLoad > 80 ? "#dc2626" : cpuLoad > 50 ? "#f59e0b" : "#22c55e" : "#94a3b8";
    const latency = pc.stats?.timestamp ? Math.min(now - pc.stats.timestamp, 10000) : null;

    return (
        <div className="p-1.5 ml-2 mr-2">
            <div className={`pc ${pc.online ? "online" : "offline"}`}>

                <div style={row}>
                    <h3 style={Headerstyle}>
                        <Laptop />{" "}
                        <GoDotFill style={{ color: pc.online ? "green" : "red" }} /> {pc.pcId}
                        <span className="ml-2 text-xs text-gray-400">
                            [{calculateSeverity(pc)}]
                        </span>
                    </h3>

                    <button onClick={() => setCollapsed(!collapsed)} style={iconBtn}>
                        {collapsed ? <CircleArrowRight /> : <CircleArrowDown />}
                    </button>
                </div>

                <Collapse isOpened={collapsed} theme={{ collapse: "react-collapse", content: "react-collapse-content" }}>
                    <p><b>Last Update:</b> {lastUpdate}</p>
                    <p><b>Latency:</b>{" "}{latency !== null ? `${latency} ms` : "N/A"}</p>
                    <p><b>Uptime:</b> {pc.stats?.uptime ? formatUptime(pc.stats.uptime) : "N/A"}</p>

                    <div className="section">
                        <div style={row}>
                            <h4 style={Headerstyle}><Cpu /> Static Info</h4>
                            <button onClick={() => setOpenStatic(!openStatic)} style={iconBtn}>
                                {openStatic ? <CircleArrowDown /> : <CircleArrowRight />}
                            </button>
                        </div>

                        <Collapse isOpened={openStatic}>
                            <p><b>Manufacturer:</b> {pc.staticInfo?.system?.manufacturer ?? "N/A"}</p>
                            <p><b>Model:</b> {pc.staticInfo?.system?.model ?? "N/A"}</p>
                            <p><b>CPU:</b> {pc.staticInfo?.cpu?.brand ?? "N/A"}</p>
                            <p><b>OS:</b> {pc.staticInfo?.os?.distro ?? "N/A"}</p>
                        </Collapse>
                    </div>

                    <div className="section">
                        <div style={row}>
                            <h4 style={Headerstyle}><Activity /> Live Metrics</h4>
                            <button onClick={() => setOpenLive(!openLive)} style={iconBtn}>
                                {openLive ? <CircleArrowDown /> : <CircleArrowRight />}
                            </button>
                        </div>

                        <Collapse isOpened={openLive}>
                            {pc.stats ? (
                                <>
                                    <p><b>Ram status:</b></p>
                                    <RAMStackedBar
                                        used={pc.stats.memory.used}
                                        free={pc.stats.memory.free}
                                        total={pc.stats.memory.total}
                                    />

                                    <div className="flex justify-between mb-4 pb-5 ">
                                        <p><b>RAM Used:</b> {gb(pc.stats.memory.used)}</p>
                                        <p><b>RAM Free:</b> {gb(pc.stats.memory.free)}</p>
                                        <p><b>Total RAM:</b> {gb(pc.stats.memory.total)}</p>
                                    </div>

                                    <p><b>CPU status:</b></p>

                                    <Cpuload value={cpuLoad ?? 0} color={cpuColor} />
                                    <p className="text-center"><b>CPU Load:</b> {typeof cpuLoad === "number" ? `${cpuLoad}%` : "N/A"}</p>

                                    <div>
                                        <h4 className="flex items-center gap-2 font-medium mb-1"><Wifi className="w-4 h-4" /> <p><b>Network status:</b></p></h4>
                                        <p>Upload: {pc.stats?.network?.Upload ?? "N/A"} kbps <ArrowUpRight className="inline w-4 h-4 text-red-700" /></p>
                                        <p>Download: {pc.stats?.network?.download ?? "N/A"} kbps<ArrowDownRight className="inline w-4 h-4  text-blue-700" /></p>
                                        <Netlog upload={pc.stats?.network?.Upload ?? 0} download={pc.stats?.network?.download ?? 0} />
                                    </div>

                                    <h4 className="flex gap-3 mt-5"><HardDrive /><p><b>Hard-disk status:</b></p></h4>
                                    <div style={{ display: "flex", gap: "100px", flexWrap: "wrap", justifyContent: "center" }}>
                                        {pc.stats.disks?.length ? pc.stats.disks.map((d, i) => <DiskDonut key={i} disk={d} />) : <p>No disk data</p>}
                                    </div>
                                </>
                            ) : (
                                <p>No live data</p>
                            )}
                        </Collapse>
                    </div>
                </Collapse>
            </div>
        </div>
    );
}

const row = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
};

const iconBtn = {
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontSize: "16px",
    padding: "4px"
};

const Headerstyle = {
    display: "flex",
    gap: "8px",
};
