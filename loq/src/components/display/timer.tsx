import { ReactNode, useEffect, useState } from "react";

export function CountdownTimer(props: {
  seconds: number;
  onTimerEnd: () => void;
  generateChildren?: (countdown: number) => ReactNode
}) {
  const [endTime] = useState(new Date().getTime() + props.seconds * 1000);
  const [countdown, setCountdown] = useState(props.seconds);
  const [ended, setEnded] = useState(false);

  useEffect(() => {
    const intervalId = setInterval(() => {
      const timeLeft = endTime - new Date().getTime();
      if (timeLeft > 0) {
        setCountdown(Math.ceil(timeLeft / 1000));
      } else {
        setCountdown(0);
        if (!ended) {
          setEnded(true);
          props.onTimerEnd();
        }
      }
    }, 10);

    return () => clearInterval(intervalId);
  }, [endTime, props.onTimerEnd, ended]);

  return props.generateChildren ? props.generateChildren(countdown) : countdown;
}
