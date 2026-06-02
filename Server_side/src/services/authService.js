import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
    findUserByUsername,
    createUser,
    getUserRoleById,
    updatePasswordByUsername,
    updateRoleByUsername,
} from "../repositories/userRepository.js";

export async function loginUser(username, password) {
    const user = await findUserByUsername(username);
    if (!user) throw new Error("Invalid credentials");

    const valid = await bcrypt.compare(password, user.PasswordHash);
    if (!valid) throw new Error("Invalid credentials");

    return jwt.sign(
        {
            id: user.UserId,
            username: user.Username,
            role: user.Role,
        },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    );
}

export async function registerUser(username, password, role) {
    const passwordHash = await bcrypt.hash(password, 10);
    const normalizedRole = role === "admin" ? "admin" : "staff";
    return createUser(username, passwordHash, normalizedRole);
}

export async function resetUserPassword(username, password) {
    const passwordHash = await bcrypt.hash(password, 10);
    return updatePasswordByUsername(username, passwordHash);
}

export async function resetUserRole(username, role) {
    const normalizedRole = role === "admin" ? "admin" : "staff";
    return updateRoleByUsername(username, normalizedRole);
}

export async function getRoleByUserId(userId) {
    return getUserRoleById(userId);
}
