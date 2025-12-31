import { pool } from "./DB";

const result = await pool.query("SELECT * FROM Users");
console.log(result.recordset);
