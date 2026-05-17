import React from 'react';
import { PlayCircle, FileText, ChevronRight } from 'lucide-react';

export default function Header({ scrollToForm }: { scrollToForm: () => void }) {
  return (
    <header className="fixed top-0 left-0 w-full bg-white/90 backdrop-blur-md z-50 border-b border-slate-100 shadow-sm">
      <div className="max-w-[1440px] mx-auto px-6 h-20 flex items-center justify-between">
         <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center p-1 border border-slate-100">
              <img src="/logo-benh-vien-trung-uong-hue-compressed.webp" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div className="hidden md:block">
              <h1 className="text-[15px] font-black text-blue-900 leading-none uppercase tracking-tight">CHƯƠNG TRÌNH TẦM SOÁT UNG THƯ TUYẾN TIỀN LIỆT 2026</h1>
              <p className="text-[11px] font-bold text-blue-500 uppercase tracking-widest mt-1">Bệnh viện Trung ương Huế</p>
            </div>
         </div>

         <div className="flex items-center gap-6">
            <nav className="hidden lg:flex items-center gap-6">
               <button className="text-[13px] font-bold text-slate-500 hover:text-blue-600 transition-colors flex items-center gap-2"><PlayCircle size={18}/> Xem quy trình sàng lọc</button>
               <button className="text-[13px] font-bold text-slate-500 hover:text-blue-600 transition-colors flex items-center gap-2"><FileText size={18}/> Thông tin truyền thông</button>
            </nav>
            <button 
              onClick={scrollToForm}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-black text-[13px] hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center gap-2"
            >
               Đăng ký ngay <ChevronRight size={16} />
            </button>
         </div>
      </div>
    </header>
  );
}
