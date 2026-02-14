import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import './App.css';

// --- PHẦN 1: LOGIC ĐẾM NGƯỢC (Giữ nguyên) ---
const CountdownTimer = () => {
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

// --- PHẦN 3: APP CHÍNH (Giữ nguyên logic cũ) ---
// (Lưu ý: Nhớ giữ lại Interface và Component SplitTextString cũ của bạn ở đây nhé)
interface SplitTextStringProps { text: string; }
const SplitTextString = ({ text }: SplitTextStringProps) => (
  <>
    {text.split("").map((char, index) => (
      <span key={`${char}-${index}`} className="char" style={{ display: "inline-block" }}>
        {char === " " ? "\u00A0" : char}
      </span>
    ))}
  </>
);

function App() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".year .char", { y: 100, rotateX: -90, opacity: 0, duration: 1, stagger: 0.1, ease: "back.out(1.7)" });
      gsap.from(".greeting .char", { y: 50, rotateX: -90, opacity: 0, duration: 1, stagger: 0.05, delay: 0.5, ease: "power3.out" });
      gsap.from(".timer-container", { y: 50, opacity: 0, duration: 1, delay: 1.5, ease: "power2.out" });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <div className="container" ref={containerRef}>
      <div className="content-wrapper">
        <div className="title-wrapper">
          <h1 className="year"><SplitTextString text="2026" /></h1>
          <h2 className="greeting"><SplitTextString text="Happy New Year" /></h2>
        </div>
        <CountdownTimer />
      </div>
    </div>
  );
}

export default App;