import React, { useState, useEffect, useRef } from 'react';
import { CallState } from '../types';

interface TimerProps {
  callState: CallState;
}

const Timer: React.FC<TimerProps> = ({ callState }) => {
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (callState === CallState.ACTIVE) {
      if (!intervalRef.current) {
        setSeconds(0); // Reset on new call
        intervalRef.current = window.setInterval(() => {
          setSeconds((prev) => prev + 1);
        }, 1000);
      }
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [callState]);

  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60).toString().padStart(2, '0');
    const secondsLeft = (timeInSeconds % 60).toString().padStart(2, '0');
    return `${minutes}:${secondsLeft}`;
  };

  return <>{formatTime(seconds)}</>;
};

export default Timer;
