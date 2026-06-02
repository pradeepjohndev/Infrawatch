import { poolPromise, sql } from "../config/Database_connection.js";

export async function findUserByUsername(username) {
    const pool = await poolPromise;
    const result = await pool.request()
        .input("username", sql.NVarChar, username)
        .query("SELECT * FROM Users WHERE Username = @username");
    return result.recordset[0];
}

export async function createUser(username, passwordHash, role) {
    const pool = await poolPromise;
    return pool.request()
        .input("username", sql.NVarChar, username)
        .input("password", sql.NVarChar, passwordHash)
        .input("role", sql.NVarChar, role)
        .query("INSERT INTO Users (Username, PasswordHash, Role) VALUES (@username, @password, @role)");
}

export async function getUserRoleById(userId) {
    const pool = await poolPromise;
    const result = await pool.request()
        .input("userId", sql.Int, userId)
        .query("SELECT Role FROM Users WHERE UserId = @userId");
    return result.recordset[0]?.Role;
}

export async function updatePasswordByUsername(username, passwordHash) {
    const pool = await poolPromise;
    return pool.request()
        .input("username", sql.NVarChar, username)
        .input("password", sql.NVarChar, passwordHash)
        .query("UPDATE Users SET PasswordHash = @password WHERE Username = @username");
}

export async function updateRoleByUsername(username, role) {
    const pool = await poolPromise;
    return pool.request()
        .input("username", sql.NVarChar, username)
        .input("role", sql.NVarChar, role)
        .query("UPDATE Users SET Role = @role WHERE Username = @username");
}
