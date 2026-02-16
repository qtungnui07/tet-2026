import React, { useState, useRef, useEffect } from "react";

const PLAYLIST = [{ title: "Như Hoa Mùa Xuân", src: "./Như Hoa Mùa Xuân.mp3" },
  { title: "Syn Cole - Feel Good ", src: "./Syn Cole - Feel Good ｜ Future House ｜ NCS - Copyright Free Music [q1ULJ92aldE].mp3" },
  { title: "Happy New Year - ABBA", src: "/music/happy-new-year.mp3" },
];

interface MusicPlayerProps {
  visible: boolean; // Prop để điều khiển ẩn/hiện giao diện
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({ visible }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const audioRef = useRef<HTMLAudioElement>(null);

  const formatTime = (time: number) => {
    if (isNaN(time)) return "00:00";
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min < 10 ? "0" + min : min}:${sec < 10 ? "0" + sec : sec}`;
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play().catch(() => {});
    setIsPlaying(!isPlaying);
  };

  const playTrack = (index: number) => {
    setCurrentTrack(index);
    setIsPlaying(true);
    setTimeout(() => { if (audioRef.current) audioRef.current.play().catch(() => {}); }, 100);
  };

  const nextTrack = () => playTrack((currentTrack + 1) % PLAYLIST.length);
  const prevTrack = () => playTrack((currentTrack - 1 + PLAYLIST.length) % PLAYLIST.length);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    if (audioRef.current) audioRef.current.volume = vol;
  };

  // --- AUTOPLAY LOGIC ---
  useEffect(() => {
    if (audioRef.current) {
        audioRef.current.volume = volume;
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
            playPromise
                .then(() => setIsPlaying(true))
                .catch((e) => {
                    console.log("Autoplay blocked, waiting for interaction", e);
                    // Nếu bị chặn, lắng nghe click đầu tiên để phát
                    const startAudio = () => {
                        audioRef.current?.play();
                        setIsPlaying(true);
                        document.removeEventListener('click', startAudio);
                    };
                    document.addEventListener('click', startAudio);
                });
        }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const handleEnded = () => nextTrack();
    audio.addEventListener("ended", handleEnded);
    return () => audio.removeEventListener("ended", handleEnded);
  }, [currentTrack]);

  // --- STYLES ---
  // Style cho Container: Căn sang TRÁI của tâm màn hình
  const containerStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: '35px',
    right: '51%', // Đẩy sang bên trái một chút so với giữa (50%)
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '0 15px',
    height: '52px',
    borderRadius: '30px',
    background: 'rgba(0, 0, 0, 0.5)',
    backdropFilter: 'blur(5px)',
    border: '1px solid rgba(255, 215, 0, 0.2)',
    color: '#FFD700',
    fontFamily: 'Arial, sans-serif',
    whiteSpace: 'nowrap',
    
    // Logic Ẩn/Hiện
    opacity: visible ? 1 : 0,
    pointerEvents: visible ? 'auto' : 'none',
    transform: visible ? 'translateY(0)' : 'translateY(20px)',
    transition: 'opacity 0.8s ease, transform 0.8s ease',
  };

  // CSS Mobile: Khi màn hình nhỏ, xếp chồng lên trên thanh pháo hoa
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @media (max-width: 768px) {
        .music-player-container {
          right: 50% !important;
          transform: translateX(50%) translateY(${visible ? '-60px' : '20px'}) !important; /* Đẩy lên trên thanh pháo hoa */
          bottom: 40px !important;
        }
      }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, [visible]);

  const btnStyle: React.CSSProperties = {
    width: '32px', height: '32px', borderRadius: '50%',
    border: '1px solid rgba(255, 215, 0, 0.3)',
    background: 'rgba(50, 0, 0, 0.4)', cursor: 'pointer',
    color: '#FFD700', display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 0, margin: 0
  };

  const textContainerStyle: React.CSSProperties = {
    display: 'flex', flexDirection: 'column', width: '130px', overflow: 'hidden'
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '12px', fontWeight: 'bold', color: '#FFF', 
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
  };

  const timeStyle: React.CSSProperties = {
    fontSize: '10px', color: '#DDD', marginTop: '2px'
  };

  const iconPrev = <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>;
  const iconNext = <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>;
  const iconPlay = <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>;
  const iconPause = <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>;
  const iconVol = <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>;

  return (
    <div style={containerStyle} className="music-player-container">
      {/* Audio luôn render để phát nhạc, kể cả khi hidden */}
      <audio 
        ref={audioRef} 
        src={PLAYLIST[currentTrack].src}
        onTimeUpdate={() => audioRef.current && setCurrentTime(audioRef.current.currentTime)}
        onLoadedMetadata={() => audioRef.current && setDuration(audioRef.current.duration)}
      />

      {/* --- GIAO DIỆN ĐIỀU KHIỂN --- */}
      <div style={{ display: 'flex', gap: '5px' }}>
        <button onClick={prevTrack} style={btnStyle} title="Previous">{iconPrev}</button>
        <button 
          onClick={togglePlay} 
          style={{ ...btnStyle, background: 'rgba(255, 69, 0, 0.8)', border: 'none', color: 'white' }} 
          title="Play/Pause"
        >
          {isPlaying ? iconPause : iconPlay}
        </button>
        <button onClick={nextTrack} style={btnStyle} title="Next">{iconNext}</button>
      </div>

      <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.2)', margin: '0 5px' }}></div>

      <div style={textContainerStyle}>
        <div style={titleStyle}>{PLAYLIST[currentTrack].title}</div>
        <div style={timeStyle}>{formatTime(currentTime)} / {formatTime(duration)}</div>
      </div>

      <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.2)', margin: '0 5px' }}></div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
        <div style={{color: '#FFD700'}}>{iconVol}</div>
        <input 
          type="range" min="0" max="1" step="0.05" value={volume} 
          onChange={handleVolumeChange}
          style={{ width: '50px', cursor: 'pointer' }}
          title="Volume"
        />
      </div>
    </div>
  );
};

export default MusicPlayer;