"use client";

import { useEffect, useRef } from "react";

const CurvedFlow = ({ path, delay, duration }: { path: string; delay: string; duration: string }) => (
  <svg 
    className="absolute inset-0 w-full h-full pointer-events-none opacity-40" 
    viewBox="0 0 1000 1000" 
    preserveAspectRatio="none"
  >
    <defs>
      <linearGradient id={`grad-${delay}`} x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="transparent" />
        <stop offset="50%" stopColor="#3b82f6" />
        <stop offset="100%" stopColor="transparent" />
      </linearGradient>
    </defs>
    <path
      d={path}
      fill="none"
      stroke={`url(#grad-${delay})`}
      strokeWidth="2"
      strokeLinecap="round"
      className="animate-svg-flow"
      style={{ 
        '--delay': delay,
        '--duration': duration
      } as any}
    />
  </svg>
);

export default function ParticleBackground() {
  const orb1Ref = useRef<HTMLDivElement>(null);
  const orb2Ref = useRef<HTMLDivElement>(null);
  const orb3Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let animationFrameId: number;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      targetX = (e.clientX / window.innerWidth) * 2 - 1;
      targetY = (e.clientY / window.innerHeight) * 2 - 1;
    };

    const animate = () => {
      currentX += (targetX - currentX) * 0.05;
      currentY += (targetY - currentY) * 0.05;

      if (orb1Ref.current) orb1Ref.current.style.transform = `translate(${currentX * -150}px, ${currentY * -150}px)`;
      if (orb2Ref.current) orb2Ref.current.style.transform = `translate(${currentX * -250}px, ${currentY * -250}px)`;
      if (orb3Ref.current) orb3Ref.current.style.transform = `translate(${currentX * -100}px, ${currentY * -100}px)`;

      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", handleMouseMove);
    animate();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Curved Flow Lines - Weaving around content */}
      
      {/* Path 1: Top Curve (dips down between elements) */}
      <CurvedFlow path="M 0 100 Q 250 50 500 100 T 1000 50" delay="0s" duration="12s" />
      
      {/* Path 2: Middle Weave (goes up to avoid hero text, then down) */}
      <CurvedFlow path="M 0 500 Q 150 300 350 400 T 650 600 T 1000 400" delay="3s" duration="18s" />
      
      {/* Path 3: Bottom Curve (curves up slightly) */}
      <CurvedFlow path="M 0 850 Q 300 950 600 850 T 1000 900" delay="7s" duration="15s" />
      
      {/* Path 4: Vertical-ish Weave (from left-mid to right-top) */}
      <CurvedFlow path="M 0 300 C 200 300 400 100 600 300 S 800 500 1000 200" delay="10s" duration="22s" />

      {/* Subtle Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]" />

      {/* Orb 1: Cyan/Aurora */}
      <div 
        ref={orb1Ref}
        className="absolute w-[600px] h-[600px] sm:w-[800px] sm:h-[800px] rounded-full bg-cyan-300/20 blur-[100px] sm:blur-[140px] will-change-transform"
        style={{ top: '-10%', left: '10%' }}
      />
      
      {/* Orb 2: Electric Blue */}
      <div 
        ref={orb2Ref}
        className="absolute w-[500px] h-[500px] sm:w-[700px] sm:h-[700px] rounded-full bg-blue-400/20 blur-[100px] sm:blur-[120px] will-change-transform"
        style={{ top: '30%', right: '-10%' }}
      />
      
      {/* Orb 3: Subtle Indigo (very low opacity) */}
      <div 
        ref={orb3Ref}
        className="absolute w-[600px] h-[600px] sm:w-[900px] sm:h-[900px] rounded-full bg-indigo-400/10 blur-[100px] sm:blur-[150px] will-change-transform"
        style={{ bottom: '-20%', left: '20%' }}
      />

      {/* Noise Texture Overlay for premium frosted look */}
      <div 
        className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}
