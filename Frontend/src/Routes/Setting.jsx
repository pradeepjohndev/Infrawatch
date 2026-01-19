import { useState } from "react";

export default function Setting() {
    const [days, setDays] = useState(1);

    const handleChange = (e) => {
        setDays(e.target.value);
    };

    const getDays = () => {
        if (days == 0) return 5;
        if (days == 1) return 10;
        return 15;
    };

    return (
        <div className="flex justify-between text-white p-5">
            <div className="w-full max-w-md">
                <h1 className="text-2xl font-bold">Settings Page</h1>
                <p className="text-gray-300 mt-1">Adjust your preferences here.</p>

                <div className="mt-6">
                    <p className="mb-2">How long should we store this data?</p>
                    <input type="range" className="w-full accent-blue-700" min="0" max="2" step="1" value={days} onChange={handleChange} />

                    <div className="flex justify-between w-full text-sm mt-2">
                        <span>05 days</span>
                        <span>10 days</span>
                        <span>15 days</span>
                    </div>

                    <p className="mt-3 text-sm text-gray-300">Selected: <span className="font-semibold">{getDays()} days</span></p>
                    <button className="mt-4 px-4 py-2 border-2 rounded hover:bg-white hover:text-black transition">Change</button>
                </div>
            </div>
        </div>
    );
}
