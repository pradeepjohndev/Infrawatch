import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { CircleX, CircleCheck, Eye, EyeOff } from "lucide-react";
axios.defaults.withCredentials = true;

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [isError, setIsError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const login = async () => {
    if (!username || !password) {
      setMsg("Please enter username and password");
      setIsError(true);
      return;
    }

    try {
      await axios.post(`http://${window.location.host}/api/login`, { username, password, });

      setMsg("Login successful");
      setIsError(false);
      setTimeout(() => navigate("/home"), 1000);
    } catch (err) {
      setMsg("Login failed");
      setIsError(true);
      console.log(err)
    }
  };

  return (
    <>
      <div className="flex h-screen w-screen items-center bg-gray-900 justify-evenly">
        <div className="w-[320px] rounded-lg bg-gray-700 p-6 text-center shadow-lg">
          <h1 className="mb-6 text-2xl font-semibold text-white">Login</h1>

          <input className="mb-4 w-full rounded border border-gray-300 bg-transparent p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />

          <div className="relative mb-4">
            <input type={showPassword ? "text" : "password"} className="w-full rounded border border-gray-300 bg-transparent p-2 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />

            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white">
              {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          </div>

          <button onClick={login} className="w-full rounded bg-blue-600 py-2 font-semibold text-white transition hover:bg-blue-700">
            Login
          </button>

          {msg && (
            <div className={`mt-4 flex items-center gap-2 rounded p-3 text-sm text-white ${isError ? "bg-red-600" : "bg-green-600"}`}>
              {isError ? <CircleX /> : <CircleCheck />}
              <span>{msg}</span>
            </div>
          )}
        </div >
      </div >
    </>
  );
}