import React from 'react';
import { Calendar, Phone } from 'lucide-react';
import { Badge } from './UIComponents';

export default function CalendarTab({ registrations }: any) {
   // Group by slots
   const slots = registrations.reduce((acc: any, curr: any) => {
      const s = curr.appointment_slot || 'Khác';
      if (!acc[s]) acc[s] = [];
      acc[s].push(curr);
      return acc;
   }, {});

   return (
      <div className="space-y-8">
         {Object.keys(slots).map(slot => (
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
      </div>
   );
}
