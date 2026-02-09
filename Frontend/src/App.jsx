import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
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
  const [alertCounts, setAlertCounts] = useState({ total: 0 });

  useEffect(() => {
    const t = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(t);
  }, []);

  console.log("App rendered with alertCounts:", alertCounts);
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar total={alertCounts.total} />
      <main className="flex-1 overflow-y-auto">
        <Routes>
          <Route exact path="/home" element={<Home today={today} />} />
          <Route exact path="/dashboard" element={<Dashboard clock={clock} now={now} />} />
          <Route exact path="/alerts" element={<Alerts now={now} onAlertCountsChange={setAlertCounts} />} />
          <Route exact path="/inspect" element={<Inspect today={today} clock={clock} />} />
          <Route exact path="/setting" element={<Setting />} />
          <Route exact path="/not_found" element={<Not_Found />} />
          <Route exact path="/register" element={<Register />} />
          {/* <Route path="/hi" element={<div><Outlet /></div>}>
            <Route path="hello" element={<h1 className="text-white">Hello</h1>} />
            <Route path="bye" element={<h1 className="text-white">bye</h1>} />
            <Route path="work" element={<h1 className="text-white">work</h1>} />
          </Route> */}
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
