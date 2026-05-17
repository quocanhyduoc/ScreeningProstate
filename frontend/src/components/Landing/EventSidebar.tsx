import React from 'react';
import { MapPin, Clock, AlertCircle, CheckCircle } from 'lucide-react';

interface EventSidebarProps {
   step: number;
   STEPS: any[];
}

export default function EventSidebar({ step, STEPS }: EventSidebarProps) {
   return (
      <div className="lg:col-span-4 space-y-8 lg:sticky lg:top-24">
         {/* Event Info Box */}
         <div className="bg-blue-700 rounded-2xl p-10 text-white shadow-2xl shadow-blue-200 space-y-8">
            <div className="space-y-6">
               <div className="flex items-start gap-5">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0 border border-white/20"><MapPin size={24} /></div>
                  <div>
                     <p className="text-[13px] font-black uppercase tracking-widest text-blue-100 mb-2">Địa điểm tầm soát</p>
                     <p className="text-xl font-black leading-tight">Bệnh viện Quốc tế Trung ương Huế</p>
                     <p className="text-[15px] font-bold opacity-90 mt-2 leading-relaxed">Tầng 1, số 03 Ngô Quyền, Phường Thuận Hoá, TP. Huế</p>
                  </div>
               </div>
               <div className="flex items-start gap-5">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0 border border-white/20"><Clock size={24} /></div>
                  <div>
                     <p className="text-[13px] font-black uppercase tracking-widest text-blue-100 mb-2">Thời gian thực hiện</p>
                     <p className="text-2xl font-black">Ngày 30-31/05/2026</p>
                     <div className="flex flex-col gap-3 mt-4">
                        <div className="bg-white/10 px-5 py-3 rounded-xl border border-white/20">
                           <p className="text-[11px] font-black uppercase tracking-widest text-blue-100">Sáng</p>
                           <p className="text-[18px] font-black">07:00 - 12:30</p>
                        </div>
                        <div className="bg-white/10 px-5 py-3 rounded-xl border border-white/20">
                           <p className="text-[11px] font-black uppercase tracking-widest text-blue-100">Chiều</p>
                           <p className="text-[18px] font-black">13:00 - 16:00</p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* Eligibility Highlight */}
         <div className="bg-white rounded-2xl p-8 border-4 border-blue-50 shadow-lg space-y-6">
            <h3 className="text-2xl font-black text-blue-900 tracking-tight flex items-center gap-3 uppercase">
               <AlertCircle className="text-orange-500" size={32} /> ĐỐI TƯỢNG THAM GIA
            </h3>
            <div className="space-y-5">
               <div className="p-5 bg-orange-50 rounded-xl border-l-8 border-orange-500 shadow-sm">
                  <p className="text-lg font-black text-orange-900 leading-relaxed">
                     1. Nam giới độ tuổi <br />
                     <span className="text-3xl font-black text-orange-600 underline underline-offset-8 decoration-4 decoration-orange-300 uppercase">≥ 50 TUỔI</span>
                  </p>
               </div>
               <div className="p-5 bg-blue-50 rounded-xl border-l-8 border-blue-600 shadow-sm">
                  <p className="text-lg font-black text-blue-900 leading-relaxed">
                     2. Nam giới <span className="text-2xl font-black text-blue-700 uppercase">≥ 45 TUỔI</span> <br />
                     <span className="text-[16px]">Có tiền sử gia đình mắc ung thư tuyến tiền liệt.</span>
                  </p>
               </div>
            </div>
            <p className="text-[13px] text-slate-500 font-bold italic leading-relaxed">
               * Lưu ý: Chương trình dành cho người chưa có chẩn đoán ung thư trước đó.
            </p>
         </div>

      </div>
   );
}
