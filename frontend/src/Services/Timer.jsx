import React, { useState, useEffect } from "react";

const Timer = ({ duration }) => {
  const [time, setTime] = useState(duration);

  useEffect(() => {
    setTime(duration);
  }, [duration]);

  useEffect(() => {
    if (time <= 0) return;

    const interval = setInterval(() => {
      setTime((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [time]);

  const minutes = Math.floor(time / 60);
  const seconds = time % 60;

  return (
    <div
      style={{
        color: time === 0 ? "red" : "#888",
        fontWeight: time === 0 ? "600" : "400",
      }}
    >
      {time === 0 ? "0:00" : `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`}
    </div>
  );
};

export default Timer;
