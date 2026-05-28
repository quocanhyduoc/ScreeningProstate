import React from 'react';
import { MapPin, Clock, AlertCircle } from 'lucide-react';

interface EventSidebarProps {
   step: number;
   STEPS: any[];
}

export default function EventSidebar({ step, STEPS }: EventSidebarProps) {
   return (
      <div className="lg:col-span-4 space-y-8 lg:sticky lg:top-24">
         {/* Event Info Box */}
         <div className="bg-prostate-navy rounded-2xl p-8 text-white shadow-2xl shadow-blue-900/10 space-y-6">
            <div className="space-y-6">
               {/* Location */}
               <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0 border border-white/10">
                     <MapPin size={20} />
                  </div>
                  <div>
                     <p className="text-[11px] font-black uppercase tracking-widest text-blue-200 mb-1">Địa điểm tầm soát</p>
                     <p className="text-lg font-black font-display leading-tight">Bệnh viện Quốc tế Trung ương Huế</p>
                     <p className="text-[13px] font-bold opacity-80 mt-1 leading-normal">
                        Tầng 1, số 03 Ngô Quyền, Phường Thuận Hoá, TP. Huế
                     </p>
                  </div>
               </div>
               
               {/* Time */}
               <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0 border border-white/10">
                     <Clock size={20} />
                  </div>
                  <div>
                     <p className="text-[11px] font-black uppercase tracking-widest text-blue-200 mb-1">Thời gian thực hiện</p>
                     <p className="text-xl font-black font-display leading-tight">Ngày 30 - 31/05/2026</p>
                     
                     <div className="flex flex-col gap-2 mt-3">
                        <div className="bg-white/5 px-4 py-2 rounded-xl border border-white/10">
                           <p className="text-[9px] font-black uppercase tracking-widest text-blue-200 leading-none">Buổi Sáng</p>
                           <p className="text-[15px] font-black font-display mt-0.5">07:00 - 12:30</p>
                        </div>
                        <div className="bg-white/5 px-4 py-2 rounded-xl border border-white/10">
                           <p className="text-[9px] font-black uppercase tracking-widest text-blue-200 leading-none">Buổi Chiều</p>
                           <p className="text-[15px] font-black font-display mt-0.5">13:00 - 16:00</p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* Eligibility Highlight */}
         <div className="bg-white rounded-2xl p-6 border-2 border-blue-100 shadow-xl shadow-blue-50/40 space-y-5">
            <h3 className="text-lg font-black text-prostate-navy font-display tracking-tight flex items-center gap-2.5 uppercase">
               <AlertCircle className="text-prostate-orange" size={24} /> ĐỐI TƯỢNG THAM GIA
            </h3>
            
            <div className="space-y-4">
               {/* 50+ */}
               <div className="p-4 bg-orange-50/60 rounded-xl border-l-4 border-prostate-orange shadow-sm">
                  <p className="text-[14px] sm:text-base font-bold text-slate-700 leading-snug">
                     1. Nam giới độ tuổi <br />
                     <span className="text-2xl font-black text-prostate-orange font-display uppercase tracking-tight">≥ 50 TUỔI</span>
                  </p>
               </div>
               
               {/* 45+ family history */}
               <div className="p-4 bg-blue-50/50 rounded-xl border-l-4 border-prostate-navy shadow-sm">
                  <p className="text-[14px] sm:text-base font-bold text-slate-700 leading-snug">
                     2. Nam giới <span className="text-lg font-black text-prostate-navy font-display uppercase">≥ 45 TUỔI</span> <br />
                     <span className="text-[13px] text-slate-500 font-bold">Có bố hoặc anh/em trai ruột mắc ung thư tuyến tiền liệt.</span>
                  </p>
               </div>
            </div>
            
            <p className="text-[11px] text-slate-400 font-bold italic leading-relaxed">
               * Lưu ý: Chương trình dành cho người chưa có chẩn đoán ung thư trước đó.
            </p>
         </div>

      </div>
   );
}
