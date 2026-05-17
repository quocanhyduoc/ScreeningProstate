import React from 'react';

export default function Footer() {
   return (
      <footer className="py-12 border-t border-slate-100 bg-white">
         <div className="max-w-[1440px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
               <img src="/logo-benh-vien-trung-uong-hue-compressed.webp" alt="Logo" className="h-12" />
               <div>
                  <p className="text-[14px] font-black text-blue-900 uppercase leading-none mb-1">Bệnh viện Trung ương Huế</p>
                  <p className="text-[11px] text-slate-500 font-black tracking-widest uppercase">© 2026 PROSTATE SCREENING PROGRAM</p>
               </div>
            </div>
            <div className="text-[12px] font-black text-slate-400 uppercase tracking-tight">
               Powered by Department of Urology A - Hue Central Hospital
            </div>
         </div>
      </footer>
   );
}
