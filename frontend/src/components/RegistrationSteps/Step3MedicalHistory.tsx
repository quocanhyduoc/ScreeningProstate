import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, ArrowRight, AlertCircle, CheckCircle2, Activity, HelpCircle, Check } from 'lucide-react';

interface Step3Props {
  register: any;
  setStep: (step: number) => void;
  isEligible: () => boolean;
  handleNext: () => void;
  watch: any;
  setValue: any;
}

const LUTS_OAB_SYMPTOMS = [
  {
    id: 'incomplete_emptying',
    label: 'Cảm giác tiểu không hết bãi',
    desc: 'Sau khi tiểu xong vẫn còn cảm giác sót nước tiểu trong bàng quang (còn muốn tiểu tiếp)'
  },
  {
    id: 'frequency',
    label: 'Tiểu nhiều lần trong ngày',
    desc: 'Thường xuyên phải đi tiểu lại trong vòng dưới 2 giờ'
  },
  {
    id: 'intermittency',
    label: 'Dòng tiểu ngắt quãng',
    desc: 'Dòng nước tiểu bị dừng lại rồi chảy tiếp nhiều lần trong một lần đi tiểu'
  },
  {
    id: 'urgency',
    label: 'Tiểu gấp, mót tiểu khó nhịn (OAB)',
    desc: 'Khi buồn tiểu có cảm giác phải đi ngay lập tức, rất khó kìm nén'
  },
  {
    id: 'weak_stream',
    label: 'Tia nước tiểu yếu / nhỏ giọt',
    desc: 'Tia nước tiểu nhỏ, lực tống yếu hoặc chỉ chảy nhỏ giọt dưới chân'
  },
  {
    id: 'straining',
    label: 'Tiểu khó, phải rặn mới tiểu được',
    desc: 'Phải rặn mạnh hoặc mất một khoảng thời gian chờ đợi dòng tiểu mới bắt đầu chảy'
  },
  {
    id: 'nocturia',
    label: 'Tiểu đêm nhiều lần',
    desc: 'Phải thức giấc đi tiểu từ 2 lần trở lên trong một đêm (từ lúc đi ngủ đến sáng)'
  },
  {
    id: 'incontinence',
    label: 'Tiểu són, rỉ nước tiểu',
    desc: 'Nước tiểu tự động rỉ ra trước khi kịp vào nhà vệ sinh'
  },
  {
    id: 'dysuria_hematuria',
    label: 'Tiểu buốt, tiểu rắt hoặc tiểu ra máu',
    desc: 'Cảm giác nóng rát đường niệu đạo hoặc nước tiểu sẫm màu, có màu đỏ/hồng'
  }
];

