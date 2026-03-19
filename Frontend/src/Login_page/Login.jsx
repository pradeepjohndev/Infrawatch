import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { CircleX, CircleCheck, Eye, EyeOff } from "lucide-react";
import Carousel from "../Components/Carousel";
import Loading from "../Components/Loading";
import logo from "../assets/react.svg";
axios.defaults.withCredentials = true;

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [isError, setIsError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const login = async () => {
    if (!username || !password) {
      setMsg("Please enter username and password");
      setIsError(true);
      return;
    }

    try {
      setIsLoading(true);
      await axios.post(`http://${window.location.host}/api/login`, {
        username,
        password,
      });

      const currentUser = await axios.get(`http://${window.location.host}/api/Authorization`);
      const role = currentUser.data.role;

      localStorage.setItem("role", role);

      setMsg("Login successful");
      setIsError(false);
      navigate("/home");

    } catch (err) {
      setMsg("Login failed");
      setIsError(true);
      setIsLoading(false);
      console.log(err);
    }
  };

  if (isLoading) return <Loading message="Signing you in..." />;

  return (
    <>
      <div className="flex h-screen w-screen items-center justify-evenly bg-gray-900 relative">
        <div className="absolute inset-0 bg-black/50 rounded-4xl"></div>
        <aside>
          <Carousel autoPlay={true} />
        </aside>

        <div className="relative right-0 top-0 h-full w-full md:w-1/2 bg-gray-800/80 backdrop-blur-sm p-8 flex flex-col justify-center">
          <p className="text-white text-xs font-bold flex items-center gap-2"><img src={logo} alt="Infrawatch" className="h-8 w-8" /> Infrawatch</p>
          <h1 className="text-2xl font-semibold text-white">Welcome back.</h1>
          <p className="py-6 text-gray-400">Enter your username and password to access your account.</p>

          <label className="text-sm text-gray-300">Username</label>

          <input className="mb-4 w-full rounded border border-gray-300 bg-transparent p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />

          <div className="relative mb-4">
            <label className="text-sm text-gray-300">Password</label>

            <input type={showPassword ? "text" : "password"} className="w-full rounded border border-gray-300 bg-transparent p-2 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />

            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 text-gray-300 hover:text-white hover:cursor-pointer">
              {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          </div>

          <button onClick={login} disabled={isLoading} className="mt-6 w-full rounded bg-blue-600 py-2 font-semibold text-white transition hover:cursor-pointer hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70">
            {isLoading ? "Signing in..." : "Login"}
          </button>

          {msg && (
            <div className={`mt-4 flex items-center gap-2 rounded p-3 text-sm text-white ${isError ? "bg-red-600" : "bg-green-600"}`}>
              {isError ? <CircleX /> : <CircleCheck />}
              <span>{msg}</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
