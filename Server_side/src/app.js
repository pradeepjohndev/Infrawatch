import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";
import agentRoutes from "./routes/agentRoutes.js";

dotenv.config({ path: "../.env" });

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(cors({ origin: true, credentials: true }));
app.set("trust proxy", true);

app.get("/", (_, res) => {
  return res.send("Server running");
});

app.use("/api", authRoutes);
app.use("/api", agentRoutes);

export default app;
