import { useState } from "react";

const Slider = ({ label, value, setValue, color }) => (
  <div className="space-y-2">
    <div className="flex justify-between items-center">
      <label className="font-medium text-sm">{label}</label>
      <span className={`text-sm font-semibold ${value > 80 ? "text-red-400" : "text-white"}`}>{value}%</span>
    </div>
    <input type="range" min="0" max="100" value={value} onChange={(e) => setValue(e.target.value)} className={`w-full h-2 rounded-lg cursor-pointer ${color}`} />
  </div>
);

export default function ThresholdCard() {
  const [ram, setRam] = useState(50);
  const [cpu, setCpu] = useState(50);
  const [net, setNet] = useState(50);
  const [storage, setStorage] = useState(50);

  return (
    <div className="mt-6 w-screen max-w-md p-6 rounded-2xl bg-gray-800/80 backdrop-blur shadow-lg border border-gray-700">
      <h3 className="text-lg font-semibold mb-6 text-white">
        Adjust Threshold Values
      </h3>

      <div className="space-y-5">
        <Slider label="RAM Usage" value={ram} setValue={setRam} color="accent-blue-500" />
        <Slider label="CPU Usage" value={cpu} setValue={setCpu} color="accent-red-500" />
        <Slider label="NET Usage" value={net} setValue={setNet} color="accent-yellow-500" />
        <Slider label="Storage Usage" value={storage} setValue={setStorage} color="accent-green-500" />
      </div>

      <button className="mt-6 w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition font-semibold">
        Apply Changes
      </button>
    </div>
  );
}
