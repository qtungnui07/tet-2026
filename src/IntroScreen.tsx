import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import './IntroScreen.css';

interface IntroScreenProps {
  onComplete: () => void;
}

const IntroScreen = ({ onComplete }: IntroScreenProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ onComplete: onComplete });

      // 1. Container hiện ra
      tl.to(containerRef.current, { opacity: 1, duration: 0.5 });

      // 2. Animation dòng 1 (Về nhà - Ăn Tết)
      tl.from(".row-1 .small-text span", { 
        y: 20, opacity: 0, stagger: 0.1, duration: 0.5, ease: "back.out" 
      })
      .from(".row-1 .big-text", { 
        scale: 0.8, opacity: 0, duration: 0.8, ease: "power3.out" 
      }, "-=0.3");

      // 3. Animation dòng 2 (Gạt hết đi - Âu lo)
      tl.from(".row-2 .small-text span", { 
        y: 20, opacity: 0, stagger: 0.1, duration: 0.5, ease: "back.out" 
      }, "-=0.4")
      .from(".row-2 .big-text", { 
        scale: 0.8, opacity: 0, duration: 0.8, ease: "power3.out" 
      }, "-=0.3");

      // 4. Dừng lại ngắm
      tl.to({}, { duration: 2.5 });

      // 5. Biến mất
      tl.to(containerRef.current, { 
        opacity: 0, duration: 0.8, ease: "power2.in" 
      });

    }, containerRef);

    return () => ctx.revert();
  }, [onComplete]);

  return (
    <div className="intro-container" ref={containerRef}>
      {/* Sử dụng CSS Grid Container */}
      <div className="grid-layout">
        
        {/* === DÒNG 1 === */}
        {/* Ô 1: Chữ nhỏ (Căn trên) */}
        <div className="grid-item small-col row-1 top-aligned">
          <div className="small-text">
            <span>về</span>
            <span>nhà</span>
          </div>
        </div>
        {/* Ô 2: Chữ to */}
        <div className="grid-item big-col row-1">
          <h1 className="big-text">ĂN TẾT</h1>
        </div>

        {/* === DÒNG 2 === */}
        {/* Ô 3: Chữ nhỏ (Căn dưới) */}
        <div className="grid-item small-col row-2 bottom-aligned">
          <div className="small-text">
            <span>gạt</span>
            <span>hết</span>
            <span>đi</span>
          </div>
        </div>
        {/* Ô 4: Chữ to */}
        <div className="grid-item big-col row-2">
          <h1 className="big-text">ÂU LO</h1>
        </div>

      </div>
    </div>
  );
};

export default IntroScreen;