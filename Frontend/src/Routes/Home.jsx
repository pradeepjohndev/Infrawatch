import { CalendarDays } from "lucide-react";

export default function Home() {

    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    let monthname = null;
    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];
    monthname = monthNames[month - 1];

    const day = date.getDate();
    let today = `${day} ${monthname}, ${year}`;
    return (
        <>
            <div className="flex justify-between text-white">
                <div className="m-5">
                    <h1>Hello user!</h1>
                    <span>Track all your system in one single place.</span>
                </div>
                <div className="border rounded-4xl h-10 mt-8 p-8 bg-gray-700 flex items-center">
                    <span className="text-white font-bold bg-gray-900 h-10 w-10 rounded-4xl flex items-center justify-center"><CalendarDays /></span>
                    <span className="inline-block text-white ml-2">{today}</span>
                </div>
            </div>
            <div className="parent h-screen w-overflow-hidden m-2">
                <div className="div1 bg-amber-300"> </div>
                <div className="div2 bg-amber-400"> </div>
                <div className="div3 bg-amber-500"> </div>
                <div className="div4 bg-amber-700"> </div>
                <div className="div5 bg-amber-800"> </div>
            </div>

        </>
    )
}