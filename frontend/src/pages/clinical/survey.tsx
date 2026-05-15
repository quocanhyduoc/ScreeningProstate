import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import SurveyForm from '../../components/clinical/SurveyForm';
import { ArrowLeft, User, Activity, Fingerprint, Info, ShieldCheck } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function ClinicalSurveyPage() {
  const router = useRouter();
  const { id } = router.query;
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchPatient();
  }, [id]);

  const fetchPatient = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/clinical/registrations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const p = res.data.find((item: any) => item.id === parseInt(id as string));
      setPatient(p);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingScreen />;
  if (!patient) return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-bold text-red-400 uppercase tracking-widest">Hồ sơ không tồn tại</div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Sidebar Overlay Simulation - to match layout */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-200 hidden lg:block z-10">
         <div className="p-8">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center shadow-md">
                <ShieldCheck size={20} className="text-white" />
              </div>
              <span className="text-[15px] font-bold tracking-tight block leading-none">Clinical Survey</span>
            </div>
            
            <div className="space-y-6">
               <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                  <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Đang xử lý</p>
                  <p className="text-[14px] font-bold text-blue-700">#{patient.registration_number?.toString().padStart(3, '0')}</p>
                  <p className="text-[12px] font-medium text-blue-600 mt-1">{patient.full_name}</p>
               </div>
               
               <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Mã CCCD</p>
                  <p className="text-[13px] font-bold text-slate-700">{patient.cccd}</p>
               </div>
            </div>
         </div>
      </div>

      <main className="lg:ml-64 flex-1">
        <header className="bg-white border-b border-slate-200 p-8 sticky top-0 z-[60] backdrop-blur-md bg-white/80">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
             <div className="flex items-center gap-6">
                <button onClick={() => router.back()} className="p-3 bg-slate-100 hover:bg-slate-200 rounded-2xl transition-all text-slate-500"><ArrowLeft size={24}/></button>
                <div>
                   <h1 className="text-2xl font-black tracking-tight text-[#121C2D]">BẢNG CÂU HỎI KHẢO SÁT</h1>
                   <p className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Sàng lọc bệnh lý Tuyến tiền liệt - Huế 2026</p>
                </div>
             </div>
             <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center border border-blue-100 shadow-sm shadow-blue-50"><Activity size={24}/></div>
             </div>
          </div>
        </header>

        <div className="max-w-6xl mx-auto p-8 pt-12">
          <div className="bg-white border border-slate-200 rounded-[32px] p-6 mb-12 flex items-center gap-6 shadow-sm">
             <div className="w-14 h-14 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center flex-shrink-0"><Info size={28}/></div>
             <div>
                <p className="text-[14px] font-bold text-slate-700">Hướng dẫn dành cho nhân viên lâm sàng</p>
                <p className="text-[12px] font-medium text-slate-500 italic mt-0.5 leading-relaxed">
                  Ghi nhận chính xác các yếu tố di truyền, loại trừ các hoạt động ảnh hưởng đến PSA trong vòng 24h-1 tuần. Bảng hỏi này là cơ sở quan trọng để chỉ định xét nghiệm.
                </p>
             </div>
          </div>
          
          <SurveyForm 
            patientId={patient.id} 
            onComplete={() => router.push('/admin/dashboard')} 
          />
        </div>
      </main>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        body { font-family: 'Inter', sans-serif; background: #F8FAFC; }
      `}</style>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
       <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-50 border-t-[#0067b8] rounded-full animate-spin" />
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">Loading Clinical Form...</p>
       </div>
    </div>
  );
}
