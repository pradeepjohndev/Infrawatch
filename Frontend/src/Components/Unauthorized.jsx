import { useNavigate } from "react-router-dom";

export default function Unauthorized() {
    const navigate = useNavigate();
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
            <h1 className="text-4xl font-bold mb-4 animate-pulse text-blue-600">Access Forbidden</h1>
            <p className="text-sm mb-8">You do not have permission to view this page... wanna navigate to the home?</p>
            <a href="/home" className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 transition hover:cursor-pointer" onClick={() => navigate("/home")}><p className="text-white">Go to Home</p></a>
        </div>
    );
}