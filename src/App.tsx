import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import './App.css';

function App() {
  const containerRef = useRef(null);

  useEffect(() => {
    // Đây là đoạn code giống trong ảnh bạn gửi
    const ctx = gsap.context(() => {
      
      // Hiệu ứng cho chữ 2026 (Nảy lên)
      gsap.from(".year .char", {
        y: 100,           // Từ dưới bay lên
        rotateX: -90,     // Xoay 3D
        opacity: 0,       // Từ mờ đến rõ
        duration: 1,      // Thời gian chạy
        stagger: 0.1,     // Ký tự sau chạy chậm hơn ký tự trước 0.1s
        ease: "back.out(1.7)" // Hiệu ứng nảy tưng tưng
      });

      // Hiệu ứng cho chữ Happy New Year (Bay theo sau)
      gsap.from(".greeting .char", {
        y: 50,
        rotateX: -90,
        opacity: 0,
        duration: 1,
        stagger: 0.02,    // Chữ dài nên cho stagger nhanh hơn chút
        delay: 0.5,       // Đợi số 2026 chạy được 1 nửa mới bắt đầu
        ease: "power3.out"
      });

    }, containerRef);

    return () => ctx.revert(); // Dọn dẹp khi component bị hủy
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

// Đây là hàm phụ trợ để cắt chữ ra thành từng thẻ <span>
// Ví dụ: "2026" -> <span>2</span><span>0</span><span>2</span><span>6</span>
const SplitTextString = ({ text }) => {
  return text.split("").map((char, index) => (
    <span key={index} className="char" style={{ display: "inline-block" }}>
      {char === " " ? "\u00A0" : char} {/* Xử lý dấu cách */}
    </span>
  ));
};

export default App;