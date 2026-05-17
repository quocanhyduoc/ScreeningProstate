import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { AlertCircle } from 'lucide-react';

export default function ReportsTab({ registrations, stats, role, userPermissions }: any) {
   // Calculate risk distributions
   const hasRisk = registrations.filter((r: any) => r.family_history).length;
   const noRisk = registrations.length - hasRisk;
   const pieData = [
      { name: 'Có tiền sử GD', value: hasRisk, color: '#ef4444' },
      { name: 'Không có tiền sử', value: noRisk, color: '#3b82f6' }
   ];

   const districts = registrations.reduce((acc: any, r: any) => {
      acc[r.district] = (acc[r.district] || 0) + 1;
      return acc;
   }, {});

   const barData = Object.keys(districts).map(d => ({ name: d, 'Bệnh nhân': districts[d] })).sort((a, b) => b['Bệnh nhân'] - a['Bệnh nhân']).slice(0, 5);

   const statusDistribution = [
      { name: 'Đã chốt', value: stats?.confirmed_registrations || 0, color: '#22c55e' },
      { name: 'Đã hủy', value: stats?.cancelled_registrations || 0, color: '#94a3b8' },
      { name: 'Chờ duyệt', value: stats?.pending_registrations || 0, color: '#f59e0b' }
   ];

   const isAuthorized = role === 'SUPERADMIN' || userPermissions.includes('reports');

   return (
      <div className="space-y-6">
         <div className="grid grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm h-[350px]">
               <h4 className="text-[12px] font-black uppercase tracking-widest text-slate-500 mb-6">Trạng thái Lịch hẹn</h4>
               <ResponsiveContainer width="100%" height="80%">
                  <PieChart>
                     <Pie data={statusDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                        {statusDistribution.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                     </Pie>
                     <Tooltip />
                     <Legend />
                  </PieChart>
               </ResponsiveContainer>
            </div>
            {isAuthorized && (
               <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm h-[350px]">
                  <h4 className="text-[12px] font-black uppercase tracking-widest text-slate-500 mb-6">Tỷ lệ yếu tố nguy cơ</h4>
                  <ResponsiveContainer width="100%" height="80%">
                     <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                           {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                        </Pie>
                        <Tooltip />
                        <Legend />
                     </PieChart>
                  </ResponsiveContainer>
               </div>
            )}
            <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm h-[350px]">
               <h4 className="text-[12px] font-black uppercase tracking-widest text-slate-500 mb-6">Phân bố theo Quận/Huyện</h4>
               <ResponsiveContainer width="100%" height="80%">
                  <BarChart data={barData}>
                     <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
                     <YAxis fontSize={10} tickLine={false} axisLine={false} />
                     <Tooltip cursor={{fill: 'transparent'}} />
                     <Bar dataKey="Bệnh nhân" fill="#0067b8" radius={[4,4,0,0]} barSize={30} />
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* High Risk Alerts */}
         <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h4 className="text-[14px] font-black uppercase tracking-widest text-red-600 mb-4 flex items-center gap-2"><AlertCircle size={16}/> Bệnh nhân nguy cơ cao (Cần chú ý)</h4>
            <div className="space-y-3">
               {registrations.filter((r: any) => r.family_history).slice(0,5).map((r: any) => (
                  <div key={r.id} className="bg-white p-4 rounded-lg border border-red-100 flex items-center justify-between">
                     <div>
                        <p className="font-bold text-[14px]">{r.full_name}</p>
                        <p className="text-[11px] text-slate-500">Mã: #{r.registration_number}</p>
                     </div>
                     <span className="px-3 py-1 bg-red-100 text-red-600 rounded-md text-[10px] font-black uppercase">Có tiền sử GD</span>
                  </div>
               ))}
               {registrations.filter((r: any) => r.family_history).length === 0 && <p className="text-[12px] text-slate-500 font-medium italic">Không có dữ liệu nguy cơ cao.</p>}
            </div>
         </div>
      </div>
   );
}
