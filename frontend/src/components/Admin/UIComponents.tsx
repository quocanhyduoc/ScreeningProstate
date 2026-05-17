import React from 'react';
import { ShieldCheck } from 'lucide-react';

export function NavIcon({ icon, label, active, onClick }: any) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 p-3.5 rounded-lg text-[13px] font-bold transition-all ${active ? 'bg-blue-50 text-[#0067b8]' : 'text-slate-500 hover:bg-slate-50'}`}>
      {icon} <span>{label}</span>
    </button>
  );
}

export function StatCard({ label, value, color }: any) {
  return (
    <div className={`p-6 bg-white rounded-lg border shadow-sm ${color}`}>
       <p className="text-[11px] font-black uppercase tracking-widest opacity-60 mb-2">{label}</p>
       <p className="text-3xl font-black tracking-tight">{value || 0}</p>
    </div>
  );
}

export function Tab({ label, active, onClick, count }: any) {
  return (
    <button onClick={onClick} className={`px-5 py-2 rounded-md text-[11px] font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${active ? 'bg-white text-[#0067b8] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
      {label} <span className={`px-1.5 py-0.5 rounded-md text-[9px] ${active ? 'bg-blue-50' : 'bg-slate-200'}`}>{count}</span>
    </button>
  );
}

export function Badge({ status }: any) {
  const config: any = {
    'CHO_XAC_NHAN': { label: 'Chờ duyệt', color: 'bg-orange-50 text-orange-600 border-orange-100' },
    'DA_XAC_NHAN': { label: 'Đã chốt hẹn', color: 'bg-blue-50 text-blue-600 border-blue-100' },
    'CHUA_TIEP_DON': { label: 'Chưa tiếp đón', color: 'bg-slate-100 text-slate-400 border-slate-200' },
    'DA_TIEP_NHAN': { label: 'Đã tiếp đón', color: 'bg-green-50 text-green-600 border-green-100' },
    'CHO_XET_NGHIEM': { label: 'Chờ xét nghiệm', color: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
    'DA_XET_NGHIEM': { label: 'Đã xét nghiệm', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
    'CHO_TU_VAN': { label: 'Chờ tư vấn', color: 'bg-rose-50 text-rose-600 border-rose-100' },
    'HOAN_THANH': { label: 'Hoàn thành', color: 'bg-slate-800 text-white border-slate-900' },
    'HUY': { label: 'Đã hủy', color: 'bg-slate-100 text-slate-500 border-slate-200' },
  };
  const { label, color } = config[status] || { label: status, color: 'bg-slate-100 text-slate-500' };
  return <span className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border whitespace-nowrap ${color}`}>{label}</span>;
}

export function SurveyTag({ label, color }: any) {
   return (
      <div className={`px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${color}`}>
         <ShieldCheck size={12} /> {label}
      </div>
   );
}

export function StatusProgress({ status }: { status: string }) {
   const steps = [
      { key: 'REG', label: 'Hẹn', statuses: ['CHO_XAC_NHAN', 'DA_XAC_NHAN'] },
      { key: 'REC', label: 'Đón', statuses: ['DA_TIEP_NHAN'] },
      { key: 'LAB', label: 'XN', statuses: ['CHO_XET_NGHIEM', 'DA_XET_NGHIEM'] },
      { key: 'CON', label: 'TV', statuses: ['CHO_TU_VAN', 'HOAN_THANH'] },
   ];

   const getStepState = (stepStatuses: string[]) => {
      if (stepStatuses.includes(status)) return 'active';
      // If the current status is further in the steps list, this step is 'done'
      const currentIndex = steps.findIndex(s => s.statuses.includes(status));
      const stepIndex = steps.findIndex(s => s.statuses === stepStatuses);
      if (currentIndex > stepIndex) return 'done';
      return 'pending';
   };

   return (
      <div className="flex items-center gap-1">
         {steps.map((step, i) => {
            const state = getStepState(step.statuses);
            return (
               <React.Fragment key={step.key}>
                  <div title={step.label} className={`w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-black border transition-all ${
                     state === 'active' ? 'bg-blue-600 text-white border-blue-600 shadow-sm scale-110' :
                     state === 'done' ? 'bg-emerald-500 text-white border-emerald-500' :
                     'bg-slate-50 text-slate-300 border-slate-100'
                  }`}>
                     {state === 'done' ? '✓' : step.label}
                  </div>
                  {i < steps.length - 1 && <div className={`w-3 h-[2px] ${getStepState(steps[i+1].statuses) !== 'pending' ? 'bg-emerald-200' : 'bg-slate-100'}`} />}
               </React.Fragment>
            );
         })}
      </div>
   );
}

export function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
       <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-50 border-t-[#0067b8] rounded-full animate-spin" />
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">Loading System...</p>
       </div>
    </div>
  );
}
