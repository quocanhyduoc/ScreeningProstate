import React from 'react';
import { ShieldCheck, Users, Zap } from 'lucide-react';

function HighlightCard({ icon, title, desc, color }: any) {
  return (
    <div className={`p-8 ${color} rounded-2xl border-2 border-white shadow-lg flex flex-col items-center text-center gap-4 transition-transform hover:scale-[1.02]`}>
      <div className="p-3 bg-white/50 rounded-xl shadow-inner">{icon}</div>
      <h4 className="text-xl font-black uppercase tracking-tight leading-tight">{title}</h4>
      <p className="text-[16px] font-black opacity-90 leading-relaxed">{desc}</p>
    </div>
  );
}

export default function QuickHighlights() {
  return (
    <div className="max-w-[1440px] mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
      <HighlightCard icon={<ShieldCheck size={36} />} title="Hoàn toàn miễn phí" desc="Tài trợ 100% chi phí xét nghiệm PSA" color="bg-emerald-50 text-emerald-700" />
      <HighlightCard icon={<Users size={36} />} title="Chuyên gia tư vấn" desc="Đội ngũ bác sĩ đầu Ngoại Tiết niệu" color="bg-blue-50 text-blue-700" />
      <HighlightCard icon={<Zap size={36} />} title="Bảo mật tuyệt đối" desc="Thông tin bệnh nhân được bảo mật tuyệt đối" color="bg-indigo-50 text-indigo-700" />
    </div>
  );
}
