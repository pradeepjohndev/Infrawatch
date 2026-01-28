import { useEffect, useState } from "react";

export function useNow(interval = 10000) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const t = setInterval(() => {
      setNow(Date.now());
    }, interval);

    return () => clearInterval(t);
  }, [interval]);

  return now;
}
