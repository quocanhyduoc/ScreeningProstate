import React from 'react';
import { ShieldCheck, Award, Heart } from 'lucide-react';

export default function DisclaimerBanner() {
  return (
    <div className="max-w-[1440px] mx-auto px-6 mb-12">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-50/80 via-white to-blue-50/30 backdrop-blur-md border border-blue-100/60 shadow-xl shadow-blue-100/20 p-6 md:p-10">
        
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100/30 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-100/20 rounded-full blur-2xl pointer-events-none -z-10" />
        
        {/* Section title */}
        <div className="flex flex-col items-center text-center mb-8">
          <span className="px-4 py-1.5 bg-blue-50 text-blue-700 text-xs font-black uppercase tracking-widest rounded-full mb-3 border border-blue-100/50">
            Đơn vị đồng hành
          </span>
          <h2 className="text-xl md:text-2xl font-black text-blue-900 uppercase tracking-tight max-w-3xl leading-tight">
            Ban tổ chức & Hội đồng cố vấn chương trình
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mt-3" />
        </div>

        {/* Partners Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-stretch mb-8">
          
          {/* Partner 1: Bệnh viện Trung ương Huế */}
          <div className="flex flex-col items-center justify-between p-6 bg-white/70 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-blue-100 group">
            <span className="text-[11px] font-black uppercase tracking-wider text-blue-600 bg-blue-50/60 px-3 py-1 rounded-md mb-4 flex items-center gap-1.5">
              <Heart size={12} className="text-blue-500 fill-blue-500" /> Đơn vị thực hiện
            </span>
            <div className="h-24 flex items-center justify-center mb-4 px-4 w-full">
              <img 
                src="/logobv.boder.png" 
                alt="Logo Bệnh viện Trung ương Huế" 
                className="max-h-full max-w-[80%] object-contain filter drop-shadow-sm group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="text-center mt-auto">
              <h3 className="text-[15px] font-black text-slate-800 leading-snug group-hover:text-blue-700 transition-colors uppercase">
                Bệnh viện Trung ương Huế
              </h3>
              <p className="text-[11px] text-slate-400 font-bold tracking-wider mt-1 uppercase">
                Hue Central Hospital
              </p>
            </div>
          </div>

          {/* Partner 2: Hội Tiết niệu - Thận học Việt Nam */}
          <div className="flex flex-col items-center justify-between p-6 bg-white/70 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-indigo-100 group">
            <span className="text-[11px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50/60 px-3 py-1 rounded-md mb-4 flex items-center gap-1.5">
              <Award size={12} className="text-indigo-500" /> Đơn vị cố vấn
            </span>
            <div className="h-24 flex items-center justify-center mb-4 px-4 w-full">
              <img 
                src="/LOGO Hội VUNA.jpg" 
                alt="Logo Hội Tiết niệu - Thận học Việt Nam" 
                className="max-h-full max-w-[80%] object-contain filter drop-shadow-sm rounded-lg group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="text-center mt-auto">
              <h3 className="text-[15px] font-black text-slate-800 leading-snug group-hover:text-indigo-700 transition-colors uppercase">
                Hội Tiết niệu - Thận học Việt Nam
              </h3>
              <p className="text-[11px] text-slate-400 font-bold tracking-wider mt-1 uppercase">
                Vietnamese Urology & Nephrology Association
              </p>
            </div>
          </div>

          {/* Partner 3: AstraZeneca */}
          <div className="flex flex-col items-center justify-between p-6 bg-white/70 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-emerald-100 group">
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50/60 px-3 py-1 rounded-md mb-4 flex items-center gap-1.5">
              <ShieldCheck size={12} className="text-emerald-500" /> Đơn vị tài trợ
            </span>
            <div className="h-24 flex items-center justify-center mb-4 px-4 w-full">
              <img 
                src="https://www.astrixinc.com/wp-content/uploads/2023/03/astrazeneca-PNG-logo.png" 
                alt="Logo AstraZeneca" 
                className="max-h-full max-w-[90%] object-contain filter drop-shadow-sm group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  // Fallback to local image in case of external loading error
                  e.currentTarget.src = "/astrazeneca-PNG-logo.webp";
                }}
              />
            </div>
            <div className="text-center mt-auto">
              <h3 className="text-[15px] font-black text-slate-800 leading-snug group-hover:text-emerald-700 transition-colors uppercase">
                Công ty AstraZeneca
              </h3>
              <p className="text-[11px] text-slate-400 font-bold tracking-wider mt-1 uppercase">
                AstraZeneca PLC
              </p>
            </div>
          </div>

        </div>

        {/* Disclaimer Text box */}
        <div className="bg-blue-600/[0.03] border border-blue-600/10 rounded-2xl p-4 md:p-6 flex flex-col md:flex-row items-center gap-4 text-center md:text-left transition-all hover:bg-blue-600/[0.05]">
          <div className="w-12 h-12 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-600 shrink-0">
            <ShieldCheck size={24} />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-blue-900 leading-relaxed uppercase tracking-tight">
              Cam kết đồng hành & Hỗ trợ cộng đồng
            </p>
            <p className="text-[13px] text-slate-600 leading-relaxed font-medium">
              Chương trình được thực hiện bởi <strong className="text-slate-800 font-black">Bệnh viện Trung ương Huế</strong>, dưới sự cố vấn thực hiện bởi <strong className="text-slate-800 font-black">Hội Tiết niệu - Thận học Việt Nam</strong> và được tài trợ bởi <strong className="text-slate-800 font-black">công ty AstraZeneca</strong>. Tất cả các xét nghiệm PSA và khám sàng lọc đều hoàn toàn miễn phí cho người dân thuộc đối tượng chỉ định.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
