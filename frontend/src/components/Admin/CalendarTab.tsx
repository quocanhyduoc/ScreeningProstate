import React, { useState } from 'react';
import { Calendar, Phone } from 'lucide-react';
import { Badge } from './UIComponents';

export default function CalendarTab({ registrations }: any) {
   const [selectedSlot, setSelectedSlot] = useState<string>('ALL');

   // Get unique slots dynamically
   const uniqueSlots = Array.from(
      new Set(registrations.map((r: any) => r.appointment_slot).filter(Boolean))
   ) as string[];

   // Group by slots
   const slots = registrations.reduce((acc: any, curr: any) => {
      const s = curr.appointment_slot || 'Khác';
      if (!acc[s]) acc[s] = [];
      acc[s].push(curr);
      return acc;
   }, {});

   // Filter active slots based on selection
   const activeSlots = selectedSlot === 'ALL' 
      ? Object.keys(slots) 
      : Object.keys(slots).filter(s => s === selectedSlot);

   return (
      <div className="space-y-6">
         {/* Beautiful Tab/Button Filters for Appointment Slots */}
         <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
               <Calendar size={14} className="text-blue-600"/> Lọc Theo Khung Giờ Khám
            </p>
            <div className="flex flex-wrap gap-2">
               <button
                  onClick={() => setSelectedSlot('ALL')}
                  className={`px-4 py-2 rounded-lg text-[13px] font-bold transition-all shadow-sm ${
                     selectedSlot === 'ALL'
                        ? 'bg-[#0067b8] text-white'
                        : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
               >
                  Tất cả ({registrations.length})
               </button>
               {uniqueSlots.map(slot => {
                  const count = slots[slot]?.length || 0;
                  return (
                     <button
                        key={slot}
                        onClick={() => setSelectedSlot(slot)}
                        className={`px-4 py-2 rounded-lg text-[13px] font-bold transition-all shadow-sm ${
                           selectedSlot === slot
                              ? 'bg-[#0067b8] text-white'
                              : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                        }`}
                     >
                        {slot} ({count})
                     </button>
                  );
               })}
               {slots['Khác'] && (
                  <button
                     onClick={() => setSelectedSlot('Khác')}
                     className={`px-4 py-2 rounded-lg text-[13px] font-bold transition-all shadow-sm ${
                        selectedSlot === 'Khác'
                           ? 'bg-[#0067b8] text-white'
                           : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                     }`}
                  >
                     Khác ({slots['Khác'].length})
                  </button>
               )}
            </div>
         </div>

         {/* Calendar slots grid */}
         <div className="space-y-8">
            {activeSlots.map(slot => (
               <div key={slot} className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                  <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                     <h4 className="font-bold text-[#121C2D] flex items-center gap-2"><Calendar size={18} className="text-blue-600"/> Khung giờ: {slot}</h4>
                     <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-[11px] font-black">{slots[slot].length} bệnh nhân</span>
                  </div>
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                     {slots[slot].map((r: any) => (
                        <div key={r.id} className="p-4 rounded-lg border border-slate-100 hover:border-blue-200 transition-colors bg-white">
                           <div className="flex justify-between items-start mb-3">
                              <span className="text-[18px] font-black text-slate-300">#{r.registration_number?.toString().padStart(3,'0')}</span>
                              <Badge status={r.status} />
                           </div>
                           <p className="font-bold text-[15px]">{r.full_name}</p>
                           <p className="text-[12px] text-slate-500 flex items-center gap-1.5 mt-1"><Phone size={12}/> {r.phone}</p>
                        </div>
                     ))}
                  </div>
               </div>
            ))}
            {activeSlots.length === 0 && (
               <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
                  <p className="text-slate-400 font-bold text-[14px]">Không có khung giờ nào hiển thị</p>
               </div>
            )}
         </div>
      </div>
   );
}
