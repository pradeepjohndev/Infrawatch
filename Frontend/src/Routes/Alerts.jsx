import React, { useState } from "react";

export default function Alerts() {
    const [search, setSearch] = useState("");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");

    return (
        <>
            <h1 className="text-white p-5">Reports</h1>
            <div className="flex gap-4 p-4 text-white max-w-10/12">
                <div className="" >
                    <h3>Search</h3>
                    <input className=" bg-gray-100 flex-1 p-2 rounded border focus:border-sky-500 focus:outline-2 focus:outline-blue-500 hover:cursor-type text-black" type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
                    {search && <p>Selected date: {search}</p>}
                </div>

                <div className="">
                    <h3>Calendar</h3>
                    <input className=" bg-gray-100 flex-1 p-2 rounded border focus:border-sky-500 focus:outline-2 focus:outline-blue-500 hover:cursor-type text-black" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                    {date && <p>Selected date: {date}</p>}
                </div>

                <div className="">
                    <h3>Timer</h3>
                    <input className=" bg-gray-100 flex-1 p-2 rounded border focus:border-sky-500 focus:outline-2 focus:outline-blue-500 hover:cursor-type text-black" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
                    {time && <p>Selected date: {time}</p>}
                </div>
            </div>
        </>
    );
}




// q-22min-11km - 2264.00
// m-1h8min-49km - 2201.70
// w-1h10min-48km - 2412.20

