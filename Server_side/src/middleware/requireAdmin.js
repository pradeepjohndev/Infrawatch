import jwt from "jsonwebtoken";
import { getUserRoleById } from "../repositories/userRepository.js";

export async function requireAdmin(req, res, next) {
    const token = req.cookies?.token;
    if (!token) {
        return res.status(401).send("Unauthorized - No token");
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded || !decoded.id) {
            return res.status(401).send("Invalid token");
        }

        const currentRole = String(await getUserRoleById(decoded.id) || "").trim().toLowerCase();
        if (currentRole !== "admin") {
            return res.status(403).send("Access denied - Admin only");
        }

        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).send("Invalid token");
    }
}
