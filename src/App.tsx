import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import './App.css';
import IntroScreen from './IntroScreen';
import Timer from './Timer';
import FireworksOverlay from './FireworksOverlay';
import MusicPlayer from './MusicPlayer';

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
  const [showIntro, setShowIntro] = useState(true);
  const [isFinished, setIsFinished] = useState(false);
  const [isShooting, setIsShooting] = useState(false);

  useEffect(() => {
    if (showIntro) return;
    const ctx = gsap.context(() => {
      gsap.from(".year .char", { 
        y: 100, rotateX: -90, opacity: 0, duration: 1, stagger: 0.2, ease: "back.out(1.7)" 
      });
      gsap.from(".greeting .char", { 
        y: 50, rotateX: -90, opacity: 0, duration: 1, stagger: 0.02, delay: 0.5, ease: "power3.out" 
      });
      gsap.from(".timer-container", { 
        y: 50, opacity: 0, duration: 1, delay: 1.5, ease: "power2.out" 
      });
    }, containerRef);

    return () => ctx.revert();
  }, [showIntro]);

  return (
    <>
      <MusicPlayer visible={!showIntro} />
      <FireworksOverlay 
        enableControls={!showIntro} 
        onStatusChange={setIsShooting} 
      />

      {/* Logic Class: Nếu intro tắt VÀ KHÔNG BẮN PHÁO HOA thì mới hiện background (.visible) */}
      <div className={`cny-bg ${!showIntro && !isShooting ? 'visible' : ''}`}></div>

      {showIntro ? (
        <IntroScreen onComplete={() => setShowIntro(false)} />
      ) : (
        <div className="container" ref={containerRef}>
          <div className="content-wrapper">
            <div className="title-wrapper">
              <h1 className="year"><SplitTextString text="2026" /></h1>
              <h2 className="greeting"><SplitTextString text="Happy New Year" /></h2>
            </div>
            {!isFinished && <Timer onComplete={() => setIsFinished(true)} />}
          </div>
        </div>
      )}
    </>
  );
}

export default App;