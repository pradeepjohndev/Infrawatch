export const THRESHOLDS = {
    cpu: 50,
    ram: 50,
    storage: 80,
    network: 70
};

export function analyzeHealth(pc) {
    let severity = "NORMAL";
    const issues = [];
    const cpu = pc.stats?.cpu?.load;
    const ram = pc.stats?.memory?.used && pc.stats?.memory?.total ? (pc.stats.memory.used / pc.stats.memory.total) * 100 : null;
    const netRate = Math.max(pc.stats?.network?.Upload ?? 0, pc.stats?.network?.download ?? 0);

    if (!pc.stats) { return { severity: "NORMAL", issues: [] }; }
    if (typeof cpu === "number" && cpu >= THRESHOLDS.cpu) { issues.push("CPU"); }
    if (typeof ram === "number" && ram >= THRESHOLDS.ram) { issues.push("RAM"); }
    if (pc.stats?.disks?.length) {
        let used = 0;
        let total = 0;

        pc.stats.disks.forEach(d => { used += d.used; total += d.size; });
        const storage = total ? (used / total) * 100 : null;

        if (typeof storage === "number" && storage >= THRESHOLDS.storage) { issues.push("DISK"); }
    }

    if (netRate >= THRESHOLDS.network) { issues.push("NET"); }

    if (issues.length >= 3) severity = "CRITICAL";
    else if (issues.length === 2) severity = "WARNING";
    return { severity, issues };
}
