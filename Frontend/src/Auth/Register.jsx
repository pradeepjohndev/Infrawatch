import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { CircleX, CircleCheck, Eye, EyeOff } from "lucide-react";
import Carousel from "../Components/Carousel";
axios.defaults.withCredentials = true;

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [isError, setIsError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("staff");
  const navigate = useNavigate();

  const register = async () => {
    if (!username || !password || !confirmPassword) {
      setMsg("Please fill all fields");
      setIsError(true);
      return;
    }

    if (password.length < 5) {
      setMsg("Password is weak");
      setIsError(true);
      return;
    }

    if (password !== confirmPassword) {
      setMsg("Password mismatch");
      setIsError(true);
      return;
    }

    try {
      await axios.post(`http://${window.location.host}/api/register`, {
        username, password, role
      });

      setMsg("Registered successfully");
      setIsError(false);
      setTimeout(() => navigate("/home"), 1000);

    } catch {
      setMsg("Registration failed");
      setIsError(true);
    }
  };

  return (
    <>
      <div className="flex h-screen items-center justify-center bg-gray-900">
        <div className="w-[420px] rounded-lg bg-gray-700 p-6 m-6 text-center shadow-lg">
          <h2 className="text-2xl mb-3 font-semibold text-white">Create an Account.</h2>
          <p className="text-gray-300 mb-6">Watch the IT asset's with our infrawatch</p>

          <label className="text-sm text-gray-300 flex items-start">Username</label>
          <input
            className="mb-4 w-full rounded border border-gray-300 bg-transparent p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
            placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />

          <div className="relative mb-4">
            <label className="text-sm text-gray-300 flex items-start">Password</label>
            <input type={showPassword ? "text" : "password"}
              className="w-full rounded border border-gray-300 bg-transparent p-2 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />

            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-1/2 text-gray-300 hover:text-white">
              {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          </div>

          <div className="relative mb-4">
            <label className="text-sm text-gray-300 flex items-start">Re-enter password</label>
            <input type={showPassword ? "text" : "password"}
              className="w-full rounded border border-gray-300 bg-transparent p-2 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Re-enter Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />

            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-1/2 text-gray-300 hover:text-white">
              {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          </div>

          <div className="mb-4 text-left text-white">
            <p className="mb-2 text-sm">Select Role</p>
            <label className="mr-4">
              <input type="radio" name="role" value="admin" checked={role === "admin"} onChange={(e) => setRole(e.target.value)} className="mr-1" />Admin </label>

            <label>
              <input type="radio" name="role" value="staff" checked={role === "staff"} onChange={(e) => setRole(e.target.value)} className="mr-1" />Staff</label>
          </div>

          <button onClick={register}
            className="w-full rounded bg-blue-600 py-2 font-semibold text-white hover:bg-blue-700 hover:cursor-pointer hover:border transition ease-in-out duration-700 mb-3">Register</button>

          <Link to="/reset" className="text-sm text-gray-300 mt-4 inline-block"><p className="hover:text-white text-decoration-line: underline transition ease-in-out duration-300">Forgot password? or want to change Role?</p></Link>

          {msg && (
            <div className={`mt-4 flex items-center gap-2 rounded p-3 text-sm text-white 
              ${isError ? "bg-red-600" : "bg-green-600"}`}>

              {isError ? <CircleX /> : <CircleCheck />}
              <span>{msg}</span>
            </div>
          )}

        </div>
        <div className="w-7/10 h-screen bg-cover bg-center shadow-lg rounded-4xl m-4 relative">
          <div className="absolute inset-0 bg-black/50 rounded-4xl"></div>
          <aside>
            <Carousel autoPlay={true} />
          </aside>
        </div>
      </div>
    </>
  );
}
