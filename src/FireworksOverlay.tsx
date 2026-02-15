import React, {
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
  useState,
  useCallback,
} from "react";

// --- 1. CONFIG & DATA ---
const LUNAR_NEW_YEAR_2026 = new Date("2026-02-17T00:00:00");
// const LUNAR_NEW_YEAR_2026 = new Date(); // Bỏ comment dòng này để test ngay

const FIREWORK_AUDIO_URLS = [
  "/firework1.mp3",
  "/firework2.mp3",
  "/firework3.mp3"
];

const THEME_COLORS = [
  "#FFD700", "#FF4500", "#FF0000", "#FFA500", "#FFFFFF", "#E6BE8A",
  "#FF69B4", "#FF1493",
];

type FireworkType = "sphere" | "ring" | "willow" | "strobe" | "star" | "heart";

interface Particle {
  x: number; y: number; vx: number; vy: number;
  alpha: number; color: string; decay: number; gravity: number; drag: number;
}

interface Firework {
  x: number; y: number; targetY: number; vx: number; vy: number;
  color: string; type: FireworkType; particles: Particle[];
  exploded: boolean; dead: boolean;
  audioSource?: AudioBufferSourceNode; audioGain?: GainNode;
}

const isMainEvent = (date: Date) => {
  const diff = date.getTime() - LUNAR_NEW_YEAR_2026.getTime();
  return diff >= 0 && diff < 60 * 60 * 1000;
};
const random = (min: number, max: number) => Math.random() * (max - min) + min;

// --- 2. CONTROLS COMPONENT (CÓ ANIMATION TRƯỢT LÊN) ---
interface ControlsProps {
  onLaunch: (type: FireworkType) => void;
  onMix: () => void;
  visible: boolean;
}

const Controls: React.FC<ControlsProps> = ({ onLaunch, onMix, visible }) => {
  if (!visible) return null;

  const btnStyle: React.CSSProperties = {
    width: '40px', height: '40px', borderRadius: '50%',
    border: '1px solid rgba(255, 215, 0, 0.3)',
    background: 'rgba(50, 0, 0, 0.6)', cursor: 'pointer',
    color: '#FFD700', display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'transform 0.2s', padding: 0,
  };

  const containerStyle: React.CSSProperties = {
    position: 'fixed', bottom: '30px', left: '50%', 
    // Animation sẽ ghi đè transform này, nên ta định nghĩa trong keyframes luôn
    transform: 'translateX(-50%)', 
    zIndex: 9999, display: 'flex', gap: '8px',
    padding: '10px 15px', borderRadius: '30px',
    background: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(5px)',
    border: '1px solid rgba(255, 215, 0, 0.2)',
    
    // --- ANIMATION TRƯỢT LÊN ---
    animation: 'slideUpControl 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
    opacity: 0 // Bắt đầu ẩn để animation xử lý
  };

  const types: FireworkType[] = ["sphere", "ring", "star", "heart", "willow", "strobe"];

  const getIcon = (type: FireworkType) => {
    const svgStyle = { width: '20px', height: '20px', fill: 'none', stroke: 'currentColor', strokeWidth: 2 };
    switch (type) {
      case "sphere": return <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'currentColor' }}></div>;
      case "ring": return <div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid currentColor' }}></div>;
      case "star": return (<svg style={svgStyle} viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor" stroke="none"/></svg>);
      case "heart": return (<svg style={svgStyle} viewBox="0 0 24 24" stroke="none" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>);
      case "willow": return (<svg style={svgStyle} viewBox="0 0 24 24"><path d="M12 2v10M12 12c0 4-4 8-8 8M12 12c0 4 4 8 8 8" /></svg>);
      case "strobe": return <svg style={svgStyle} viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>;
    }
  };

  return (
    <>
      {/* Định nghĩa Keyframes ngay trong component */}
      <style>{`
        @keyframes slideUpControl {
          0% {
            transform: translate(-50%, 100px); /* Bắt đầu ở dưới đáy */
            opacity: 0;
          }
          100% {
            transform: translate(-50%, 0); /* Trượt lên vị trí chuẩn */
            opacity: 1;
          }
        }
      `}</style>
      
      <div style={containerStyle}>
        {types.map((type) => (
          <button key={type} onClick={() => onLaunch(type)} style={btnStyle} title={type}>{getIcon(type)}</button>
        ))}
        <div style={{ width: 1, background: 'rgba(255,255,255,0.2)' }}></div>
        <button 
          onClick={onMix}
          style={{...btnStyle, background: 'linear-gradient(45deg, #FF4500, #FFD700)', fontWeight: 'bold', fontSize: '10px', color: 'white', border: 'none'}}
        >MIX</button>
      </div>
    </>
  );
};

