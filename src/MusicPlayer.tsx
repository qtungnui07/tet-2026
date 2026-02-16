import React, { useState, useRef, useEffect } from "react";

const PLAYLIST = [
  // Ưu tiên nhạc Tết lên đầu
  { title: "Như Hoa Mùa Xuân", src: "/Như Hoa Mùa Xuân.mp3" },
  
  // Danh sách còn lại
  { title: "Chúng Ta Của Tương Lai", src: "/Chúng Ta Của Tương Lai.mp3" },
  { title: "Có Đôi Điều", src: "/Có Đôi Điều.mp3" },
  { title: "2AM", src: "/2AM.mp3" },
  { title: "Hơi Ảo #8 - Lucin3x", src: "/Hơi Ảo #8 - Lucin3x.mp3" },
  { title: "In Love", src: "/In Love.mp3" },
  { title: "MONO - EM LÀ (Kirimi Remix)", src: "/MONO - EM LÀ (Kirimi Remix).mp3" },
  { title: "LIFE - Neuro-sama", src: "/LIFE - Neuro-sama (Official Video).mp3" },
  { title: "nếu lúc đó", src: "/nếu lúc đó.mp3" },
  { title: "PARACHUTE", src: "/PARACHUTE.mp3" },
  { title: "PHÓNG ZÌN ZÌN", src: "/PHÓNG ZÌN ZÌN.mp3" },
  { title: "Wrong Times", src: "/Wrong Times.mp3" },

  // --- CÁC FILE TÊN DÀI/TIẾNG NHẬT (Bạn hãy đổi tên file ngắn lại rồi bỏ comment nhé) ---
  { title: "Syn Cole - Feel Good", src: "/Syn Cole - Feel Good ｜ Future House ｜ NCS - Copyright Free Music [q1ULJ92aldE].mp3" },
  { title: "Theres No One At All", src: "/Theres No One At All.mp3" },
  { title: "Travis Scott - FE!N", src: "/Travis Scott - FE!N.mp3" },
  { title: "YOASOBI - Racing Into The Night", src: "/YOASOBI.mp3" },
  { title: "Hello World", src: "/123.mp3" }, 
];
interface MusicPlayerProps {
  visible: boolean;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({ visible }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Fix S7773: Use Number.isNaN
  const formatTime = (time: number) => {
    if (Number.isNaN(time)) return "00:00";
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min < 10 ? "0" + min : min}:${sec < 10 ? "0" + sec : sec}`;
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play().catch(() => {}); // Empty catch is fine here
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
    // Fix S7773: Use Number.parseFloat
    const vol = Number.parseFloat(e.target.value);
    setVolume(vol);
    if (audioRef.current) audioRef.current.volume = vol;
  };

  // Autoplay logic
  useEffect(() => {
    if (audioRef.current) {
        audioRef.current.volume = volume;
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
            playPromise.then(() => setIsPlaying(true)).catch(() => {
                // Fix: Add interaction listener if blocked
                const startAudio = () => {
                    if (audioRef.current) audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
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

  // CSS Styles - BỎ POSITION FIXED để tránh chồng chéo
  const containerStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: '10px', padding: '0 15px',
    height: '52px', borderRadius: '30px',
    background: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(5px)',
    border: '1px solid rgba(255, 215, 0, 0.2)',
    color: '#FFD700', fontFamily: 'Arial, sans-serif', whiteSpace: 'nowrap',
    // Logic ẩn hiện
    opacity: visible ? 1 : 0, 
    pointerEvents: visible ? 'auto' : 'none',
    transition: 'opacity 0.8s ease',
  };

  // Fix S7762: Use .remove()
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .mask-linear-fade { mask-image: linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent); }
    `;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);

  const btnStyle: React.CSSProperties = {
    width: '32px', height: '32px', borderRadius: '50%',
    border: '1px solid rgba(255, 215, 0, 0.3)',
    background: 'rgba(50, 0, 0, 0.4)', cursor: 'pointer',
    color: '#FFD700', display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 0, margin: 0
  };

  const titleStyle: React.CSSProperties = { fontSize: '12px', fontWeight: 'bold', color: '#FFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' };
  const timeStyle: React.CSSProperties = { fontSize: '10px', color: '#DDD', marginTop: '2px' };

  // SVG Icons
  const iconPrev = <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>;
  const iconNext = <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>;
  const iconPlay = <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>;
  const iconPause = <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>;
  const iconVol = <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>;

  return (
    <div style={containerStyle}>
      {/* Fix S4084: Add track for accessibility */}
      <audio 
        ref={audioRef} 
        src={PLAYLIST[currentTrack].src}
        onTimeUpdate={() => audioRef.current && setCurrentTime(audioRef.current.currentTime)}
        onLoadedMetadata={() => audioRef.current && setDuration(audioRef.current.duration)}
      >
        <track kind="captions" src="" label="English" />
      </audio>

      <div style={{ display: 'flex', gap: '5px' }}>
        <button onClick={prevTrack} style={btnStyle} title="Previous">{iconPrev}</button>
        <button onClick={togglePlay} style={{ ...btnStyle, background: 'rgba(255, 69, 0, 0.8)', border: 'none', color: 'white' }} title="Play/Pause">
          {isPlaying ? iconPause : iconPlay}
        </button>
        <button onClick={nextTrack} style={btnStyle} title="Next">{iconNext}</button>
      </div>

      <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.2)', margin: '0 5px' }}></div>

      <div style={{ display: 'flex', flexDirection: 'column', width: '130px', overflow: 'hidden' }}>
        <div style={titleStyle}>{PLAYLIST[currentTrack].title}</div>
        <div style={timeStyle}>{formatTime(currentTime)} / {formatTime(duration)}</div>
      </div>

      <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.2)', margin: '0 5px' }}></div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
        <div style={{color: '#FFD700'}}>{iconVol}</div>
        <input type="range" min="0" max="1" step="0.05" value={volume} onChange={handleVolumeChange} style={{ width: '50px', cursor: 'pointer' }} title="Volume" />
      </div>
    </div>
  );
};

export default MusicPlayer;