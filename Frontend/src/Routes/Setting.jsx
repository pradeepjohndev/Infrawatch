import { useState } from "react";
import Theme from "../Components/Theme.jsx";
import { Link } from "react-router-dom";

export default function Setting() {
    const [days, setDays] = useState(1);

    const handleChange = (e) => {
        setDays(e.target.value);
    };

    const getDays = () => {
        if (days == "15 days") return 15;
        if (days == "30 days") return 30;
        return "45";
    };

    return (
        <div className="flex justify-between p-5 bg-white dark:bg-gray-900 text-black dark:text-white rounded shadow min-h-screen" style={{ background: "var(--bg)", color: "var(--text)" }}>
            <div className="w-full max-w-md">
                <h1 className="text-2xl font-bold">Settings Page</h1>
                <p className="text-gray-300 mt-1" style={{ color: "var(--text)" }}>Adjust your preferences here.</p>

                <div className="mt-3">
                    <p className="mb-2">How long should we store this data?</p>
                    <select className="px-4 py-2 bg-gray-400/90 rounded-md text-white font-medium focus:outline-none" value={days} onChange={handleChange}>
                        <option value="15 days">15 Days</option>
                        <option value="30 days">30 Days</option>
                        <option value="45 days">45 Days</option>
                    </select>

                    <p className="mt-3 text-sm text-gray-300" style={{ color: "var(--text)" }}>Selected: <span className="font-semibold">{getDays()} days</span></p>

                    <button className="mt-4 p-3 border-2 rounded hover:bg-white hover:text-black transition" onClick={() => window.alert("DB records will retain for " + getDays() + " days only...!")}>Change</button>

                    <div className="mt-6 p-4 bg-gray-400/90 rounded-md w-96 flex-row gap-2">
                        <h2 className="font-semibold">Appearance</h2>
                        <div className="">
                            <Theme />
                        </div>
                    </div>
                    <div className="mt-6 p-4 bg-gray-400/90 rounded-md w-96 flex gap-2 items-center">
                        <h3>Register new User?</h3>
                        <button className="px-4 py-2 bg-gray-500 rounded hover:bg-gray-600 transition">
                            <Link to="/register" className="text-white no-underline">
                                <p className="text-white">Register</p>
                            </Link>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
