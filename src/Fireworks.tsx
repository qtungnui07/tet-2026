import { useEffect, useRef } from 'react';

// --- 1. ĐỊNH NGHĨA CLASS & INTERFACE RA NGOÀI ---
// (Để tránh lỗi "Stateless functional components should not use 'this'")

interface Particle {
  x: number;
  y: number;
  color: string;
  vx: number;
  vy: number;
  alpha: number;
  friction: number;
  gravity: number;
  draw: (ctx: CanvasRenderingContext2D) => void;
  update: () => void;
}

interface Rocket {
  x: number;
  y: number;
  color: string;
  vy: number;
  exploded: boolean;
  draw: (ctx: CanvasRenderingContext2D) => void;
  update: () => void;
  explode: (particles: Particle[]) => void;
}

const colors = ['#ff0000', '#ffa500', '#ffff00', '#ffffff', '#ffcc00'];

class ParticleImpl implements Particle {
  x: number; y: number; color: string; vx: number; vy: number; alpha: number; friction: number; gravity: number;
  
  constructor(x: number, y: number, color: string) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.vx = (Math.random() - 0.5) * 8;
    this.vy = (Math.random() - 0.5) * 8;
    this.alpha = 1;
    this.friction = 0.96;
    this.gravity = 0.05;
  }

  // Truyền ctx vào hàm draw thay vì lấy từ bên ngoài
  draw(ctx: CanvasRenderingContext2D) {
    ctx.save(); // Lưu trạng thái cũ
    ctx.globalAlpha = this.alpha;
    ctx.beginPath();
    ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.restore(); // Khôi phục trạng thái
  }

  update() {
    this.vx *= this.friction;
    this.vy *= this.friction;
    this.vy += this.gravity;
    this.x += this.vx;
    this.y += this.vy;
    this.alpha -= 0.015;
  }
}

class RocketImpl implements Rocket {
  x: number; y: number; color: string; vy: number; exploded: boolean;
  canvasHeight: number;

  constructor(canvasWidth: number, canvasHeight: number) {
    this.x = Math.random() * canvasWidth;
    this.y = canvasHeight;
    this.canvasHeight = canvasHeight; // Lưu lại để dùng nếu cần
    this.color = colors[Math.floor(Math.random() * colors.length)];
    this.vy = -(Math.random() * 5 + 10);
    this.exploded = false;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
  }

  update() {
    this.y += this.vy;
    this.vy += 0.15;
    if (this.vy >= -1 && !this.exploded) {
      this.exploded = true; // Đánh dấu đã nổ để xử lý ở main loop
    }
  }

  // Hàm nổ sẽ nhận mảng particles để đẩy hạt mới vào
  explode(particles: Particle[]) {
    for (let i = 0; i < 60; i++) {
      particles.push(new ParticleImpl(this.x, this.y, this.color));
    }
  }
}

// --- 2. COMPONENT CHÍNH ---
const Fireworks = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    let animationFrameId: number;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Quản lý danh sách đối tượng
    const particles: Particle[] = [];
    const rockets: Rocket[] = [];

    const animate = () => {
      // Tạo hiệu ứng mờ đuôi
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Tạo tên lửa mới ngẫu nhiên
      if (Math.random() < 0.03) {
        rockets.push(new RocketImpl(canvas.width, canvas.height));
      }

      // 2. Xử lý tên lửa
      for (let i = rockets.length - 1; i >= 0; i--) {
        const rocket = rockets[i];
        rocket.update();
        rocket.draw(ctx); // Truyền ctx vào đây

        if (rocket.exploded) {
          rocket.explode(particles); // Truyền mảng particles vào để thêm hạt
          rockets.splice(i, 1); // Xóa tên lửa cũ
        }
      }

      // 3. Xử lý hạt pháo hoa
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.update();
        p.draw(ctx); // Truyền ctx vào đây
        
        if (p.alpha <= 0) {
          particles.splice(i, 1); // Xóa hạt đã tắt
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0 
      }}
    />
  );
};

export default Fireworks;