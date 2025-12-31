import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./Login_page/Login";
import Dashboard from "./Login_page/Dashboard";
import Register from "./Login_page/Register";
import "./App.css";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
