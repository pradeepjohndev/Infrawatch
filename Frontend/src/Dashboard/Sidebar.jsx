import { useState } from 'react'
import logo from '../assets/react.svg';
import { HousePlug, Menu, AlignHorizontalDistributeCenter, TriangleAlert, Settings, CircleUser, LogOut, ScanSearch } from 'lucide-react';
import { NavLink, Link } from "react-router-dom";

const menuItems = [
    { icons: <HousePlug size={20} />, label: "Home", path: "/home" },
    { icons: <AlignHorizontalDistributeCenter size={20} />, label: "Dashboard", path: "/dashboard" },
    { icons: <TriangleAlert size={20} />, label: "Alerts", path: "/alerts", showBadge: true },
    { icons: <ScanSearch size={20} />, label: "Inspect", path: "/inspect" },
    { icons: <Settings size={20} />, label: "Setting", path: "/setting" }
];

export default function Sidebar({ alertTotal }) {
    const [open, setOpen] = useState(false);
    return (
        <aside className="h-screen shrink-0">
            <nav className={`shadow-md h-screen p-2 flex flex-col duration-500 bg-blue-800 text-white 
                ${open ? "w-60" : "w-16"}`}>
                <div className="px-3 py-2 h-20 flex justify-between items-center">
                    <img src={logo} alt="Logo" className={`${open ? "w-10" : "w-0"} rounded-md transition hover:rotate-360 duration-1000`} />
                    <div>
                        <Menu size={34} className={`duration-500 cursor-pointer ${!open && "rotate-180"}`} onClick={() => setOpen(!open)} />
                    </div>
                </div>

                <ul className="flex-1">
                    {menuItems.map((item, index) => {
                        const isAlertItem = item.label === "Alerts";

                        return (
                            <NavLink to={item.path} key={index} className={({ isActive }) => `px-3 py-2 my-2 rounded-md duration-300 cursor-pointer flex gap-2 items-center relative group
                            ${isActive ? "bg-blue-100" : "hover:bg-blue-600"}`}>
                                {({ isActive }) => (
                                    <>
                                        <div className={`relative ${isActive ? "text-black" : "text-white"}`}>
                                            {item.icons}

                                            {isAlertItem && alertTotal > 0 && (
                                                <span
                                                    className="absolute -top-2 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-bold text-white">
                                                    {alertTotal > 99 ? "99+" : alertTotal}
                                                </span>
                                            )}
                                        </div>

                                        <p className={`${!open && "w-0 translate-x-24"} duration-500 overflow-hidden 
                                            ${isActive ? "text-black" : "text-white"}`}>
                                            {item.label}
                                        </p>

                                        <p className={`${open && "hidden"} absolute left-32 shadow-md rounded-md w-0 p-0 text-black bg-white  duration-100 overflow-hidden group-hover:w-fit group-hover:p-2 group-hover:left-16`}>
                                            {item.label}
                                        </p>
                                    </>
                                )}
                            </NavLink>
                        );
                    })}
                </ul>

                <div className="flex items-center gap-2 p-2 hover:bg-blue-500 rounded-4xl duration-500 border border-white"
                    onClick={() => setOpen(!open)}>
                    <div>
                        <CircleUser size={30} />
                    </div>

                    <div className={`leading-5 ${!open && "w-0 translate-x-24"} duration-500 overflow-hidden flex items-center gap-22`}>
                        <p>user1</p>
                        <Link to="/not_found">
                            <button className="text-sm text-gray-300 rounded-4xl bg-blue-500 hover:bg-blue-700 hover:border duration-500 p-1.5">
                                <LogOut className="hover:text-red-500" />
                            </button>
                        </Link>
                    </div>
                </div>
            </nav>
        </aside>

    )
}
