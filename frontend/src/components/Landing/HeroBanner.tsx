import React from 'react';
import { ShieldCheck, Plus, Check } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HeroBanner() {
  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6 md:py-8">
      {/* Main Banner Container */}
      <div className="relative w-full bg-gradient-to-br from-blue-50/80 via-white to-sky-100/50 rounded-3xl border border-blue-100/60 shadow-2xl shadow-blue-100/30 overflow-hidden p-6 md:p-12 lg:p-16 flex flex-col lg:flex-row gap-12 items-center">
        
        {/* Background Glowing/Decor elements */}
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[60%] bg-blue-400/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[50%] bg-sky-300/10 rounded-full blur-[100px] pointer-events-none" />
        
        {/* Medical Grid/Lines abstract overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay z-0" style={{
          backgroundImage: `radial-gradient(circle, #0b3c82 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }} />

        {/* Hospital Banner Background Image with 15-20% Opacity */}
        <img 
          src="/banner-BVQT.jpg" 
          alt="Bệnh viện Quốc tế Banner Background" 
          className="absolute inset-0 w-full h-full object-cover opacity-[0.18] pointer-events-none z-0"
        />

        {/* LEFT COLUMN: Title and Target Audience */}
        <div className="w-full lg:w-7/12 space-y-8 relative z-10">
          <div className="space-y-3">
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-lg md:text-xl font-black font-display text-prostate-navy uppercase tracking-wider leading-none"
            >
              CHƯƠNG TRÌNH
            </motion.p>
            <motion.h2 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-black font-display text-prostate-orange uppercase tracking-tight leading-none drop-shadow-[0_2px_4px_rgba(255,85,0,0.1)]"
            >
              TẦM SOÁT UNG THƯ
            </motion.h2>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-4xl md:text-5xl lg:text-6xl font-black font-display text-prostate-orange uppercase tracking-tight leading-none"
            >
              TUYẾN TIỀN LIỆT
            </motion.h2>
          </div>

          {/* Target Audience Card (Enhanced Visual Prominence) */}
          <motion.div 
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="w-full max-w-xl rounded-2xl border-[3px] border-prostate-navy/30 bg-white overflow-hidden shadow-2xl shadow-prostate-navy/15"
          >
            {/* Card Header */}
            <div className="bg-gradient-to-r from-prostate-orange to-orange-500 px-6 py-4 flex items-center gap-3 text-white">
              <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0">
                <Plus size={18} strokeWidth={3} />
              </div>
              <h3 className="font-display font-black text-base sm:text-lg uppercase tracking-wide leading-none">Đối tượng tham gia</h3>
            </div>
            
            {/* Card Body */}
            <div className="p-6 space-y-5 text-slate-700 bg-gradient-to-b from-white to-blue-50/10">
              <div className="flex items-start gap-4">
                <div className="w-6 h-6 rounded-full bg-prostate-orange/10 flex items-center justify-center text-prostate-orange shrink-0 mt-0.5 border border-prostate-orange/20">
                  <Check size={14} strokeWidth={3} />
                </div>
                <p className="text-base sm:text-lg font-black leading-snug text-slate-800">
                  Nam giới <span className="text-prostate-navy font-black underline underline-offset-4 decoration-2 decoration-prostate-orange text-lg sm:text-xl">trên 50</span> tuổi.
                </p>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-6 h-6 rounded-full bg-prostate-orange/10 flex items-center justify-center text-prostate-orange shrink-0 mt-0.5 border border-prostate-orange/20">
                  <Check size={14} strokeWidth={3} />
                </div>
                <div className="space-y-1.5">
                  <p className="text-base sm:text-lg font-black leading-snug text-slate-800">
                    Nam giới <span className="text-prostate-navy font-black underline underline-offset-4 decoration-2 decoration-prostate-orange text-lg sm:text-xl">trên 45</span> tuổi.
                  </p>
                  <p className="text-sm sm:text-base text-slate-500 font-extrabold leading-relaxed">
                    Có bố hoặc anh/em trai ruột mắc ung thư tuyến tiền liệt.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* RIGHT COLUMN: Surgical Graphic / 3D Shield */}
        <div className="w-full lg:w-5/12 flex items-center justify-center relative z-10 min-h-[250px] lg:min-h-[350px]">
          {/* Medical Pulse background SVG */}
          <div className="absolute inset-0 flex items-center justify-center opacity-25">
            <svg className="w-72 h-72 text-blue-500 animate-pulse" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 3"/>
              <circle cx="50" cy="50" r="35" stroke="currentColor" strokeWidth="0.5" />
              <path d="M10 50H30L35 30L45 70L52 45L58 55L62 50H90" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          {/* Prostate stylized glowing node */}
          <div className="absolute w-36 h-36 bg-prostate-orange/10 rounded-full blur-2xl animate-pulse" />

          {/* Floating 3D-like "Miễn Phí" Shield */}
          <div className="relative z-10 animate-float">
            {/* Glow backing */}
            <div className="absolute inset-0 bg-blue-600/30 rounded-[30px] blur-2xl opacity-70 scale-95" />
            
            {/* Outer shield structure */}
            <div className="relative w-44 h-48 sm:w-48 sm:h-52 bg-gradient-to-b from-[#3b82f6] via-[#1d4ed8] to-[#1e3a8a] text-white flex flex-col items-center justify-center border-[4px] border-blue-200 shadow-2xl"
                 style={{
                   clipPath: 'polygon(50% 0%, 100% 15%, 100% 75%, 50% 100%, 0% 75%, 0% 15%)',
                   filter: 'drop-shadow(0px 10px 20px rgba(30, 58, 138, 0.4))'
                 }}>
              
              {/* Inner metallic highlight shield */}
              <div className="absolute inset-1.5 bg-gradient-to-b from-[#60a5fa] via-[#2563eb] to-[#172554]"
                   style={{
                     clipPath: 'polygon(50% 0%, 100% 15%, 100% 75%, 50% 100%, 0% 75%, 0% 15%)',
                   }} />
              
              {/* Shield contents */}
              <div className="relative z-10 flex flex-col items-center text-center px-4 space-y-1">
                <ShieldCheck size={36} className="text-blue-100 drop-shadow-md" />
                <span className="font-display font-black text-2xl sm:text-3xl tracking-tight leading-none uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]">
                  Miễn
                </span>
                <span className="font-display font-black text-3xl sm:text-4xl tracking-tight leading-none uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)] text-blue-100">
                  Phí
                </span>
              </div>

              {/* Shine overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent pointer-events-none" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
