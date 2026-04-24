"use client";

import { useEffect, useState } from "react";

export default function ParticleBackground() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Calculate mouse position relative to center of screen (-1 to 1)
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      setMousePosition({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Orb 1: Emerald/Mint */}
      <div 
        className="absolute w-[600px] h-[600px] sm:w-[800px] sm:h-[800px] rounded-full bg-emerald-400/20 blur-[100px] sm:blur-[140px] mix-blend-multiply transition-transform duration-700 ease-out"
        style={{ 
          top: '-10%', 
          left: '10%',
          transform: `translate(${mousePosition.x * -40}px, ${mousePosition.y * -40}px)` 
        }}
      />
      
      {/* Orb 2: Deep Blue */}
      <div 
        className="absolute w-[500px] h-[500px] sm:w-[700px] sm:h-[700px] rounded-full bg-blue-400/15 blur-[100px] sm:blur-[120px] mix-blend-multiply transition-transform duration-1000 ease-out"
        style={{ 
          top: '30%', 
          right: '-10%',
          transform: `translate(${mousePosition.x * -70}px, ${mousePosition.y * -70}px)` 
        }}
      />

      {/* Orb 3: Yellow/Gold */}
      <div 
        className="absolute w-[600px] h-[600px] sm:w-[900px] sm:h-[900px] rounded-full bg-yellow-300/20 blur-[100px] sm:blur-[150px] mix-blend-multiply transition-transform duration-1000 ease-out"
        style={{ 
          bottom: '-20%', 
          left: '20%',
          transform: `translate(${mousePosition.x * -30}px, ${mousePosition.y * -30}px)` 
        }}
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
