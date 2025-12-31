import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./Login_page/Login";
import Dashboard from "../src/Dashboard/Dashboard";
import Register from "./Login_page/Register";
import "./App.css";
import "./Style.css";

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
