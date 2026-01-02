import { useState } from "react";
import { Collapse } from "react-collapse";
import DiskDonut from "../Components/Diskdonut";
import Netlog from "../Components/Netlog";
import Cpuload from "../Components/Cpuload";
import RAMStackedBar from "../Components/RAMStackedBar";
import { GoDotFill } from "react-icons/go";
import { HardDrive, Wifi, Activity, Laptop, Cpu, ArrowUpRight, ArrowDownRight, CircleArrowRight, CircleArrowDown } from 'lucide-react';

const gb = bytes => (bytes / 1024 ** 3).toFixed(2) + " GB";

function formatUptime(sec) {
    const d = Math.floor(sec / 86400);
    sec %= 86400;
    const h = Math.floor(sec / 3600);
    sec %= 3600;
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${d ? d + "d " : ""}${h}h ${m}m ${s}s`;
}

export default function Pcpanel({ pc, now }) {
    const [collapsed, setCollapsed] = useState(false);
    const [openStatic, setOpenStatic] = useState(false);
    const [openLive, setOpenLive] = useState(false);


    const lastUpdate = pc.stats?.timestamp ? new Date(pc.stats.timestamp).toLocaleTimeString() : "N/A";
    const cpuColor = pc.stats.cpu.load > 80 ? "#dc2626" : pc.stats.cpu.load > 50 ? "#f59e0b" : "#22c55e";
    const latency = pc.stats?.timestamp ? Math.min(now - pc.stats.timestamp, 10000) : null;

    return (
        <div className={`pc ${pc.online ? "online" : "offline"}`}>

            <div style={row}>
                <h3 style={Headerstyle}>
                    <Laptop />{" "}
                    <GoDotFill style={{ color: pc.online ? "green" : "red" }} /> {pc.pcId}
                </h3>

                <button onClick={() => setCollapsed(!collapsed)} style={iconBtn}>
                    {collapsed ? <CircleArrowRight /> : <CircleArrowDown />}
                </button>
            </div>

            <Collapse isOpened={collapsed} theme={{ collapse: "react-collapse", content: "react-collapse-content" }}>
                <p><b>Last Update:</b> {lastUpdate}</p>
                <p><b>Latency:</b>{" "}{latency !== null ? `${latency} ms` : "N/A"}</p>
                <p><b>Uptime:</b> {formatUptime(pc.stats.uptime)}</p>

                <div className="section">
                    <div style={row}>
                        <h4 style={Headerstyle}><Cpu /> Static Info</h4>
                        <button onClick={() => setOpenStatic(!openStatic)} style={iconBtn}>
                            {openStatic ? <CircleArrowDown /> : <CircleArrowRight />}
                        </button>
                    </div>

                    <Collapse isOpened={openStatic}>
                        <p><b>Manufacturer:</b> {pc.staticInfo.system.manufacturer}</p>
                        <p><b>Model:</b> {pc.staticInfo.system.model}</p>
                        <p><b>CPU:</b> {pc.staticInfo.cpu.brand}</p>
                        <p><b>OS:</b> {pc.staticInfo.os.distro}</p>
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

                                <Cpuload value={pc.stats.cpu.load} color={cpuColor} />
                                <p className="text-center"><b>CPU Load:</b> {pc.stats.cpu.load}%</p>

                                <div>
                                    <h4 className="flex items-center gap-2 font-medium mb-1"><Wifi className="w-4 h-4" /> <p><b>Network status:</b></p></h4>
                                    <p>Upload: {pc.stats.network.Upload} <ArrowUpRight className="inline w-4 h-4 text-red-700" /></p>
                                    <p>Download: {pc.stats.network.download} <ArrowDownRight className="inline w-4 h-4  text-blue-700" /></p>
                                    <Netlog upload={pc.stats.network.Upload} download={pc.stats.network.download} />
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
