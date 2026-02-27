import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { CircleX, CircleCheck, Eye, EyeOff } from "lucide-react";
axios.defaults.withCredentials = true;

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [isError, setIsError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);


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
      await axios.post("/api/register", {
        username, password,
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
    <div className="flex h-screen items-center justify-center bg-gray-900">
      <div className="w-[320px] rounded-lg bg-gray-700 p-6 text-center shadow-lg">
        <h1 className="mb-6 text-2xl font-semibold text-white">Register</h1>

        <input
          className="mb-4 w-full rounded border border-gray-300 p-2 focus:outline-white  text-white"
          placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />

        <div className="relative mb-4">
          <input type={showPassword ? "text" : "password"} className="w-full rounded border border-gray-300 bg-transparent p-2 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />

          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white">
            {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
          </button>
        </div>
        <div className="relative mb-4">
          <input type={showPassword ? "text" : "password"}
            className=" w-full rounded border border-gray-300 p-2 focus:outline-white text-white"
            placeholder="Re-enter Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />

          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white">
            {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
          </button>
        </div>
        <button onClick={register}
          className="w-full rounded bg-green-600 py-2 font-semibold text-white transition hover:bg-green-700">Register</button>

        {msg && (
          <div className={`mt-4 flex items-center gap-2 rounded p-3 text-sm text-white 
            ${isError ? "bg-red-600" : "bg-green-600"}`}>

            {isError ? <CircleX /> : <CircleCheck />}
            <span>{msg}</span>
          </div>
        )}
      </div>
    </div>
  );
}
