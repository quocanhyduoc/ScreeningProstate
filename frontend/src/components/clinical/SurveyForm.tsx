import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, AlertTriangle, Save, 
  ChevronRight, Heart, Activity, User,
  Dna, Thermometer, Info, CheckCircle, RefreshCw, X, ArrowLeft
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function SurveyForm({ patientId, onComplete }: any) {
  const [formData, setFormData] = useState<any>({
    registration_id: patientId,
    brca_mutation: false,
    father_age_diag: null,
    brother_age_diag: null,
    exclusion_sex_24h: false,
    exclusion_cystoscopy_48h: false,
    exclusion_dre_1w: false,
    biopsy_3y: false,
    prostatectomy: false,
    cancer_history: [],
    cancer_treatment: false,
    severe_organ_disease: false,
    alzheimer: false,
    other_studies: false,
    meds_5alpha_inhibitor: false,
    meds_estrogen: false,
    meds_progesterone: false,
    meds_androgen: false,
    meds_corticoids: false,
    meds_saw_palmetto: false,
    symptom_difficulty: false,
    symptom_frequency: false,
    symptom_urgency: false,
    symptom_incomplete: false,
    symptom_dribbling: false,
    symptom_bone_pain: false,
    symptom_hematuria: false,
  });

  const [loading, setLoading] = useState(false);
  const [initialData, setInitialData] = useState<any>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [actionType, setActionType] = useState<'save' | 'complete' | null>(null);

  React.useEffect(() => {
    const fetchExistingSurvey = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const res = await axios.get(`${API_URL}/clinical/survey/${patientId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data) {
          setFormData(res.data);
          setInitialData(JSON.parse(JSON.stringify(res.data))); // Deep clone for comparison
        } else {
          setInitialData(JSON.parse(JSON.stringify(formData)));
        }
      } catch (e) {
        console.log("No existing survey found or error fetching");
        setInitialData(JSON.parse(JSON.stringify(formData)));
      }
    };
    if (patientId) fetchExistingSurvey();
  }, [patientId]);

  const hasChanges = () => {
    if (!initialData) return false;
    return JSON.stringify(formData) !== JSON.stringify(initialData);
  };

  const handleAction = async (type: 'save' | 'complete') => {
    if (type === 'save' && !hasChanges()) {
      alert("Dữ liệu chưa có thay đổi nào để lưu.");
      return;
    }
    
    setActionType(type);
    if (type === 'save') {
      setShowConfirmModal(true);
    } else {
      await executeSubmit(type);
    }
  };

  const executeSubmit = async (type: 'save' | 'complete') => {
    setLoading(true);
    setShowConfirmModal(false);
    try {
      const token = localStorage.getItem('token');
      // 1. Save Survey Data
      await axios.post(`${API_URL}/clinical/survey`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // 2. If complete, update registration status
      if (type === 'complete') {
        await axios.patch(`${API_URL}/clinical/status/${patientId}`, { status: 'CHO_XET_NGHIEM' }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      alert(type === 'complete' ? "Đã hoàn tất và chuyển bệnh nhân lấy máu!" : "Đã lưu các thay đổi!");
      onComplete();
    } catch (e) {
      console.error(e);
      alert("Lỗi khi xử lý dữ liệu. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const toggleField = (field: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-12 pb-32">
      
      {/* I. Genetic Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
           <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600"><Dna size={18} /></div>
           <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">I. Di truyền & Tiền sử gia đình</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <ToggleCard 
             label="Đột biến gen BRCA1/BRCA2" 
             active={formData.brca_mutation} 
             onClick={() => toggleField('brca_mutation')} 
           />
           <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-6">
              <div className="flex-1 space-y-1">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cha chẩn đoán K lúc</label>
                 <div className="relative">
                    <input type="number" value={formData.father_age_diag || ""} onChange={(e) => setFormData({...formData, father_age_diag: e.target.value ? parseInt(e.target.value) : null})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-bold outline-none focus:border-blue-500 transition-all" placeholder="Tuổi" />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">TUỔI</span>
                 </div>
              </div>
              <div className="flex-1 space-y-1">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Anh/Em chẩn đoán K lúc</label>
                 <div className="relative">
                    <input type="number" value={formData.brother_age_diag || ""} onChange={(e) => setFormData({...formData, brother_age_diag: e.target.value ? parseInt(e.target.value) : null})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-bold outline-none focus:border-blue-500 transition-all" placeholder="Tuổi" />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">TUỔI</span>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* II. Exclusions Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
           <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center text-red-600"><AlertTriangle size={18} /></div>
           <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">II. Tiêu chuẩn loại trừ (Tạm thời)</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           <ToggleCard label="Quan hệ tình dục / Xuất tinh (24h)" active={formData.exclusion_sex_24h} onClick={() => toggleField('exclusion_sex_24h')} warning />
           <ToggleCard label="Nội soi bàng quang / Thông tiểu (48h)" active={formData.exclusion_cystoscopy_48h} onClick={() => toggleField('exclusion_cystoscopy_48h')} warning />
           <ToggleCard label="Thăm trực tràng / Đạp xe (1 tuần)" active={formData.exclusion_dre_1w} onClick={() => toggleField('exclusion_dre_1w')} warning />
        </div>
      </section>

      {/* III. History Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
           <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600"><Activity size={18} /></div>
           <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">III. Tiền sử bệnh lý</h3>
        </div>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <ToggleCard label="Sinh thiết TLN (3 năm)" active={formData.biopsy_3y} onClick={() => toggleField('biopsy_3y')} />
            <ToggleCard label="Phẫu thuật cắt TLN" active={formData.prostatectomy} onClick={() => toggleField('prostatectomy')} />
            <ToggleCard label="Tiền sử K (TTL, Phổi...)" active={formData.cancer_history?.length > 0} onClick={() => {
                const current = formData.cancer_history || [];
                setFormData({...formData, cancer_history: current.length > 0 ? [] : ['PROSTATE_COLON_LUNG']});
            }} />
            <ToggleCard label="Đang điều trị ung thư" active={formData.cancer_treatment} onClick={() => toggleField('cancer_treatment')} />
            <ToggleCard label="Bệnh cơ quan nặng" active={formData.severe_organ_disease} onClick={() => toggleField('severe_organ_disease')} />
            <ToggleCard label="Sa sút trí tuệ" active={formData.alzheimer} onClick={() => toggleField('alzheimer')} />
            <ToggleCard label="Tham gia NC khác" active={formData.other_studies} onClick={() => toggleField('other_studies')} />
         </div>
      </section>

      {/* IV. Medications Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
           <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600"><Thermometer size={18} /></div>
           <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">IV. Đang sử dụng thuốc</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
           <ToggleCard label="Chất ức chế 5α-reductase (Finasteride, Dutasteride)" active={formData.meds_5alpha_inhibitor} onClick={() => toggleField('meds_5alpha_inhibitor')} />
           <ToggleCard label="Estrogen" active={formData.meds_estrogen} onClick={() => toggleField('meds_estrogen')} />
           <ToggleCard label="Thuốc progesterone" active={formData.meds_progesterone} onClick={() => toggleField('meds_progesterone')} />
           <ToggleCard label="Androgen" active={formData.meds_androgen} onClick={() => toggleField('meds_androgen')} />
           <ToggleCard label="Corticoid điều trị toàn thân lâu dài" active={formData.meds_corticoids} onClick={() => toggleField('meds_corticoids')} />
           <ToggleCard label="Dược liệu (Ví dụ: Cây cọ lùn) giảm PSA" active={formData.meds_saw_palmetto} onClick={() => toggleField('meds_saw_palmetto')} />
        </div>
      </section>

      {/* V. Symptoms Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
           <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600"><Activity size={18} /></div>
           <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">V. Triệu chứng đường tiểu</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
           <ToggleCard label="Tiểu khó / Tia yếu" active={formData.symptom_difficulty} onClick={() => toggleField('symptom_difficulty')} />
           <ToggleCard label="Tiểu nhiều lần (Ngày/Đêm)" active={formData.symptom_frequency} onClick={() => toggleField('symptom_frequency')} />
           <ToggleCard label="Tiểu gấp / Không nhịn được" active={formData.symptom_urgency} onClick={() => toggleField('symptom_urgency')} />
           <ToggleCard label="Tiểu không hết (Tồn lưu)" active={formData.symptom_incomplete} onClick={() => toggleField('symptom_incomplete')} />
           <ToggleCard label="Tiểu nhỏ giọt" active={formData.symptom_dribbling} onClick={() => toggleField('symptom_dribbling')} />
           <ToggleCard label="Đau xương" active={formData.symptom_bone_pain} onClick={() => toggleField('symptom_bone_pain')} />
           <ToggleCard label="Tiểu máu" active={formData.symptom_hematuria} onClick={() => toggleField('symptom_hematuria')} />
        </div>
      </section>

      {/* Fixed Footer Bar - Modern split buttons */}
      <div className="fixed bottom-0 left-0 lg:left-64 right-0 bg-white/95 backdrop-blur-xl border-t border-slate-200 p-4 md:p-6 z-[50] flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 px-4 md:px-12 shadow-[0_-10px_40px_rgba(0,0,0,0.06)]">
        <button 
          type="button"
          onClick={() => onComplete()}
          className="bg-white border-2 border-slate-200 text-slate-500 w-full sm:w-auto px-6 py-3.5 md:py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-2 order-3 sm:order-1"
        >
          <X size={18} />
          HỦY CHỈNH SỬA
        </button>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto order-1 sm:order-2">
           <button 
             type="button"
             disabled={loading}
             onClick={() => handleAction('save')}
             className="bg-white border-2 border-[#0067b8] text-[#0067b8] w-full sm:w-auto px-8 py-3.5 md:py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-50 transition-all flex items-center justify-center gap-2 shadow-sm"
           >
              {loading && actionType === 'save' ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
              <span className="hidden sm:inline">LƯU LẠI CHỈNH SỬA</span>
              <span className="inline sm:hidden">LƯU LẠI</span>
           </button>

           <button 
             type="button"
             disabled={loading}
             onClick={() => handleAction('complete')}
             className="bg-[#0067b8] hover:bg-blue-700 text-white w-full sm:w-auto px-10 py-3.5 md:py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-100 flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50"
           >
              {loading && actionType === 'complete' ? <RefreshCw className="animate-spin" size={20} /> : <CheckCircle size={20} />}
              <span className="hidden md:inline">HOÀN TẤT & CHUYỂN BÀN LẤY MÁU</span>
              <span className="inline md:hidden">HOÀN TẤT & CHUYỂN</span>
           </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowConfirmModal(false)} />
           <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative bg-white rounded-3xl p-10 max-w-md w-full shadow-2xl">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                 <AlertTriangle size={32} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">Xác nhận thay đổi?</h3>
              <p className="text-slate-500 font-medium leading-relaxed mb-8 text-lg">
                 Ông vừa thay đổi các thông tin trong bảng khảo sát này. Ông có chắc chắn muốn lưu lại các chỉnh sửa này không?
              </p>
              <div className="flex gap-4">
                 <button 
                   onClick={() => setShowConfirmModal(false)}
                   className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-slate-200 transition-all"
                 >
                    QUAY LẠI
                 </button>
                 <button 
                   onClick={() => executeSubmit('save')}
                   className="flex-1 py-4 bg-blue-600 text-white rounded-xl font-black text-sm uppercase tracking-widest shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all"
                 >
                    XÁC NHẬN LƯU
                 </button>
              </div>
           </motion.div>
        </div>
      )}
    </form>
  );
}

function ToggleCard({ label, active, onClick, warning }: any) {
  return (
    <div 
      onClick={onClick}
      className={`p-6 rounded-[28px] border-2 cursor-pointer transition-all flex items-center justify-between gap-4 group h-full ${
        active 
          ? (warning ? 'bg-red-50 border-red-500 text-red-700 shadow-lg shadow-red-50' : 'bg-blue-50 border-blue-500 text-blue-700 shadow-lg shadow-blue-50') 
          : 'bg-white border-slate-100 hover:border-slate-300 shadow-sm'
      }`}
    >
       <span className="text-[13px] font-bold leading-tight uppercase tracking-tight">{label}</span>
       <div className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all ${
         active 
           ? (warning ? 'bg-red-500 border-red-500' : 'bg-blue-500 border-blue-500') 
           : 'border-slate-100 group-hover:border-slate-200 bg-slate-50'
       }`}>
          {active && <CheckIcon className="text-white" size={16} />}
       </div>
    </div>
  );
}

function CheckIcon({ className, size }: any) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  );
}
