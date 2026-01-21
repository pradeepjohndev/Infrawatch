require("dotenv").config();
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { poolPromise, sql } = require("./DB_login");
const authenticateToken = require("./auth.middleware");

const app = express();
app.use(express.json());

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const pool = await poolPromise;
  const result = await pool.request()
    .input("email", sql.VarChar, email)
    .query("SELECT * FROM Users WHERE email = @email");

  const user = result.recordset[0];
  if (!user) return res.status(400).json({ error: "User not found" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: "Invalid password" });

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  res.json({ token });
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