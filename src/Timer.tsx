import { useState, useEffect } from 'react';
import './App.css'; // Đảm bảo import đúng file CSS vừa sửa ở trên

interface TimerProps {
  onComplete?: () => void;
}

const Timer = ({ onComplete }: TimerProps) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    // Đích đến: Mùng 1 Tết Bính Ngọ (17/02/2026)
    const tetDate = new Date('2026-02-17T00:00:00').getTime();

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = tetDate - now;

      if (distance < 0) {
        clearInterval(timer);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        if (onComplete) onComplete();
      } else {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [onComplete]);

  const pad = (n: number) => n.toString().padStart(2, '0');

  return (
    <div className="timer-container">
      <TimeUnit value={pad(timeLeft.days)} label="Day" />
      <TimeUnit value={pad(timeLeft.hours)} label="Hour" />
      <TimeUnit value={pad(timeLeft.minutes)} label="Minute" />
      <TimeUnit value={pad(timeLeft.seconds)} label="Second" />
    </div>
  );
};

const TimeUnit = ({ value, label }: { value: string; label: string }) => (
  <div className="unit-group">
    <div className="time-label">{label}</div>
    <div className="time-box">
      <div key={value} className="time-value">
        {value}
      </div>
    </div>
  </div>
);

export default Timer;