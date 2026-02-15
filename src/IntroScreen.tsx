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

      tl.to(containerRef.current, { opacity: 1, duration: 0.5 });

      tl.from(".row-1 .small-text-wrapper span", { 
        y: 40,
        opacity: 0, 
        duration: 0.8, 
        stagger: 0.15,
        ease: "back.out(1.7)"
      })
      .from(".row-1 .big-text", { 
        scale: 0.5,
        opacity: 0, 
        duration: 1, 
        ease: "elastic.out(1, 0.5)"
      }, "-=0.5");

      tl.from(".row-2 .small-text-wrapper span", { 
        y: 40, 
        opacity: 0, 
        duration: 0.8, 
        stagger: 0.15,
        ease: "back.out(1.7)" 
      }, "-=0.5")
      .from(".row-2 .big-text", { 
        scale: 0.5, 
        opacity: 0, 
        duration: 1, 
        ease: "elastic.out(1, 0.5)" 
      }, "-=0.6");

      tl.to({}, { duration: 3 });

      tl.to(containerRef.current, { 
        opacity: 0, 
        scale: 1.1,
        duration: 0.8, 
        ease: "power2.in" 
      });

    }, containerRef);

    return () => ctx.revert();
  }, [onComplete]);

  return (
    <div className="intro-container" ref={containerRef}>
      <div className="intro-content">
        <div className="row-container row-1">
          <div className="small-text-wrapper pos-1 fontin">
            <span>về</span>
            <span>nhà</span>
          </div>
          <h1 className="big-text fontin">ĂN TẾT</h1>
        </div>

        <div className="row-container row-2">
          <div className="small-text-wrapper pos-2 fontin">
            <span>gạt</span>
            <span>hết</span>
            <span>đi</span>
          </div>
          <h1 className="big-text fontin">ÂU LO</h1>
        </div>
      </div>
    </div>
  );
};

export default IntroScreen;
