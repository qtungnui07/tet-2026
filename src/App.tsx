import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import './App.css';

// 1. Định nghĩa kiểu dữ liệu cho props để TypeScript không báo lỗi
interface SplitTextStringProps {
  text: string;
}

function App() {
  // Định nghĩa ref trỏ vào HTMLDivElement
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      
      // Hiệu ứng cho chữ 2026
      gsap.from(".year .char", {
        y: 100,
        rotateX: -90,
        opacity: 0,
        duration: 1,
        stagger: 0.1,
        ease: "back.out(1.7)"
      });

      // Hiệu ứng cho chữ Happy New Year
      gsap.from(".greeting .char", {
        y: 50,
        rotateX: -90,
        opacity: 0,
        duration: 1,
        stagger: 0.02,
        delay: 0.5,
        ease: "power3.out"
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="container" ref={containerRef}>
      <div className="title-wrapper">
        <h1 className="year">
          <SplitTextString text="2026" />
        </h1>
        <h2 className="greeting">
          <SplitTextString text="Happy New Year" />
        </h2>
      </div>
    </div>
  );
}

// 2. Component con đã được thêm type annotation (: SplitTextStringProps)
const SplitTextString = ({ text }: SplitTextStringProps) => {
  return (
    <>
      {text.split("").map((char, index) => (
        <span 
          // 3. Sửa lỗi warning key (Ảnh 2) bằng cách ghép chuỗi
          // "char-index" giúp key trở nên unique hơn
          key={`${char}-${index}`} 
          className="char" 
          style={{ display: "inline-block" }}
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </>
  );
};

export default App;