import React from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, Dna, AlertCircle, ShieldCheck, Activity, ChevronRight, Check } from 'lucide-react';

interface Step6Props {
  register: any;
  watch: any;
  setValue: any;
  trigger: any;
  handleSubmit: any;
  registrationResult: any;
  isSubmitting: boolean;
  isReviewing: boolean;
  setIsReviewing: (val: boolean) => void;
  onFinalSubmit: (data: any) => Promise<void>;
  error?: string;
}

const Step6ClinicalSurvey: React.FC<Step6Props> = ({
  register,
  watch,
  setValue,
  trigger,
  handleSubmit,
  registrationResult,
  isSubmitting,
  isReviewing,
  setIsReviewing,
  onFinalSubmit,
  error
}) => {
  if (isReviewing) {
    return (
      <motion.div key="review" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-black text-blue-900 tracking-tight">XÁC NHẬN BẢNG KHẢO SÁT</h2>
          <p className="text-gray-500 font-bold text-lg italic">Ông vui lòng kiểm tra lại lần cuối trước khi nộp hồ sơ lâm sàng.</p>
        </div>

        <div className="bg-white border-2 border-blue-100 rounded-2xl p-8 space-y-6 shadow-xl">
          <ReviewItem label="Đột biến gen BRCA" value={watch('brca_mutation') ? 'Có' : 'Không'} />
          <ReviewItem label="Tuổi cha chẩn đoán K" value={watch('father_age_diag') || 'N/A'} />
          <ReviewItem label="Tuổi anh/em chẩn đoán K" value={watch('brother_age_diag') || 'N/A'} />
          <div className="h-px bg-gray-100" />
          <ReviewItem
            label="Tiêu chuẩn loại trừ"
            value={
              [
                watch('exclusion_sex_24h') && "Xuất tinh (24h)",
                watch('exclusion_cystoscopy_48h') && "Nội soi (48h)",
                watch('exclusion_dre_1w') && "Thăm trực tràng (1 tuần)"
              ].filter(Boolean).join(', ') || 'Không có'
            }
            warning={watch('exclusion_sex_24h') || watch('exclusion_cystoscopy_48h') || watch('exclusion_dre_1w')}
          />
          <div className="h-px bg-gray-100" />

          <ReviewItem
            label="Tiền sử bệnh lý"
            value={
              [
                watch('biopsy_3y') && "Sinh thiết (3 năm)",
                watch('prostatectomy') && "Đã cắt TTL",
                (watch('cancer_history')?.length > 0) && "Tiền sử K",
                watch('cancer_treatment') && "Đang điều trị K",
                watch('severe_organ_disease') && "Bệnh nội tạng nặng",
                watch('alzheimer') && "Alzheimer",
                watch('other_studies') && "Nghiên cứu khác"
              ].filter(Boolean).join(', ') || 'Không có'
            }
          />
          <ReviewItem
            label="Thuốc đang dùng"
            value={
              [
                watch('meds_5alpha_inhibitor') && "5α-reductase",
                watch('meds_estrogen') && "Estrogen",
                watch('meds_progesterone') && "Progesterone",
                watch('meds_androgen') && "Androgen",
                watch('meds_corticoids') && "Corticoids",
                watch('meds_saw_palmetto') && "Dược liệu PSA"
              ].filter(Boolean).join(', ') || 'Không có'
            }
          />
          <div className="h-px bg-gray-100" />
          <ReviewItem
            label="Triệu chứng đường tiểu"
            value={
              [
                watch('symptom_difficulty') && "Tiểu khó",
                watch('symptom_frequency') && "Tiểu nhiều",
                watch('symptom_urgency') && "Tiểu gấp",
                watch('symptom_incomplete') && "Tiểu không hết",
                watch('symptom_hematuria') && "Tiểu máu",
                watch('symptom_bone_pain') && "Đau xương"
              ].filter(Boolean).join(', ') || 'Không có'
            }
          />
        </div>

        {error && (
          <div className="p-6 bg-red-50 border-2 border-red-200 rounded-2xl flex items-center gap-4 text-red-600 shadow-lg shadow-red-50">
            <AlertCircle className="shrink-0" size={24} />
            <p className="font-black text-lg">{error}</p>
          </div>
        )}

        <div className="flex gap-4">
          <button onClick={() => setIsReviewing(false)} className="px-10 py-5 bg-white border-2 border-gray-200 text-gray-500 rounded-xl font-black text-xl hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center">Chỉnh sửa</button>
          <button
            onClick={handleSubmit(onFinalSubmit, (errs) => console.error("DEBUG: Validation Errors:", errs))}
            disabled={isSubmitting}
            className="flex-1 py-6 bg-green-600 text-white rounded-2xl font-black text-2xl shadow-2xl shadow-green-200 hover:bg-green-700 transition-all active:scale-[0.98]"
          >
            {isSubmitting ? 'ĐANG XỬ LÝ...' : 'GỬI HỒ SƠ LÂM SÀNG'}
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div key="s6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12 pb-10">
      <div className="p-10 bg-blue-600 rounded-3xl text-white shadow-2xl shadow-blue-200 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl" />
        <div className="flex items-center gap-6 mb-6 relative z-10">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
            <ClipboardList size={32} />
          </div>
          <div>
            <h2 className="text-3xl font-black tracking-tight leading-tight uppercase">KHẢO SÁT SÀNG LỌC</h2>
            <p className="text-blue-100 text-[15px] font-black uppercase mt-1">CCCD: {registrationResult?.cccd} | Họ tên: {registrationResult?.full_name}</p>
          </div>
        </div>
        <p className="text-[17px] text-blue-50 leading-relaxed font-black opacity-95 relative z-10">
          Đây là bước quan trọng nhất để các bác sĩ đánh giá tình trạng lâm sàng của Ông. Vui lòng điền đầy đủ và trung thực để kết quả tầm soát đạt độ chính xác cao nhất.
        </p>
      </div>

      <div className="space-y-12">
        {/* Genetic Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 shadow-sm"><Dna size={24} /></div>
            <h3 className="text-[14px] font-black text-slate-500 uppercase tracking-[0.2em]">I. DI TRUYỀN & TIỀN SỬ GIA ĐÌNH</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <QuestionToggle
              label="Đột biến gen BRCA1/BRCA2"
              active={watch('brca_mutation')}
              onClick={() => setValue('brca_mutation', !watch('brca_mutation'))}
            />
            <div className="bg-gray-50 p-8 rounded-2xl border-2 border-gray-100 flex items-center gap-6 shadow-sm">
              <div className="flex-1 space-y-2">
                <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest">Cha chẩn đoán lúc</label>
                <input type="number" {...register('father_age_diag')} className="w-full bg-white border-2 border-gray-100 rounded-xl px-5 py-3 text-[18px] font-black text-blue-900 focus:border-blue-500 outline-none transition-all" placeholder="Tuổi" />
              </div>
              <div className="flex-1 space-y-2">
                <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest">Anh/Em chẩn đoán lúc</label>
                <input type="number" {...register('brother_age_diag')} className="w-full bg-white border-2 border-gray-100 rounded-xl px-5 py-3 text-[18px] font-black text-blue-900 focus:border-blue-500 outline-none transition-all" placeholder="Tuổi" />
              </div>
            </div>
          </div>
        </section>

        {/* II. Exclusions */}
        <section className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center text-red-600 shadow-sm"><AlertCircle size={24} /></div>
            <h3 className="text-[14px] font-black text-slate-500 uppercase tracking-[0.2em]">II. TIÊU CHUẨN LOẠI TRỪ (TẠM THỜI)</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <QuestionToggle label="Quan hệ tình dục / Xuất tinh (24h)" active={watch('exclusion_sex_24h')} onClick={() => setValue('exclusion_sex_24h', !watch('exclusion_sex_24h'))} warning />
            <QuestionToggle label="Nội soi bàng quang / Thông tiểu (48h)" active={watch('exclusion_cystoscopy_48h')} onClick={() => setValue('exclusion_cystoscopy_48h', !watch('exclusion_cystoscopy_48h'))} warning />
            <QuestionToggle label="Thăm trực tràng / Đạp xe (1 tuần)" active={watch('exclusion_dre_1w')} onClick={() => setValue('exclusion_dre_1w', !watch('exclusion_dre_1w'))} warning />
          </div>
        </section>

        {/* III. Medical History & Medications */}
        <section className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 shadow-sm"><ShieldCheck size={24} /></div>
            <h3 className="text-[14px] font-black text-slate-500 uppercase tracking-[0.2em]">III. TIỀN SỬ BỆNH LÝ & THUỐC ĐANG DÙNG</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <QuestionToggle label="Sinh thiết TTL trong vòng 3 năm" active={watch('biopsy_3y')} onClick={() => setValue('biopsy_3y', !watch('biopsy_3y'))} />
            <QuestionToggle label="Đã cắt bỏ tuyến tiền liệt" active={watch('prostatectomy')} onClick={() => setValue('prostatectomy', !watch('prostatectomy'))} />
            <QuestionToggle
              label="Tiền sử K (TTL, Đại trực tràng, Phổi)"
              active={watch('cancer_history')?.length > 0}
              onClick={() => {
                const current = watch('cancer_history') || [];
                setValue('cancer_history', current.length > 0 ? [] : ['PROSTATE_COLON_LUNG']);
              }}
            />
            <QuestionToggle label="Đang điều trị ung thư" active={watch('cancer_treatment')} onClick={() => setValue('cancer_treatment', !watch('cancer_treatment'))} />
            <QuestionToggle label="Bệnh tim, não, phổi, gan, thận nặng" active={watch('severe_organ_disease')} onClick={() => setValue('severe_organ_disease', !watch('severe_organ_disease'))} />
            <QuestionToggle label="Mắc bệnh Alzheimer" active={watch('alzheimer')} onClick={() => setValue('alzheimer', !watch('alzheimer'))} />
            <QuestionToggle label="Tham gia nghiên cứu sàng lọc khác" active={watch('other_studies')} onClick={() => setValue('other_studies', !watch('other_studies'))} />

            <div className="md:col-span-2 p-8 bg-slate-50 rounded-3xl border-2 border-slate-100 space-y-6">
              <p className="text-[12px] font-black text-slate-400 uppercase tracking-widest">Đang sử dụng các loại thuốc sau:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <QuestionToggle label="Chất ức chế 5α-reductase (Finasteride, Dutasteride)" active={watch('meds_5alpha_inhibitor')} onClick={() => setValue('meds_5alpha_inhibitor', !watch('meds_5alpha_inhibitor'))} />
                <QuestionToggle label="Estrogen" active={watch('meds_estrogen')} onClick={() => setValue('meds_estrogen', !watch('meds_estrogen'))} />
                <QuestionToggle label="Thuốc progesterone" active={watch('meds_progesterone')} onClick={() => setValue('meds_progesterone', !watch('meds_progesterone'))} />
                <QuestionToggle label="Androgen" active={watch('meds_androgen')} onClick={() => setValue('meds_androgen', !watch('meds_androgen'))} />
                <QuestionToggle label="Corticoid điều trị toàn thân lâu dài" active={watch('meds_corticoids')} onClick={() => setValue('meds_corticoids', !watch('meds_corticoids'))} />
                <QuestionToggle label="Dược liệu (Cây cọ lùn...) giảm PSA" active={watch('meds_saw_palmetto')} onClick={() => setValue('meds_saw_palmetto', !watch('meds_saw_palmetto'))} />
              </div>
            </div>
          </div>
        </section>

        {/* IV. Symptoms */}
        <section className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 shadow-sm"><Activity size={24} /></div>
            <h3 className="text-[14px] font-black text-slate-500 uppercase tracking-[0.2em]">IV. TRIỆU CHỨNG ĐƯỜNG TIỂU</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <QuestionToggle label="Tiểu khó / Tia yếu" active={watch('symptom_difficulty')} onClick={() => setValue('symptom_difficulty', !watch('symptom_difficulty'))} />
            <QuestionToggle label="Tiểu nhiều lần (Ngày/Đêm)" active={watch('symptom_frequency')} onClick={() => setValue('symptom_frequency', !watch('symptom_frequency'))} />
            <QuestionToggle label="Tiểu gấp / Không nhịn được" active={watch('symptom_urgency')} onClick={() => setValue('symptom_urgency', !watch('symptom_urgency'))} />
            <QuestionToggle label="Tiểu không hết / Nhỏ giọt" active={watch('symptom_incomplete')} onClick={() => setValue('symptom_incomplete', !watch('symptom_incomplete'))} />
            <QuestionToggle label="Tiểu máu" active={watch('symptom_hematuria')} onClick={() => setValue('symptom_hematuria', !watch('symptom_hematuria'))} />
            <QuestionToggle label="Đau xương" active={watch('symptom_bone_pain')} onClick={() => setValue('symptom_bone_pain', !watch('symptom_bone_pain'))} />
          </div>
        </section>

        <div className="pt-10 flex flex-col gap-6">
          <div className="flex items-start gap-6 p-8 bg-blue-50/50 rounded-2xl border-2 border-blue-200/50 shadow-sm group cursor-pointer active:bg-blue-100 transition-all">
            <input type="checkbox" id="truth_consent" {...register('truth_consent', { required: true })} className="w-8 h-8 mt-1 border-2 border-blue-200 rounded-lg cursor-pointer" />
            <label htmlFor="truth_consent" className="text-[16px] font-black text-blue-950 leading-relaxed cursor-pointer select-none">
              TÔI XIN CAM ĐOAN NHỮNG THÔNG TIN CUNG CẤP TRÊN LÀ HOÀN TOÀN SỰ THẬT. TÔI HIỂU RẰNG VIỆC CUNG CẤP SAI THÔNG TIN CÓ THỂ ẢNH HƯỞNG ĐẾN KẾT QUẢ XÉT NGHIỆM PSA.
            </label>
          </div>
          <button
            onClick={async () => {
              const isValid = await trigger('truth_consent');
              if (isValid) setIsReviewing(true);
            }}
            className="w-full py-6 bg-blue-600 text-white rounded-2xl font-black text-2xl shadow-2xl shadow-blue-200 flex items-center justify-center gap-4 hover:bg-blue-700 transition-all active:scale-[0.98]"
          >
            XEM LẠI & HOÀN TẤT <ChevronRight size={28} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default Step6ClinicalSurvey;

function QuestionToggle({ label, active, onClick, warning }: any) {
  return (
    <div
      onClick={onClick}
      className={`p-6 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between gap-6 shadow-sm hover:shadow-md ${
        active
          ? (warning ? 'bg-red-50 border-red-500 text-red-900 ring-4 ring-red-50' : 'bg-blue-50 border-blue-600 text-blue-900 ring-4 ring-blue-50')
          : 'bg-white border-gray-100 hover:border-blue-200'
      }`}
    >
      <span className="text-[16px] font-black leading-tight uppercase tracking-tight">{label}</span>
      <div className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all shrink-0 ${
        active
          ? (warning ? 'bg-red-600 border-red-600' : 'bg-blue-600 border-blue-600')
          : 'border-gray-200 bg-gray-50'
      }`}>
        {active && <Check size={20} className="text-white" />}
      </div>
    </div>
  );
}

function ReviewItem({ label, value, warning }: any) {
  return (
    <div className="flex justify-between gap-6 text-[18px]">
      <span className="text-gray-400 font-black uppercase tracking-tight text-[12px] pt-1.5">{label}</span>
      <span className={`text-right font-black ${warning ? 'text-red-600' : 'text-blue-900 uppercase'}`}>{value}</span>
    </div>
  );
}
