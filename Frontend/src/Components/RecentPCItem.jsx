import { Laptop } from "lucide-react";

export default function RecentPCItem({ pc }) {
  return (
    <div className="flex items-center gap-3 bg-white/10 hover:bg-white/20 transition-colors rounded-xl px-4 py-4">
      <Laptop className="w-5 h-5 text-white/80" />
      <span className="font-medium text-white">{pc.hostname || pc.pcId}</span>
    </div>
  );
}
