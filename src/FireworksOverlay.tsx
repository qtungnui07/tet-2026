import React, {
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
  useState,
} from "react";

// --- 1. CONFIG & DATA ---
const LUNAR_NEW_YEAR_2026 = new Date("2026-02-17T00:00:00");
const FIREWORK_AUDIO_URL = "/firework.mp3"; 

const THEME_COLORS = [
  "#FFD700", "#FF4500", "#FF0000", "#FFA500", "#FFFFFF", "#E6BE8A",
];

type FireworkType = "sphere" | "ring" | "willow" | "strobe";

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
const isDailyShow = (date: Date) => date.getHours() === 0 && date.getMinutes() < 30;
const random = (min: number, max: number) => Math.random() * (max - min) + min;

// --- 2. CONTROLS COMPONENT ---
interface ControlsProps {
  onLaunch: (type: FireworkType) => void;
  visible: boolean;
}

const Controls: React.FC<ControlsProps> = ({ onLaunch, visible }) => {
  if (!visible) return null;

  const btnStyle: React.CSSProperties = {
    width: '40px', height: '40px', borderRadius: '50%',
    border: '1px solid rgba(255, 215, 0, 0.3)',
    background: 'rgba(50, 0, 0, 0.6)', cursor: 'pointer',
    color: '#FFD700', display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'transform 0.2s',
  };

  const containerStyle: React.CSSProperties = {
    position: 'fixed', bottom: '30px', left: '50%', transform: 'translateX(-50%)',
    zIndex: 9999, display: 'flex', gap: '10px',
    padding: '10px 20px', borderRadius: '30px',
    background: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(5px)',
    border: '1px solid rgba(255, 215, 0, 0.2)'
  };

  return (
    <div style={containerStyle}>
      {(["sphere", "ring", "willow", "strobe"] as FireworkType[]).map((type) => (
        <button key={type} onClick={() => onLaunch(type)} style={btnStyle} title={type}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: type === 'ring' ? 'transparent' : 'currentColor', border: type === 'ring' ? '2px solid currentColor' : 'none' }}></div>
        </button>
      ))}
      <div style={{ width: 1, background: 'rgba(255,255,255,0.2)' }}></div>
      <button 
        onClick={() => {
          ["sphere", "ring", "willow", "strobe"].forEach((t, i) => setTimeout(() => onLaunch(t as any), i * 300));
        }}
        style={{...btnStyle, background: '#D2691E', fontWeight: 'bold', fontSize: '10px', color: 'white'}}
      >
        MIX
      </button>
    </div>
  );
};

// --- 3. MAIN COMPONENT ---
interface FireworksHandle {
  launch: (type: FireworkType) => void;
}

interface FireworksCanvasProps {
  audioEnabled: boolean;
  onStatusChange?: (isActive: boolean) => void;
}

const FireworksCanvas = forwardRef<FireworksHandle, FireworksCanvasProps>(
  ({ audioEnabled, onStatusChange }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fireworksRef = useRef<Firework[]>([]);
    const audioContextRef = useRef<AudioContext | null>(null);
    const audioBufferRef = useRef<AudioBuffer | null>(null);
    
    // --- SỬA LỖI Ở ĐÂY: Thay NodeJS.Timeout bằng number ---
    const stopTimerRef = useRef<number | null>(null);
    
    const isActiveRef = useRef(false);

    // Audio Setup
    useEffect(() => {
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      if (!AC) return;
      const ctx = new AC();
      audioContextRef.current = ctx;
      fetch(FIREWORK_AUDIO_URL).then(r=>r.arrayBuffer()).then(b=>ctx.decodeAudioData(b)).then(d=>{audioBufferRef.current=d}).catch(()=>{});
      return () => { if (ctx.state !== "closed") ctx.close(); };
    }, []);

    const playSound = () => {
      if (!audioEnabled || !audioContextRef.current || !audioBufferRef.current) return;
      const ctx = audioContextRef.current;
      if (ctx.state === "suspended") ctx.resume();
      try {
        const src = ctx.createBufferSource(); src.buffer = audioBufferRef.current;
        const gain = ctx.createGain(); src.playbackRate.value = 0.9 + Math.random() * 0.2;
        gain.gain.value = 0.3; src.connect(gain); gain.connect(ctx.destination);
        src.start(0);
        return { source: src, gainNode: gain };
      } catch (e) { return undefined; }
    };

    const markActive = () => {
      if (stopTimerRef.current) {
        clearTimeout(stopTimerRef.current);
        stopTimerRef.current = null;
      }
      
      if (!isActiveRef.current) {
        isActiveRef.current = true;
        if (onStatusChange) onStatusChange(true);
      }
    };

    const createFirework = (w: number, h: number, forcedType?: FireworkType): Firework => {
      const startX = random(w * 0.1, w * 0.9);
      const targetY = random(h * 0.1, h * 0.5);
      const audio = playSound();
      
      let type = forcedType || "sphere";
      if (!forcedType) {
        const r = Math.random();
        if (r > 0.8) type = "willow"; else if (r > 0.6) type = "ring"; else if (r > 0.5) type = "strobe";
      }

      return {
        x: startX, y: h, targetY, vx: (w / 2 - startX) * 0.003 + random(-0.5, 0.5), vy: random(-11, -17),
        color: THEME_COLORS[Math.floor(Math.random() * THEME_COLORS.length)],
        type, particles: [], exploded: false, dead: false, audioSource: audio?.source, audioGain: audio?.gainNode
      };
    };

    const createParticles = (x: number, y: number, color: string, type: FireworkType): Particle[] => {
      const particles: Particle[] = [];
      let count = type === "willow" ? 120 : type === "ring" ? 50 : 80;
      for (let i = 0; i < count; i++) {
        let vx, vy, decay = random(0.015, 0.03), gravity = 0.08, drag = 0.96;
        if (type === "ring") {
          const a = (Math.PI * 2 * i) / count; const s = 6; vx = Math.cos(a) * s; vy = Math.sin(a) * s;
        } else {
          const a = random(0, Math.PI * 2); const s = random(1, 8); vx = Math.cos(a) * s; vy = Math.sin(a) * s;
        }
        if (type === "willow") { decay = random(0.005, 0.015); gravity = 0.03; drag = 0.92; }
        particles.push({ x, y, vx, vy, alpha: 1, color, decay, gravity, drag });
      }
      return particles;
    };

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      let frameId: number;
      const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
      window.addEventListener("resize", resize);
      resize();

      const loop = () => {
        ctx.globalCompositeOperation = "destination-out";
        ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalCompositeOperation = "lighter";

        const now = new Date();
        if ((isMainEvent(now) || isDailyShow(now)) && Math.random() < 0.05 && fireworksRef.current.length < 10) {
           fireworksRef.current.push(createFirework(canvas.width, canvas.height));
           markActive();
        }

        if (fireworksRef.current.length === 0 && isActiveRef.current && !stopTimerRef.current) {
            // setTimeout trả về number trong môi trường browser
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
          if (fw.dead) {
             if(fw.audioGain) try { fw.audioGain.disconnect(); } catch(e){}
             fireworksRef.current.splice(i, 1);
          }
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
      }
    }));

    const canvasStyle: React.CSSProperties = {
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 50
    };

    return <canvas ref={canvasRef} style={canvasStyle} />;
  }
);

interface FireworksOverlayProps {
  enableControls?: boolean;
  onStatusChange?: (isActive: boolean) => void;
}

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
      <Controls onLaunch={(t) => fwRef.current?.launch(t)} visible={enableControls} />
    </>
  );
};

export default FireworksOverlay;