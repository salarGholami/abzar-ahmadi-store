"use client";

import { useEffect, useState } from "react";

function endOfDayTimestamp() {
  const date = new Date();
  date.setHours(23, 59, 59, 999);
  return date.getTime();
}

export function useCountdownToEndOfDay() {
  const [target] = useState(endOfDayTimestamp);
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    const update = () => setRemaining(Math.max(0, target - Date.now()));
    update();
    const id = window.setInterval(update, 1000);
    return () => window.clearInterval(id);
  }, [target]);

  const totalSeconds = Math.floor(remaining / 1000);
  return {
    hours: Math.floor(totalSeconds / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}
