import {
    createOrUpdateDevice,
    insertDeviceStaticInfo,
    findDeviceByPcId,
    saveMetrics,
    updateDeviceLastSeen,
    findDeviceBySearch,
    findStaticInfoByDeviceId,
    findMetricsByDeviceIdSince,
    findFirstSeenByDeviceId,
    findDisksByDeviceId,
} from "../repositories/deviceRepository.js";

export async function registerAgent(data) {
    const result = await createOrUpdateDevice(data);
    const deviceId = result.recordset[0]?.id;
    if (!deviceId) throw new Error("Device registration failed");
    await insertDeviceStaticInfo(deviceId, data);
    return deviceId;
}

export async function storeAgentMetrics(data) {
    const device = await findDeviceByPcId(data.pc_id);
    if (!device) throw new Error("Device not registered");

    await saveMetrics(device.id, data);
    await updateDeviceLastSeen(device.id);
}

export async function inspectDevice(search, date) {
    const device = await findDeviceBySearch(search);
    if (!device) return null;

    const staticInfo = await findStaticInfoByDeviceId(device.id);
    const metrics = await findMetricsByDeviceIdSince(device.id, date ? new Date(date) : new Date("2000-01-01"));
    const firstSeen = await findFirstSeenByDeviceId(device.id);
    const disks = await findDisksByDeviceId(device.id);

    return {
        pcId: device.pc_id,
        online: device.status === "ONLINE",
        firstSeen,
        staticInfo: {
            system: {
                manufacturer: staticInfo?.manufacturer,
                model: staticInfo?.model,
            },
            cpu: {
                brand: staticInfo?.cpu_brand,
            },
            os: {
                distro: staticInfo?.os_distro,
            },
        },
        statsHistory: metrics.map((m) => {
            const snapshotTime = new Date(m.created_at);
            const disksForThisTime = disks.filter((d) => {
                const diskTime = new Date(d.created_at);
                return Math.abs(diskTime - snapshotTime) < 30000;
            });

            return {
                timestamp: snapshotTime.getTime(),
                uptime: m.uptime,
                cpu: { load: m.cpu_load },
                memory: {
                    used: m.memory_used,
                    free: m.memory_free,
                    total: m.memory_total,
                },
                network: {
                    upload: m.upload_kbps,
                    download: m.download_kbps,
                },
                disks: disksForThisTime.map((d) => ({
                    mount: d.mount_point,
                    type: d.disk_type,
                    total_gb: d.total_gb,
                    used_gb: d.used_gb,
                    available_gb: d.available_gb,
                    usage_percent: d.usage_percent,
                })),
            };
        }),
    };
}