const Step3MedicalHistory: React.FC<Step3Props> = ({
  register,
  setStep,
  isEligible,
  handleNext,
  watch,
  setValue
}) => {
  const hasUrinarySymptoms = watch('has_urinary_symptoms') || 'NO';
  const selectedLuts: string[] = watch('selected_luts') || [];
  const otherSymptoms: string = watch('other_symptoms') || '';

  // Synchronize composite text into 'symptoms' field whenever symptoms change
  const updateSymptomsString = (
    hasSymptoms: string,
    luts: string[],
    other: string
  ) => {
    if (hasSymptoms === 'NO') {
      const text = other.trim()
        ? `Không có triệu chứng đường tiểu. Triệu chứng khác: ${other.trim()}`
        : 'Không có triệu chứng đường tiểu';
      setValue('symptoms', text);
    } else if (hasSymptoms === 'YES') {
      const symptomsPart = luts.length > 0 ? luts.join(', ') : 'Có triệu chứng đường tiểu (chưa chọn chi tiết)';
      const text = other.trim()
        ? `${symptomsPart}. Triệu chứng khác: ${other.trim()}`
        : symptomsPart;
      setValue('symptoms', text);
    }
  };

  const handleSelectHasSymptoms = (val: 'NO' | 'YES') => {
    setValue('has_urinary_symptoms', val);
    if (val === 'NO') {
      setValue('selected_luts', []);
      updateSymptomsString('NO', [], otherSymptoms);
    } else {
      updateSymptomsString('YES', selectedLuts, otherSymptoms);
    }
  };

  const handleToggleLuts = (label: string) => {
    let nextList: string[];
    if (selectedLuts.includes(label)) {
      nextList = selectedLuts.filter((s) => s !== label);
    } else {
      nextList = [...selectedLuts, label];
    }
    setValue('selected_luts', nextList);
    updateSymptomsString(hasUrinarySymptoms, nextList, otherSymptoms);
  };

  const handleOtherSymptomsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setValue('other_symptoms', val);
    updateSymptomsString(hasUrinarySymptoms, selectedLuts, val);
  };

  return (
    <motion.div
      key="s3"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6 md:space-y-8"
    >
      {/* Step Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/60 text-prostate-navy text-xs font-black uppercase tracking-wider mb-2 md:mb-3">
          <Activity size={14} className="text-prostate-orange" />
          Bước 3 / 4: Tiền sử & Triệu chứng sức khỏe
        </div>
        <h2 className="text-2xl md:text-3xl font-black text-blue-900 tracking-tight">
          Tiền sử bệnh lý & Triệu chứng đường tiểu
        </h2>
        <p className="text-[13px] md:text-base text-gray-500 font-medium italic mt-1">
          Những thông tin này giúp các bác sĩ Bệnh viện Trung ương Huế đánh giá ban đầu về nguy cơ và định hướng thăm khám phù hợp.
        </p>
      </div>

      {/* 1. TIỀN SỬ GIA ĐÌNH */}
      <div className="space-y-3">
        <label className="text-[13px] md:text-[15px] font-black text-blue-900 ml-1 uppercase tracking-tight flex items-center gap-2">
          1. Tiền sử gia đình trực hệ mắc Ung thư Tuyến tiền liệt
        </label>
        <div className="grid sm:grid-cols-2 gap-3 md:gap-4">
          <div className="p-4 md:p-5 bg-gray-50 rounded-2xl border-2 border-gray-100 hover:border-blue-200 transition-all shadow-sm">
            <label className="flex items-center gap-3.5 md:gap-4 cursor-pointer group">
              <div className="relative w-12 h-6 md:w-14 md:h-7 shrink-0">
                <input type="checkbox" {...register('history_father')} className="sr-only peer" />
                <div className="w-full h-full bg-gray-200 rounded-full peer-checked:bg-blue-600 transition-all" />
                <div className="absolute top-1 left-1 w-4 h-4 md:w-5 md:h-5 bg-white rounded-full transition-all peer-checked:translate-x-6 md:peer-checked:translate-x-7 shadow-md" />
              </div>
              <div>
                <p className="font-black text-blue-900 text-[14px] md:text-[16px] leading-tight">Bố ruột mắc Ung thư Tuyến tiền liệt</p>
                <p className="text-[10px] md:text-[11px] text-gray-400 font-black uppercase tracking-wider mt-0.5">Tiền sử trực hệ (F1)</p>
              </div>
            </label>
          </div>

          <div className="p-4 md:p-5 bg-gray-50 rounded-2xl border-2 border-gray-100 hover:border-blue-200 transition-all shadow-sm">
            <label className="flex items-center gap-3.5 md:gap-4 cursor-pointer group">
              <div className="relative w-12 h-6 md:w-14 md:h-7 shrink-0">
                <input type="checkbox" {...register('history_brother')} className="sr-only peer" />
                <div className="w-full h-full bg-gray-200 rounded-full peer-checked:bg-blue-600 transition-all" />
                <div className="absolute top-1 left-1 w-4 h-4 md:w-5 md:h-5 bg-white rounded-full transition-all peer-checked:translate-x-6 md:peer-checked:translate-x-7 shadow-md" />
              </div>
              <div>
                <p className="font-black text-blue-900 text-[14px] md:text-[16px] leading-tight">Anh/Em trai ruột mắc Ung thư TTL</p>
                <p className="text-[10px] md:text-[11px] text-gray-400 font-black uppercase tracking-wider mt-0.5">Tiền sử trực hệ (F1)</p>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* 2. CÁC TRIỆU CHỨNG ĐANG GẶP PHẢI (LUTS/OAB theo chuẩn IPSS) */}
      <div className="space-y-4 pt-4 border-t-2 border-gray-100">
        <div>
          <label className="text-[14px] md:text-[16px] font-black text-blue-900 ml-1 uppercase tracking-tight flex items-center gap-2">
            <MessageSquare size={18} className="text-prostate-orange" />
            2. CÁC TRIỆU CHỨNG ĐANG GẶP PHẢI (Khảo sát triệu chứng đường tiểu)
          </label>
          <p className="text-xs sm:text-sm text-slate-500 italic mt-0.5 ml-1">
            Dựa trên bảng đánh giá triệu chứng tiết niệu (LUTS/OAB). Ông vui lòng chọn tình trạng hiện tại của mình:
          </p>
        </div>

        {/* 2 Lựa chọn trạng thái lớn: Không triệu chứng HOẶC Có triệu chứng */}
        <div className="grid sm:grid-cols-2 gap-3 md:gap-4">
          {/* Tùy chọn 1: KHÔNG CÓ TRIỆU CHỨNG */}
          <div
            onClick={() => handleSelectHasSymptoms('NO')}
            className={`p-4 sm:p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3.5 ${
              hasUrinarySymptoms === 'NO'
                ? 'border-emerald-600 bg-emerald-50/70 ring-4 ring-emerald-100/60 shadow-md'
                : 'border-slate-200 bg-white hover:border-emerald-200 hover:bg-slate-50/60'
            }`}
          >
            <input
              type="radio"
              id="no_symptoms"
              name="urinary_status"
              checked={hasUrinarySymptoms === 'NO'}
              onChange={() => handleSelectHasSymptoms('NO')}
              className="w-5 h-5 mt-0.5 text-emerald-600 focus:ring-emerald-500 cursor-pointer shrink-0"
            />
            <label htmlFor="no_symptoms" className="cursor-pointer select-none">
              <span className="block text-[15px] sm:text-base font-black text-slate-900 leading-snug">
                Tôi KHÔNG CÓ triệu chứng đường tiểu
              </span>
              <span className="block text-xs text-slate-500 font-medium mt-1">
                Hiện tại tôi đi tiểu bình thường, không gặp cảm giác khó chịu hay phiền toái.
              </span>
            </label>
          </div>

          {/* Tùy chọn 2: CÓ TRIỆU CHỨNG */}
          <div
            onClick={() => handleSelectHasSymptoms('YES')}
            className={`p-4 sm:p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3.5 ${
              hasUrinarySymptoms === 'YES'
                ? 'border-prostate-navy bg-blue-50/70 ring-4 ring-blue-100/60 shadow-md'
                : 'border-slate-200 bg-white hover:border-blue-200 hover:bg-slate-50/60'
            }`}
          >
            <input
              type="radio"
              id="has_symptoms"
              name="urinary_status"
              checked={hasUrinarySymptoms === 'YES'}
              onChange={() => handleSelectHasSymptoms('YES')}
              className="w-5 h-5 mt-0.5 text-prostate-navy focus:ring-prostate-navy cursor-pointer shrink-0"
            />
            <label htmlFor="has_symptoms" className="cursor-pointer select-none">
              <span className="block text-[15px] sm:text-base font-black text-slate-900 leading-snug">
                Tôi CÓ TRIỆU CHỨNG đường tiểu (LUTS / OAB)
              </span>
              <span className="block text-xs text-slate-500 font-medium mt-1">
                Tôi đang có một hoặc nhiều biểu hiện bất thường khi đi tiểu (tích chọn bên dưới).
              </span>
            </label>
          </div>
        </div>

        {/* DANH SÁCH CÁC TRIỆU CHỨNG LUTS/OAB (Hiển thị khi chọn CÓ TRIỆU CHỨNG) */}
        <AnimatePresence>
          {hasUrinarySymptoms === 'YES' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden space-y-3 pt-2"
            >
              <div className="bg-blue-50/60 p-3 sm:p-4 rounded-xl border border-blue-200/70 flex items-center justify-between">
                <span className="text-xs sm:text-sm font-black text-prostate-navy uppercase tracking-wide flex items-center gap-1.5">
                  <CheckCircle2 size={16} className="text-prostate-orange" />
                  Chọn các triệu chứng Ông đang gặp phải (có thể chọn nhiều):
                </span>
                <span className="text-xs font-bold text-slate-500">
                  Đã chọn: <strong className="text-prostate-navy">{selectedLuts.length}</strong> triệu chứng
                </span>
              </div>

              <div className="grid gap-2.5 sm:grid-cols-2">
                {LUTS_OAB_SYMPTOMS.map((item) => {
                  const isChecked = selectedLuts.includes(item.label);
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleToggleLuts(item.label)}
                      className={`p-3.5 sm:p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 select-none ${
                        isChecked
                          ? 'border-prostate-navy bg-white shadow-md ring-2 ring-blue-100'
                          : 'border-slate-200 bg-white hover:border-blue-200 hover:bg-slate-50/50'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                          isChecked
                            ? 'bg-prostate-navy border-prostate-navy text-white'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {isChecked && <Check size={14} strokeWidth={3} />}
                      </div>
                      <div>
                        <p className={`text-sm sm:text-[15px] font-black leading-snug ${isChecked ? 'text-prostate-navy' : 'text-slate-800'}`}>
                          {item.label}
                        </p>
                        <p className="text-[11px] sm:text-xs text-slate-500 font-medium leading-relaxed mt-0.5">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 3. CÁC TRIỆU CHỨNG KHÁC (CHO PHÉP ĐIỀN VÀO) */}
        <div className="space-y-1.5 md:space-y-2 pt-2">
          <label className="text-[13px] md:text-[14px] font-black text-slate-800 ml-1 uppercase tracking-tight flex items-center gap-2">
            3. Các triệu chứng khác (nếu có, vui lòng ghi rõ bên dưới):
          </label>
          <textarea
            value={otherSymptoms}
            onChange={handleOtherSymptomsChange}
            rows={2}
            className="w-full px-4 py-3 md:px-5 md:py-3.5 bg-gray-50 border-2 border-gray-100 rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-all font-semibold text-[14px] md:text-[15px] text-slate-800 shadow-sm"
            placeholder="VD: Đau tức vùng hạ vị, đau tức vùng tầng sinh môn, sụt cân gần đây, đau nhức vùng lưng hông..."
          />
        </div>
      </div>

      {/* Điều hướng các nút */}
      <div className="flex gap-2 md:gap-4 pt-2 md:pt-4">
        <button
          type="button"
          onClick={() => setStep(2)}
          className="px-4 py-3 md:px-10 md:py-5 bg-white border-2 border-gray-200 text-gray-500 rounded-xl font-black text-[15px] md:text-lg hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center whitespace-nowrap cursor-pointer"
        >
          Quay lại
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={!isEligible()}
          className={`flex-1 py-3 md:py-5 rounded-xl font-black text-[15px] md:text-xl transition-all flex items-center justify-center gap-2 shadow-xl active:scale-[0.98] cursor-pointer ${
            isEligible() ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200' : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
          }`}
        >
          Tiếp tục <ArrowRight size={20} />
        </button>
      </div>

      {!isEligible() && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 md:mt-6 p-4 md:p-6 bg-red-50 rounded-lg border border-red-100 flex items-center gap-3 md:gap-4">
          <AlertCircle className="text-red-500 shrink-0" size={20} />
          <p className="text-red-800 font-bold text-[12px] md:text-[14px]">
            Ông không thuộc nhóm đối tượng tầm soát của chương trình (Độ tuổi 45 đến dưới 50 tuổi yêu cầu có tiền sử gia đình).
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Step3MedicalHistory;
