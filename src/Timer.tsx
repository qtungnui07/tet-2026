import { useState, useEffect } from 'react';
import './Timer.css'

const Timer = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    // Đích đến: 0h00 ngày 17/02/2026
    const tetDate = new Date('2026-02-17T00:00:00').getTime();

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = tetDate - now;

      if (distance < 0) {
        clearInterval(timer);
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
  }, []);

  const pad = (n: number) => n.toString().padStart(2, '0');

  return (
    <div className="timer-container">
      <TimeUnit value={pad(timeLeft.days)} label="Ngày" />
      <TimeUnit value={pad(timeLeft.hours)} label="Giờ" />
      <TimeUnit value={pad(timeLeft.minutes)} label="Phút" />
      <TimeUnit value={pad(timeLeft.seconds)} label="Giây" />
    </div>
  );
};

// --- CẬP NHẬT: Component hiển thị từng ô ---
const TimeUnit = ({ value, label }: { value: string; label: string }) => (
  <div className="unit-group">
    {/* 1. Label đưa lên trên */}
    <div className="time-label">{label}</div>
    
    <div className="time-box">
      {/* 2. Mẹo Animation: key={value} giúp react reset animation mỗi khi số thay đổi */}
      <div key={value} className="time-value">
        {value}
      </div>
    </div>
  </div>
);

export default Timer;