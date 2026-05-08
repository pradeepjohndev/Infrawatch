import Sidebar from "../Components/Dashboard/Sidebar.jsx";
import { Outlet } from "react-router-dom";

export default function ProtectedLayout({ alertCounts }) {
    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar alertTotal={alertCounts.total} />
            <main className="flex-1 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
}