import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import './IntroScreen.css';

interface IntroScreenProps {
  onComplete: () => void;
}

const SplitText = ({ text }: { text: string }) => (
  <>
    {text.split("").map((char, index) => (
      <span
        key={`${char}-${index}`}
        className="char"
        style={{ display: "inline-block", minWidth: "10px" }}
      >
        {char === " " ? "\u00A0" : char}
      </span>
    ))}
  </>
);

const IntroScreen = ({ onComplete }: IntroScreenProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ onComplete: onComplete });

      tl.to(containerRef.current, { opacity: 1, duration: 0.5 });

      tl.from(".row-1 .small-text-wrapper span", {
        y: -20,
        opacity: 0,
        stagger: 0.05,
        duration: 0.5,
        ease: "back.out(1.7)"
      });

      tl.from(".row-1 .big-text .char", {
        y: 100,
        opacity: 0,
        scale: 0.5,
        rotation: 10,
        stagger: 0.1,
        duration: 0.8,
        ease: "elastic.out(1, 0.5)"
      }, "-=0.4");

      tl.from(".row-2 .small-text-wrapper span", {
        y: -20,
        opacity: 0,
        stagger: 0.05,
        duration: 0.5,
        ease: "back.out(1.7)"
      }, "-=0.2");

      tl.from(".row-2 .big-text .char", {
        y: 100,
        opacity: 0,
        scale: 0.5,
        rotation: -10,
        stagger: 0.1,
        duration: 0.8,
        ease: "elastic.out(1, 0.5)"
      }, "-=0.4");

      tl.to({}, { duration: 2.5 });

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
          <h1 className="big-text fontin">
            <SplitText text="ĂN TẾT" />
          </h1>
        </div>

        <div className="row-container row-2">
          <div className="small-text-wrapper pos-2 fontin">
            <span>gạt</span>
            <span>hết</span>
            <span>đi</span>
          </div>
          <h1 className="big-text fontin">
            <SplitText text="ÂU LO" />
          </h1>
        </div>
      </div>
    </div>
  );
};

export default IntroScreen;
