import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./Login_page/Login";
import Register from "./Login_page/Register";
import Home from "./Routes/home.jsx";
import Dashboard from "./Dashboard/Dashboard.jsx";
import Alerts from "./Routes/Alerts.jsx";
import Setting from "./Routes/Setting.jsx";
import "./App.css";
import "./Style.css";
import Sidebar from "./Dashboard/Sidebar";

export default function App() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/Alerts" element={<Alerts />} />
          <Route path="/setting" element={<Setting />} />
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
