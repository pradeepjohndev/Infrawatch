import React, { useState } from "react";
import { Calendar, Clock } from "lucide-react";
import Pcpanel from "../Dashboard/Pcpanel";

export default function Alerts({ today, clock }) {
    const [search, setSearch] = useState("");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");

    return (
        <>
            <div className="text-white p-4 flex justify-between">
                <div className="">
                    <h1>Inspect</h1>
                    <span>look on to all your device's history</span>
                </div>
                <div className="border rounded-4xl h-10 p-8 mt-2 bg-gray-700 flex items-center gap-2">
                    <Calendar />{today}<br></br><Clock />{clock}
                </div>
            </div>
            <div className="flex items-center gap-4 p-4 text-white w-full">
                <input type="text" placeholder="Search by PC ID or Hostname" value={search} onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 bg-gray-200 text-black px-2 py-2 rounded-md border focus:border-sky-500 focus:outline-none" />

                <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                    className="flex-1 bg-gray-200 text-black px-3 py-2 rounded-md border focus:border-sky-500 focus:outline-none" />

                <input type="time" value={time} onChange={(e) => setTime(e.target.value)}
                    className="flex-1 bg-gray-200 text-black px-3 py-2 rounded-md border focus:border-sky-500 focus:outline-none" />
            </div>

            {search && date && time && (
                <div className="p-2 mx-4 rounded-lg text-white flex items-center justify-between">
                    <span>
                        Would you like to look for{" "}
                        <strong>{search}</strong> system information on{" "}
                        <strong>{date}</strong> at{" "}
                        <strong>{time}</strong>?
                    </span>

                    <button onClick={() => alert(`"${search}" system information from ${date} at ${time}`)}
                        className="ml-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-md text-white font-medium">View Report</button>
                </div>)}

        </>
    );
}





