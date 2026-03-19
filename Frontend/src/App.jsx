import { Routes, Route } from "react-router-dom";
import { lazy, Suspense, useEffect, useState } from "react";
import Login from "./Login_page/Login";
import ProtectedRoute from "./Login_page/ProtectedRoute.jsx";
import AdminRoute from "./Login_page/AdminRoute.jsx";
import Loading from "./Components/Loading.jsx";
import Reset from "./Login_page/Reset.jsx";
import "./App.css";
import "./Style.css";

const Register = lazy(() => import("./Login_page/Register"));
const Home = lazy(() => import("./Routes/Home.jsx"));
const Inspect = lazy(() => import("./Routes/Inspect.jsx"));
const Dashboard = lazy(() => import("./Dashboard/Dashboard.jsx"));
const Alerts = lazy(() => import("./Routes/Alerts.jsx"));
const Setting = lazy(() => import("./Routes/Setting.jsx"));
const Not_Found = lazy(() => import("./Components/Not_found.jsx"));
const ProtectedLayout = lazy(() => import("./Login_page/ProtectedLayout.jsx"));

export default function App() {
  const date = new Date();
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
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
    <Suspense fallback={<Loading message="Loading page..." />}>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={
          <ProtectedRoute>
            <AdminRoute>
              <Register />
            </AdminRoute>
          </ProtectedRoute>
        } />
        <Route path="/reset" element={
          <ProtectedRoute>
            <AdminRoute>
              <Reset />
            </AdminRoute>
          </ProtectedRoute>
        } />

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
    </Suspense>
  );
}
