
"use client"

import * as React from "react"

export function GridBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Apple-style gradient background */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.05) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(139, 92, 246, 0.08) 0%, transparent 50%),
            linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0f0f0f 100%)
          `,
        }}
      />
      
      {/* Subtle mesh overlay */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.02) 1px, transparent 1px)
          `,
          backgroundSize: "32px 32px",
        }}
      />
      
      {/* Enhanced floating orbs with dynamic movement */}
      <div className="floating-orb-1 absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-full blur-3xl" />
      <div className="floating-orb-2 absolute top-3/4 right-1/4 w-96 h-96 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full blur-3xl" />
      <div className="floating-orb-3 absolute bottom-1/4 left-1/3 w-48 h-48 bg-gradient-to-br from-white/5 to-gray-500/5 rounded-full blur-2xl" />
      
      {/* Additional smaller floating elements */}
      <div className="floating-particle-1 absolute top-1/3 right-1/3 w-32 h-32 bg-gradient-to-br from-purple-400/8 to-transparent rounded-full blur-2xl" />
      <div className="floating-particle-2 absolute bottom-1/3 left-1/5 w-40 h-40 bg-gradient-to-br from-blue-400/6 to-transparent rounded-full blur-xl" />
      <div className="floating-particle-3 absolute top-1/2 left-1/2 w-24 h-24 bg-gradient-to-br from-white/8 to-transparent rounded-full blur-xl" />
      
      {/* Tiny moving particles */}
      <div className="particle-drift-1 absolute top-[10%] left-[15%] w-2 h-2 bg-purple-400/30 rounded-full blur-sm" />
      <div className="particle-drift-2 absolute top-[60%] right-[20%] w-1.5 h-1.5 bg-blue-400/25 rounded-full blur-sm" />
      <div className="particle-drift-3 absolute bottom-[30%] left-[70%] w-2.5 h-2.5 bg-white/20 rounded-full blur-sm" />
      <div className="particle-drift-4 absolute top-[80%] left-[40%] w-1 h-1 bg-purple-300/35 rounded-full blur-sm" />
      <div className="particle-drift-5 absolute top-[25%] right-[45%] w-1.5 h-1.5 bg-blue-300/30 rounded-full blur-sm" />
      
      {/* Orbital elements */}
      <div className="orbital-element-1 absolute top-1/2 left-1/2 w-80 h-80 border border-purple-500/5 rounded-full" />
      <div className="orbital-element-2 absolute top-1/2 left-1/2 w-120 h-120 border border-blue-500/3 rounded-full" />
      
      {/* Subtle grain texture */}
      <div 
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  )
}
