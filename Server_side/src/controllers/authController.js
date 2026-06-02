import {
  loginUser,
  registerUser,
  resetUserPassword,
  resetUserRole,
} from "../services/authService.js";
import jwt from "jsonwebtoken";

export async function login(req, res) {
  try {
    const { username, password } = req.body;
    const token = await loginUser(username, password);
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });
    res.sendStatus(200);
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(401).send("Invalid credentials");
  }
}

export async function register(req, res) {
  try {
    const { username, password, role } = req.body;
    await registerUser(username, password, role);
    res.sendStatus(201);
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).send("Registration failed");
  }
}

export function authorization(req, res) {
  const token = req.cookies.token;
  if (!token) return res.status(401).send("Not logged in");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ username: decoded.username, role: decoded.role });
  } catch {
    res.status(401).send("Invalid token");
  }
}

export async function resetUser(req, res) {
  try {
    const { username, action, password, role } = req.body;

    if (!username || !action) {
      return res.status(400).send("Missing required fields");
    }

    if (action === "password") {
      if (!password) {
        return res.status(400).send("Password required");
      }
      await resetUserPassword(username, password);
      return res.status(200).send("Password updated");
    }

    if (action === "role") {
      await resetUserRole(username, role);
      return res.status(200).send("Role updated");
    }

    return res.status(400).send("Invalid action");
  } catch (err) {
    console.error("RESET ERROR:", err);
    res.status(500).send("Reset operation failed");
  }
}

export function authCheck(req, res) {
  return res.json({ user: req.user });
}

export function logout(req, res) {
  res.clearCookie("token", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
  });
  res.sendStatus(200);
}

export function getDashboardData(req, res) {
  return res.json({ message: "Secure dashboard data", user: req.user });
}

export function healthCheck(req, res) {
  return res.json({ status: "ok" });
}
