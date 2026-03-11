import { AlertCircleIcon, Eye, EyeOff, CircleCheck, CircleX } from "lucide-react";
import { useState, useReducer } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function roleReducer(state, action) {
    switch (action.type) {
        case "admin":
            return "admin";
        case "staff":
            return "staff";
        default:
            return state;
    }
}

export default function Reset() {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [action, setAction] = useState("password");
    const [msg, setMsg] = useState("");
    const [isError, setIsError] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [role, dispatchRole] = useReducer(roleReducer, "admin");

    const submit = async () => {

        if (!username) {
            setMsg("Username is required");
            setIsError(true);
            return;
        }

        if (action === "password" && !password) {
            setMsg("Password is required");
            setIsError(true);
            return;
        }

        try {
            setIsLoading(true);
            const payload = {
                username,
                action,
                password: action === "password" ? password : undefined,
                role: action === "role" ? role : undefined
            };
            await axios.post("http://localhost:8080/api/reset", payload);
            setMsg("Changes made successful");
            setIsError(false);
            setIsLoading(false);
            setTimeout(() => navigate("/home"), 1000);

        } catch (err) {
            console.log(err);
            setMsg("Operation failed");
            setIsError(true);
            setIsLoading(false);
        }
    };

    return (
        <div className="flex h-screen w-screen items-center justify-center bg-gray-900 text-white">
            <div className="w-[420px] rounded-lg bg-gray-700 p-6 shadow-lg">
                <h3 className="text-2xl font-bold mb-4 text-blue-500 text-center">Manage User</h3>
                <p className="text-sm mb-6 flex items-center justify-center gap-2 text-red-600 bg-red-100/80 p-2 rounded-xl">
                    <AlertCircleIcon color="red" size={18} />Proceed with caution
                </p>

                <label className="text-sm text-gray-300">Username</label>
                <input className="mb-4 w-full rounded border border-gray-300 bg-transparent p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />

                <label className="text-sm text-gray-300">Select Action</label>
                <select className="mb-4 w-full rounded border border-gray-300 bg-gray-800 p-2 text-white focus:ring-2 focus:ring-blue-500"
                    value={action} onChange={(e) => setAction(e.target.value)}>
                    <option value="password">Change Password</option>
                    <option value="role">Change Role</option>
                </select>

                {action === "password" && (
                    <div className="relative mb-4">
                        <label className="text-sm text-gray-300">New Password</label>
                        <input type={showPassword ? "text" : "password"}
                            className="w-full rounded border border-gray-300 bg-transparent p-2 pr-10 text-white focus:ring-2 focus:ring-blue-500"
                            placeholder="New Password" value={password} onChange={(e) => setPassword(e.target.value)} />

                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-9 text-gray-300 hover:text-white">
                            {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                        </button>
                    </div>
                )}

                {action === "role" && (
                    <div className="mb-4">
                        <p className="mb-2 text-sm">Select Role</p>

                        <label className="mr-4">
                            <input type="radio" name="role" checked={role === "admin"} onChange={() => dispatchRole({ type: "admin" })} className="mr-1" />Admin
                        </label>

                        <label>
                            <input type="radio" name="role" checked={role === "staff"} onChange={() => dispatchRole({ type: "staff" })} className="mr-1" />Staff
                        </label>
                    </div>
                )}

                {msg && (
                    <div className={`mt-4 flex items-center gap-2 rounded p-3 text-sm ${isError ? "bg-red-600" : "bg-green-600"}`}>
                        {isError ? <CircleX /> : <CircleCheck />}
                        <span>{msg}</span>
                    </div>
                )}

                <button onClick={submit} disabled={isLoading} className="mt-4 w-full rounded bg-blue-600 py-2 font-semibold hover:bg-blue-700 disabled:opacity-70">
                    {isLoading ? "Processing..." : "Submit"}
                </button>

                <Link to="/home" className="text-sm text-gray-300 mt-4 inline-block items-center"><p className="hover:text-white text-decoration-line: underline transition ease-in-out duration-300">Return to home ?</p></Link>

            </div>
        </div>
    );
}