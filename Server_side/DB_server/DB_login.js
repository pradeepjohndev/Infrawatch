import { } from 'dotenv/config.js'
import * as sql from "mssql";

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    options: { trustServerCertificate: true }
};

const poolPromise = new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
        console.log("MSSQL Connected");
        return pool;
    })
    .catch(err => console.log("DB Connection Failed", err));

module.exports = {
    sql,
    poolPromise
};
