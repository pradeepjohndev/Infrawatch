import { Laptop } from "lucide-react";
import { useNow } from "../Helper/useNow.jsx";

function timeAgo(timestamp) {
  if (!timestamp) return "unknown";

  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds}s ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function RecentPCItem({ pc }) {
  const now = useNow(1000);
  return (
    <>
      <div className="flex items-center justify-between bg-white/10 hover:bg-white/20 transition-colors rounded-xl px-4 py-3">
        <div className="flex items-center gap-3">
          <Laptop className="w-5 h-5 text-white/80" />
          <span className="font-medium text-white">
            {pc.hostname || pc.pcId}
          </span>
        </div>

        <span className="text-sm text-white/50">
          {timeAgo(pc.lastSeen, now)}
        </span>
      </div>
    </>
  );
}
