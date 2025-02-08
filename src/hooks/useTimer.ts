import { useState, useEffect, useCallback } from 'react';

export const useTimer = (initialTime: number = 0) => {
  const [time, setTime] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  const start = useCallback(() => {
    if (!isRunning) {
      setIsRunning(true);
      const id = setInterval(() => {
        setTime(prevTime => prevTime + 100); // 每100ms更新一次
      }, 100);
      setIntervalId(id);
    }
  }, [isRunning]);

  const pause = useCallback(() => {
    if (isRunning && intervalId) {
      clearInterval(intervalId);
      setIsRunning(false);
    }
  }, [isRunning, intervalId]);

  const reset = useCallback(() => {
    if (intervalId) {
      clearInterval(intervalId);
    }
    setTime(0);
    setIsRunning(false);
  }, [intervalId]);

  useEffect(() => {
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [intervalId]);

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const tenths = Math.floor((ms % 1000) / 100);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${tenths}`;
  };

  return {
    time: formatTime(time),
    rawTime: time,
    isRunning,
    start,
    pause,
    reset
  };
};