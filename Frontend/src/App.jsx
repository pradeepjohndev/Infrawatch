import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./Login_page/Login";
import Register from "./Login_page/Register";
import Home from "./Routes/home.jsx";
import Inspect from "./Routes/Inspect.jsx";
import Dashboard from "./Dashboard/Dashboard.jsx";
import Alerts from "./Routes/Alerts.jsx";
import Setting from "./Routes/Setting.jsx";
import "./App.css";
import "./Style.css";
import Sidebar from "./Dashboard/Sidebar";
import Not_Found from "./Components/not_found.jsx";
import { useEffect, useState } from "react";

export default function App() {
  const date = new Date();
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const today = `${date.getDate()} ${monthNames[date.getMonth()]}, ${date.getFullYear()}`;
  const [now, setNow] = useState(() => Date.now());
  const [clock, setTime] = useState("");

  useEffect(() => {
    const t = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/home" element={<Home today={today} />} />
          <Route path="/dashboard" element={<Dashboard clock={clock} now={now} />} />
          <Route path="/Alerts" element={<Alerts />} />
          <Route path="Inspect" element={<Inspect today={today} clock={clock} />} />
          <Route path="/setting" element={<Setting />} />
          <Route path="/not_found" element={<Not_Found />} />
        </Routes>
      </main>
    </div>
  );
}

// function App() {
//   return (
//     <>
//       <Dashboard />
//       {/* <BrowserRouter>
//         <Routes>
//           <Route exact path="/" element={<Login />} />
//           <Route path="/register" element={<Register />} />
//           <Route path="/dashboard" element={<Dashboard />} />
//         </Routes>
//       </BrowserRouter> */}
//     </>
//   )
// }

// export default App
