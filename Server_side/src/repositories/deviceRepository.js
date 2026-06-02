import { poolPromise, sql } from "../config/Database_connection.js";

export async function createOrUpdateDevice(device) {
    const pool = await poolPromise;
    return pool.request()
        .input("pc_id", sql.VarChar, device.pc_id)
        .input("hostname", sql.VarChar, device.hostname)
        .input("ip_address", sql.VarChar, device.ip_address || null)
        .query(`
      MERGE dbo.devices AS target
      USING (SELECT @pc_id AS pc_id) AS source
      ON target.pc_id = source.pc_id
      WHEN MATCHED THEN
        UPDATE SET
          hostname = @hostname,
          ip_address = @ip_address,
          last_seen = GETDATE(),
          status = 'ONLINE',
          updated_at = GETDATE()
      WHEN NOT MATCHED THEN
        INSERT (pc_id, hostname, ip_address, status, last_seen)
        VALUES (@pc_id, @hostname, @ip_address, 'ONLINE', GETDATE())
      OUTPUT INSERTED.id;
    `);
}

export async function insertDeviceStaticInfo(deviceId, data) {
    const pool = await poolPromise;
    return pool.request()
        .input("device_id", sql.BigInt, deviceId)
        .input("manufacturer", sql.VarChar, data.manufacturer)
        .input("model", sql.VarChar, data.model)
        .input("cpu_brand", sql.VarChar, data.cpu_brand)
        .input("cpu_cores", sql.Int, data.cpu_cores)
        .input("os_distro", sql.VarChar, data.os_distro)
        .input("os_arch", sql.VarChar, data.os_arch)
        .input("total_memory_gb", sql.Decimal(10, 2), data.total_memory_gb)
        .query(`
      IF NOT EXISTS (
        SELECT 1 FROM dbo.device_static_info WHERE device_id = @device_id
      )
      INSERT INTO dbo.device_static_info
      (device_id, manufacturer, model, cpu_brand, cpu_cores, os_distro, os_arch, total_memory_gb)
      VALUES
      (@device_id, @manufacturer, @model, @cpu_brand, @cpu_cores, @os_distro, @os_arch, @total_memory_gb)
    `);
}

export async function findDeviceByPcId(pc_id) {
    const pool = await poolPromise;
    const result = await pool.request()
        .input("pc_id", sql.VarChar, pc_id)
        .query("SELECT id, pc_id, status FROM dbo.devices WHERE pc_id = @pc_id");
    return result.recordset[0];
}

export async function saveMetrics(deviceId, data) {
    const pool = await poolPromise;
    await pool.request()
        .input("device_id", sql.BigInt, deviceId)
        .input("cpu_load", sql.Decimal(5, 2), data.cpu_load)
        .input("memory_used", sql.BigInt, data.memory_used)
        .input("memory_free", sql.BigInt, data.memory_free)
        .input("memory_total", sql.BigInt, data.memory_total)
        .input("uptime", sql.BigInt, Math.floor(data.uptime))
        .input("upload_kbps", sql.Decimal(10, 2), data.upload_kbps || 0)
        .input("download_kbps", sql.Decimal(10, 2), data.download_kbps || 0)
        .query(`
      INSERT INTO dbo.device_metrics
      (device_id, cpu_load, memory_used, memory_free, memory_total, uptime, upload_kbps, download_kbps)
      VALUES
      (@device_id, @cpu_load, @memory_used, @memory_free, @memory_total, @uptime, @upload_kbps, @download_kbps)
    `);

    if (Array.isArray(data.disks) && data.disks.length) {
        const diskTable = new sql.Table("dbo.device_disks");
        diskTable.create = false;

        diskTable.columns.add("device_id", sql.BigInt, { nullable: false });
        diskTable.columns.add("mount_point", sql.VarChar(255), { nullable: true });
        diskTable.columns.add("disk_type", sql.VarChar(50), { nullable: true });
        diskTable.columns.add("total_gb", sql.Decimal(10, 2), { nullable: true });
        diskTable.columns.add("used_gb", sql.Decimal(10, 2), { nullable: true });
        diskTable.columns.add("available_gb", sql.Decimal(10, 2), { nullable: true });
        diskTable.columns.add("usage_percent", sql.Decimal(5, 2), { nullable: true });

        data.disks.forEach(d => {
            diskTable.rows.add(
                deviceId,
                String(d.mount || ""),
                String(d.type || "Unknown"),
                Number(d.total_gb) || 0,
                Number(d.used_gb) || 0,
                Number(d.available_gb) || 0,
                Number(d.usage_percent) || 0
            );
        });

        await pool.request().bulk(diskTable);
    }
}

export async function updateDeviceLastSeen(deviceId) {
    const pool = await poolPromise;
    return pool.request()
        .input("device_id", sql.BigInt, deviceId)
        .query(`
      UPDATE dbo.devices
      SET last_seen = GETDATE(),
          status = 'ONLINE',
          updated_at = GETDATE()
      WHERE id = @device_id
    `);
}

export async function findDeviceBySearch(search) {
    const pool = await poolPromise;
    const result = await pool.request()
        .input("search", sql.VarChar, search)
        .query(`
      SELECT TOP 1 *
      FROM dbo.devices
      WHERE pc_id LIKE '%' + @search + '%' OR hostname LIKE '%' + @search + '%'
    `);
    return result.recordset[0];
}

export async function findStaticInfoByDeviceId(deviceId) {
    const pool = await poolPromise;
    const result = await pool.request()
        .input("device_id", sql.BigInt, deviceId)
        .query(`
      SELECT * FROM dbo.device_static_info
      WHERE device_id = @device_id
    `);
    return result.recordset[0];
}

export async function findMetricsByDeviceIdSince(deviceId, startDate) {
    const pool = await poolPromise;
    const result = await pool.request()
        .input("device_id", sql.BigInt, deviceId)
        .input("startDate", sql.DateTime, startDate)
        .query(`
      SELECT * FROM dbo.device_metrics
      WHERE device_id = @device_id AND created_at >= @startDate
      ORDER BY created_at ASC
    `);
    return result.recordset;
}

export async function findFirstSeenByDeviceId(deviceId) {
    const pool = await poolPromise;
    const result = await pool.request()
        .input("device_id", sql.BigInt, deviceId)
        .query(`
      SELECT MIN(created_at) AS first_seen
      FROM dbo.device_metrics
      WHERE device_id = @device_id
    `);
    return result.recordset[0]?.first_seen;
}

export async function findDisksByDeviceId(deviceId) {
    const pool = await poolPromise;
    const result = await pool.request()
        .input("device_id", sql.BigInt, deviceId)
        .query(`
      SELECT *
      FROM dbo.device_disks
      WHERE device_id = @device_id
    `);
    return result.recordset;
}