// --- 3. MAIN COMPONENT ---
interface FireworksHandle { launch: (type: FireworkType) => void; triggerMix: () => void; }
interface FireworksCanvasProps { audioEnabled: boolean; onStatusChange?: (isActive: boolean) => void; }

const FireworksCanvas = forwardRef<FireworksHandle, FireworksCanvasProps>(
  ({ audioEnabled, onStatusChange }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fireworksRef = useRef<Firework[]>([]);
    const audioContextRef = useRef<AudioContext | null>(null);
    const audioBuffersRef = useRef<AudioBuffer[]>([]);
    const stopTimerRef = useRef<number | null>(null);
    const isActiveRef = useRef(false);

    useEffect(() => {
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      if (!AC) return;
      const ctx = new AC(); audioContextRef.current = ctx;
      const loadAllAudio = async () => {
        const buffers: AudioBuffer[] = [];
        for (const url of FIREWORK_AUDIO_URLS) {
            try {
                const response = await fetch(url);
                const arrayBuffer = await response.arrayBuffer();
                const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
                buffers.push(audioBuffer);
            } catch (e) {}
        }
        audioBuffersRef.current = buffers;
      };
      loadAllAudio();
      return () => { if (ctx.state !== "closed") ctx.close(); };
    }, []);

    const playSound = () => {
      const buffers = audioBuffersRef.current;
      if (!audioEnabled || !audioContextRef.current || buffers.length === 0) return;
      const ctx = audioContextRef.current; if (ctx.state === "suspended") ctx.resume();
      try {
        const src = ctx.createBufferSource();
        src.buffer = buffers[Math.floor(Math.random() * buffers.length)];
        const gain = ctx.createGain(); src.playbackRate.value = 0.9 + Math.random() * 0.2;
        gain.gain.value = 0.3; src.connect(gain); gain.connect(ctx.destination); src.start(0);
        return { source: src, gainNode: gain };
      } catch (e) { return undefined; }
    };

    const markActive = () => {
      if (stopTimerRef.current) { window.clearTimeout(stopTimerRef.current); stopTimerRef.current = null; }
      if (!isActiveRef.current) { isActiveRef.current = true; if (onStatusChange) onStatusChange(true); }
    };

    const createFirework = (w: number, h: number, forcedType?: FireworkType): Firework => {
      const startX = random(w * 0.1, w * 0.9); const targetY = random(h * 0.1, h * 0.5); const audio = playSound();
      let type = forcedType || "sphere";
      if (!forcedType) {
        const r = Math.random();
        if (r > 0.85) type = "willow"; else if (r > 0.7) type = "ring"; else if (r > 0.55) type = "star"; else if (r > 0.4) type = "heart"; else if (r > 0.3) type = "strobe";
      }
      let color = THEME_COLORS[Math.floor(Math.random() * THEME_COLORS.length)];
      if (type === "heart") { color = Math.random() > 0.5 ? "#FF1493" : "#FF69B4"; }

      return {
        x: startX, y: h, targetY, vx: (w / 2 - startX) * 0.003 + random(-0.5, 0.5), vy: random(-11, -17),
        color: color, type, particles: [], exploded: false, dead: false, audioSource: audio?.source, audioGain: audio?.gainNode
      };
    };

    const createParticles = (x: number, y: number, color: string, type: FireworkType): Particle[] => {
      const particles: Particle[] = [];
      let count = 100;
      if (type === "willow") count = 150; else if (type === "ring") count = 60; else if (type === "star") count = 90; else if (type === "heart") count = 120;

      for (let i = 0; i < count; i++) {
        let vx = 0, vy = 0, decay = random(0.015, 0.03), gravity = 0.08, drag = 0.96;
        if (type === "star") {
            const vertices = 10; const baseAngle = (Math.PI * 2 / vertices) * (i % vertices) - (Math.PI / 2);
            const isSpike = (i % vertices) % 2 === 0; const speed = isSpike ? random(7, 8.5) : random(2, 3);
            const finalAngle = baseAngle + random(-0.1, 0.1); vx = Math.cos(finalAngle) * speed; vy = Math.sin(finalAngle) * speed; drag = 0.95;
        } else if (type === "heart") {
            const t = (Math.PI * 2 * i) / count; const scale = 0.35;
            const xx = 16 * Math.pow(Math.sin(t), 3); const yy = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));
            vx = xx * scale + random(-0.2, 0.2); vy = yy * scale + random(-0.2, 0.2); gravity = 0.06; decay = random(0.01, 0.02);
        } else if (type === "ring") {
          const a = (Math.PI * 2 * i) / count; const s = 6; vx = Math.cos(a) * s; vy = Math.sin(a) * s;
        } else if (type === "willow") { 
             const a = random(0, Math.PI * 2); const s = random(1, 8); vx = Math.cos(a) * s; vy = Math.sin(a) * s;
             decay = random(0.005, 0.015); gravity = 0.03; drag = 0.92; color = "#E6BE8A";
        } else {
          const a = random(0, Math.PI * 2); const s = random(1, 8); vx = Math.cos(a) * s; vy = Math.sin(a) * s;
        }
        particles.push({ x, y, vx, vy, alpha: 1, color, decay, gravity, drag });
      }
      return particles;
    };

    const triggerMixSequence = useCallback(() => {
        if (!canvasRef.current) return;
        const types: FireworkType[] = ["sphere", "ring", "star", "heart", "willow", "strobe"];
        types.forEach((t, i) => {
            setTimeout(() => {
                if (canvasRef.current) {
                    fireworksRef.current.push(createFirework(canvasRef.current.width, canvasRef.current.height, t));
                    markActive();
                }
            }, i * 250);
        });
    }, []);

    // --- AUTO MIX 7S ---
    useEffect(() => {
        const intervalId = setInterval(() => {
            if (isMainEvent(new Date())) { triggerMixSequence(); }
        }, 7000);
        return () => clearInterval(intervalId);
    }, [triggerMixSequence]);

    useEffect(() => {
      const canvas = canvasRef.current; if (!canvas) return;
      const ctx = canvas.getContext("2d"); if (!ctx) return;
      let frameId: number;
      const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
      window.addEventListener("resize", resize); resize();

      const loop = () => {
        ctx.globalCompositeOperation = "destination-out";
        ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalCompositeOperation = "lighter";

        if (fireworksRef.current.length === 0 && isActiveRef.current && !stopTimerRef.current) {
            stopTimerRef.current = window.setTimeout(() => {
                isActiveRef.current = false;
                if (onStatusChange) onStatusChange(false);
                stopTimerRef.current = null;
            }, 2000);
        }

        for (let i = fireworksRef.current.length - 1; i >= 0; i--) {
          const fw = fireworksRef.current[i];
          if (!fw.exploded) {
            fw.x += fw.vx; fw.y += fw.vy; fw.vy += 0.15;
            ctx.beginPath(); ctx.arc(fw.x, fw.y, 3, 0, Math.PI * 2);
            ctx.fillStyle = fw.color; ctx.fill();
            if (fw.vy >= 0 || fw.y <= fw.targetY) {
              fw.exploded = true; fw.particles = createParticles(fw.x, fw.y, fw.color, fw.type);
            }
          } else {
            for (let j = fw.particles.length - 1; j >= 0; j--) {
              const p = fw.particles[j];
              p.x += p.vx; p.y += p.vy; p.vy += p.gravity;
              p.vx *= p.drag; p.vy *= p.drag; p.alpha -= p.decay;
              if (p.alpha <= 0) fw.particles.splice(j, 1);
            }
            if (fw.particles.length > 0) {
              ctx.fillStyle = fw.color;
              for (const p of fw.particles) {
                ctx.globalAlpha = p.alpha; ctx.beginPath(); ctx.arc(p.x, p.y, 2, 0, Math.PI * 2); ctx.fill();
              }
              ctx.globalAlpha = 1;
            } else { fw.dead = true; }
          }
          if (fw.dead) { fireworksRef.current.splice(i, 1); }
        }
        frameId = requestAnimationFrame(loop);
      };
      loop();
      return () => { window.removeEventListener("resize", resize); cancelAnimationFrame(frameId); };
    }, [audioEnabled]);

    useImperativeHandle(ref, () => ({
      launch: (type: FireworkType) => {
        if (canvasRef.current) {
          fireworksRef.current.push(createFirework(canvasRef.current.width, canvasRef.current.height, type));
          markActive();
        }
      },
      triggerMix: triggerMixSequence
    }));

    const canvasStyle: React.CSSProperties = {
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 50
    };

    return <canvas ref={canvasRef} style={canvasStyle} />;
  }
);

interface FireworksOverlayProps { enableControls?: boolean; onStatusChange?: (isActive: boolean) => void; }
const FireworksOverlay: React.FC<FireworksOverlayProps> = ({ enableControls = true, onStatusChange }) => {
  const fwRef = useRef<FireworksHandle>(null);
  const [interacted, setInteracted] = useState(false);
  useEffect(() => {
    const unlock = () => setInteracted(true);
    window.addEventListener("click", unlock);
    return () => window.removeEventListener("click", unlock);
  }, []);
  
  return (
    <>
      <FireworksCanvas ref={fwRef} audioEnabled={interacted} onStatusChange={onStatusChange} />
      <Controls 
        onLaunch={(t) => fwRef.current?.launch(t)} 
        onMix={() => fwRef.current?.triggerMix()}
        visible={enableControls} 
      />
    </>
  );
};

export default FireworksOverlay;