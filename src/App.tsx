// import { useEffect, useRef, useState } from 'react';
// import gsap from 'gsap';
// import './App.css';
// import IntroScreen from './IntroScreen';
// import Timer from './Timer';
// import MusicPlayer from './MusicPlayer';
// import FireworksOverlay from './FireworksOverlay';

// interface SplitTextStringProps { text: string; }
// const SplitTextString = ({ text }: SplitTextStringProps) => (
//   <>
//     {text.split("").map((char, index) => (
//       <span key={`${char}-${index}`} className="char" style={{ display: "inline-block" }}>
//         {char === " " ? "\u00A0" : char}
//       </span>
//     ))}
//   </>
// );

// function App() {
//   const containerRef = useRef<HTMLDivElement>(null);
//   const [showIntro, setShowIntro] = useState(true);
//   const [isFinished, setIsFinished] = useState(false);
//   const [isShooting, setIsShooting] = useState(false);

//   useEffect(() => {
//     if (showIntro) return;
//     const ctx = gsap.context(() => {
//       gsap.from(".year .char", { y: 100, rotateX: -90, opacity: 0, duration: 1, stagger: 0.2, ease: "back.out(1.7)" });
//       gsap.from(".greeting .char", { y: 50, rotateX: -90, opacity: 0, duration: 1, stagger: 0.02, delay: 0.5, ease: "power3.out" });
//       gsap.from(".timer-container", { y: 50, opacity: 0, duration: 1, delay: 1.5, ease: "power2.out" });
//     }, containerRef);
//     return () => ctx.revert();
//   }, [showIntro]);

//   return (
//     <>
//       {/* TRUYỀN MUSIC PLAYER VÀO ĐỂ FIREWORKS TỰ SẮP XẾP */}
//       <FireworksOverlay 
//         // enableControls={!showIntro} 
//         onStatusChange={setIsShooting} 
//         extraContent={!showIntro ? <MusicPlayer visible={!showIntro} /> : <MusicPlayer visible={false} />}
//       />

//       <div className={`cny-bg ${!showIntro && !isShooting ? 'visible' : ''}`}></div>

//       {showIntro ? (
//         <IntroScreen onComplete={() => setShowIntro(false)} />
//       ) : (
//         <div className="container" ref={containerRef}>
//           <div className="content-wrapper">
//             <div className="title-wrapper">
//               <h1 className="year"><SplitTextString text="2026" /></h1>
//               <h2 className="greeting"><SplitTextString text="Happy New Year" /></h2>
//             </div>
//             {!isFinished && <Timer onComplete={() => setIsFinished(true)} />}
//           </div>
//         </div>
//       )}
//     </>
//   );
// }

// export default App;




import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import './App.css';
import IntroScreen from './IntroScreen';
import Timer from './Timer';
import MusicPlayer from './MusicPlayer';
import FireworksOverlay from './FireworksOverlay';
import StartScreen from './StartScreen'; // Import màn hình mới

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
  
  // State mới: Kiểm tra xem người dùng đã click bắt đầu chưa
  const [hasStarted, setHasStarted] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [isFinished, setIsFinished] = useState(false);
  const [isShooting, setIsShooting] = useState(false);

  useEffect(() => {
    // Chỉ chạy animation chữ 2026 khi Intro đã xong
    if (showIntro || !hasStarted) return; 
    
    const ctx = gsap.context(() => {
      gsap.from(".year .char", { y: 100, rotateX: -90, opacity: 0, duration: 1, stagger: 0.2, ease: "back.out(1.7)" });
      gsap.from(".greeting .char", { y: 50, rotateX: -90, opacity: 0, duration: 1, stagger: 0.02, delay: 0.5, ease: "power3.out" });
      gsap.from(".timer-container", { y: 50, opacity: 0, duration: 1, delay: 1.5, ease: "power2.out" });
    }, containerRef);
    
    return () => ctx.revert();
  }, [showIntro, hasStarted]);

  // --- TRƯỜNG HỢP 1: CHƯA BẤM START (Hiện màn hình chờ) ---
  if (!hasStarted) {
    return <StartScreen onStart={() => setHasStarted(true)} />;
  }

  // --- TRƯỜNG HỢP 2: ĐÃ BẤM START (Vào Intro -> Main) ---
  return (
    <>
      {/* MusicPlayer được mount ngay khi hasStarted = true -> Autoplay thành công 
         visible={!showIntro}: Ẩn giao diện lúc Intro, hiện giao diện lúc vào Main
         Nhưng nhạc vẫn phát nền.
      */}
      <FireworksOverlay 
        enableControls={!showIntro} 
        onStatusChange={setIsShooting} 
        extraContent={<MusicPlayer visible={!showIntro} />}
      />

      <div className={`cny-bg ${!showIntro && !isShooting ? 'visible' : ''}`}></div>

      {showIntro ? (
        // Màn hình Intro chạy chữ "Về nhà ăn tết"
        <IntroScreen onComplete={() => setShowIntro(false)} />
      ) : (
        // Màn hình chính đếm ngược
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