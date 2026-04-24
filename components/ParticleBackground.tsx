"use client";

import { useEffect, useRef } from "react";

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
      {/* Orb 1: Emerald/Mint */}
      <div 
        ref={orb1Ref}
        className="absolute w-[600px] h-[600px] sm:w-[800px] sm:h-[800px] rounded-full bg-emerald-400/20 blur-[100px] sm:blur-[140px] mix-blend-multiply will-change-transform"
        style={{ top: '-10%', left: '10%' }}
      />
      
      {/* Orb 2: Deep Blue */}
      <div 
        ref={orb2Ref}
        className="absolute w-[500px] h-[500px] sm:w-[700px] sm:h-[700px] rounded-full bg-blue-400/15 blur-[100px] sm:blur-[120px] mix-blend-multiply will-change-transform"
        style={{ top: '30%', right: '-10%' }}
      />

      {/* Orb 3: Yellow/Gold */}
      <div 
        ref={orb3Ref}
        className="absolute w-[600px] h-[600px] sm:w-[900px] sm:h-[900px] rounded-full bg-yellow-300/20 blur-[100px] sm:blur-[150px] mix-blend-multiply will-change-transform"
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
