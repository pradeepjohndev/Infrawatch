import React, { useMemo } from "react";
import { Laptop, Link } from "lucide-react";
import { useNow } from "../Helper/useNow.jsx";
import { OctagonAlert } from "lucide-react";
import { Link as RouterLink } from "react-router-dom";

function timeAgo(lastSeen, now) {
  if (!lastSeen) return "unknown";

  const seconds = Math.floor((now - lastSeen) / 1000);
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const days = Math.floor(hours / 24);
  const padding = (n) => String(n).padStart(2, "0");

  if (seconds < 5) return "just now";
  if (seconds < 60) return `Disconnected ${padding(seconds)}s ago`;
  if (minutes < 60) return `Disconnected ${padding(minutes)}m ${padding(secs)}s ago`;
  if (hours < 24) return `Disconnected ${padding(hours)}h ${padding(mins)}m ago`;

  return `Disconnected ${days}d ago`;
}

const RecentPCItem = ({ pc }) => {
  const now = useNow(10000);

  const lastSeenText = useMemo(
    () => timeAgo(pc.lastSeen, now),
    [pc.lastSeen, now]
  );

  return (
    <div className="flex items-center justify-between bg-white/10 hover:bg-white/20 transition-colors rounded-xl px-4 py-3">
      <div className="flex items-center gap-3">
        <Laptop className="w-5 h-5 text-white/80" />
        <span className="font-medium text-white">
          {pc.hostname || pc.pcId}
        </span>
      </div>

      <span className="text-sm text-white/50 flex flex-col">
        {lastSeenText}
      </span>
    </div>
  );
};

export default React.memo(RecentPCItem);
