import express from "express";
import bcrypt from "bcrypt";
import session from "express-session";
import cors from "cors";
import { getPool } from "./DB.js";

const app = express();

app.use(cors({
    origin: "http://localhost:5174",
    credentials: true
}));

app.use(express.json());

app.use(session({
    secret: "mysecret",
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true }
}));

app.post("/register", async (req, res) => {
    const { username, password } = req.body;

    const pool = await getPool();

    const hash = await bcrypt.hash(password.trim(), 10);

    await pool.request()
        .input("u", username.trim())
        .input("p", hash)
        .query("INSERT INTO Users (username, passwordHash) VALUES (@u,@p)");

    res.sendStatus(201);
});

app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    const pool = await getPool();

    const result = await pool.request()
        .input("u", username.trim())
        .query("SELECT * FROM Users WHERE username=@u");

    if (!result.recordset.length) {
        console.log("User not found:", username);
        return res.status(401).json({ error: "User not found" });
    }

    const user = result.recordset[0];

    console.log("Entered password:", password);
    console.log("Stored hash:", user.passwordHash);
    const ok = await bcrypt.compare(password.trim(), user.passwordHash);

    if (!ok) {
        return res.status(401).json({ error: "Wrong password" });
    }

    req.session.userId = user.id;
    res.json({ message: "Logged in" });
});

app.get("/me", (req, res) => {
    if (!req.session.userId) return res.sendStatus(401);
    res.json({ userId: req.session.userId });
});

app.post("/logout", (req, res) => {
    req.session.destroy(() => res.sendStatus(200));
});

app.listen(5000, () => console.log("Server running at http://localhost:5000"));


/*
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const { poolPromise, sql } = require("./Database");
const authenticateToken = require("./Auth_middleware");

const app = express();
app.use(express.json());
app.use(cors());

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: "Email and password required" });

    const pool = await poolPromise;

    const result = await pool
      .request()
      .input("email", sql.VarChar, email)
      .query("SELECT * FROM Users WHERE email = @email");

    const user = result.recordset[0];
    if (!user)
      return res.status(401).json({ error: "Invalid email or password" });

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid)
      return res.status(401).json({ error: "Invalid email or password" });

    const token = jwt.sign(
      {
        sub: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/dashboard", authenticateToken, (req, res) => {
  res.json({
    message: "Welcome to dashboard",
    user: req.user
  });
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
*/