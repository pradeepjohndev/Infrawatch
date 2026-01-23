import { poolPromise } from "./DB_conn/Database_connection.js";

const pool = await poolPromise;
const result = await pool.query("SELECT * FROM disk_metrics");

console.log(result.recordset);
