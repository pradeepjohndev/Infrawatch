import { CircleAlert, TriangleAlert } from "lucide-react";

export default function Alerts() {

    return (
        <>
            <div className="text-white p-4 flex justify-between">
                <div className="">
                    <h1>Alerts</h1>
                    <span>view all your system alerts</span>
                </div>
                <div className="border rounded-4xl h-10 p-8 mt-2 bg-gray-700 flex items-center gap-2">
                    <TriangleAlert className="w-6 h-6 text-yellow-400" />{`4 warning Alerts`}
                    <CircleAlert className="w-6 h-6 text-red-400" />{`3 Critical Alerts`}
                </div>
            </div>
            <div className="flex items-center gap-4 p-4 text-white w-full">
                <input type="text" placeholder="Search by PC ID or Hostname" className="flex-4 bg-gray-200 text-black px-2 py-2 rounded-md border focus:border-sky-500 focus:outline-none" />
                <select className="flex-1 px-2 py-2 bg-white rounded-md text-black font-medium border focus:border-sky-500">
                    <option value="">Filter by Severity</option>
                    <option value="warning">Warning</option>
                    <option value="critical">Critical</option>
                </select>
            </div>
        </>
    );
}





