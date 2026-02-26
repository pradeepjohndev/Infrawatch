import { Routes, Route } from "react-router-dom";
import Login from "./Login_page/Login";
import Register from "./Login_page/Register";
import Home from "./Routes/home.jsx";
import Inspect from "./Routes/Inspect.jsx";
import Dashboard from "./Dashboard/Dashboard.jsx";
import Alerts from "./Routes/Alerts.jsx";
import Setting from "./Routes/Setting.jsx";
import Not_Found from "./Components/not_found.jsx";
import ProtectedRoute from "./Login_page/ProtectedRoute.jsx";
import ProtectedLayout from "./Login_page/ProtectedLayout.jsx";
import "./App.css";
import "./Style.css";
import { useEffect, useState } from "react";

export default function App() {
  const date = new Date();
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const today = `${date.getDate()} ${monthNames[date.getMonth()]}, ${date.getFullYear()}`;

  const [now, setNow] = useState(() => Date.now());
  const [clock, setTime] = useState("");
  const [alertCounts, setAlertCounts] = useState({ total: 0 });

  useEffect(() => {
    const t = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={
        <ProtectedRoute>
          <ProtectedLayout alertCounts={alertCounts} />
        </ProtectedRoute>
      }>
        <Route path="/home" element={<Home today={today} />} />
        <Route path="/dashboard" element={<Dashboard clock={clock} now={now} />} />
        <Route path="/alerts" element={<Alerts now={now} onAlertCountsChange={setAlertCounts} />} />
        <Route path="/inspect" element={<Inspect today={today} clock={clock} />} />
        <Route path="/setting" element={<Setting />} />
      </Route>

      <Route path="*" element={<Not_Found />} />
    </Routes>
  );
}