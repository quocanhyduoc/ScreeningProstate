import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, ArrowRight, AlertCircle } from 'lucide-react';

interface Step3Props {
  register: any;
  setStep: (step: number) => void;
  isEligible: () => boolean;
  handleNext: () => void;
}

const Step3MedicalHistory: React.FC<Step3Props> = ({
  register,
  setStep,
  isEligible,
  handleNext
}) => {
  return (
    <motion.div
      key="s3"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-5 md:space-y-8"
    >
      <div>
        <h2 className="text-2xl md:text-3xl font-black text-blue-900 mb-2 md:mb-3 tracking-tight">Tiền sử & Triệu chứng</h2>
        <p className="text-[14px] md:text-base text-gray-400 font-medium italic">Những thông tin này giúp bác sĩ đánh giá nguy cơ chính xác hơn.</p>
      </div>

      <div className="space-y-4 md:space-y-5">
        <div className="p-4 md:p-6 bg-gray-50 rounded-2xl border-2 border-gray-100 hover:border-blue-200 transition-all shadow-sm">
          <label className="flex items-center gap-4 md:gap-6 cursor-pointer group">
            <div className="relative w-14 h-7 md:w-16 md:h-8 shrink-0">
              <input type="checkbox" {...register('history_father')} className="sr-only peer" />
              <div className="w-full h-full bg-gray-200 rounded-lg peer-checked:bg-blue-600 transition-all" />
              <div className="absolute top-1 left-1 w-5 h-5 md:w-6 md:h-6 bg-white rounded-md transition-all peer-checked:translate-x-7 md:peer-checked:translate-x-8 shadow-md" />
            </div>
            <div>
              <p className="font-black text-blue-900 text-[15px] md:text-[18px] leading-tight">Bố ruột có tiền sử Ung thư Tuyến tiền liệt?</p>
              <p className="text-[10px] md:text-[12px] text-gray-400 font-black uppercase tracking-widest mt-1">Tiền sử trực hệ (F1)</p>
            </div>
          </label>
        </div>

        <div className="p-4 md:p-6 bg-gray-50 rounded-2xl border-2 border-gray-100 hover:border-blue-200 transition-all shadow-sm">
          <label className="flex items-center gap-4 md:gap-6 cursor-pointer group">
            <div className="relative w-14 h-7 md:w-16 md:h-8 shrink-0">
              <input type="checkbox" {...register('history_brother')} className="sr-only peer" />
              <div className="w-full h-full bg-gray-200 rounded-lg peer-checked:bg-blue-600 transition-all" />
              <div className="absolute top-1 left-1 w-5 h-5 md:w-6 md:h-6 bg-white rounded-md transition-all peer-checked:translate-x-7 md:peer-checked:translate-x-8 shadow-md" />
            </div>
            <div>
              <p className="font-black text-blue-900 text-[15px] md:text-[18px] leading-tight">Anh/Em ruột bị Ung thư Tuyến tiền liệt?</p>
              <p className="text-[10px] md:text-[12px] text-gray-400 font-black uppercase tracking-widest mt-1">Tiền sử trực hệ (F1)</p>
            </div>
          </label>
        </div>
      </div>

      <div className="space-y-2 md:space-y-3">
        <label className="text-[13px] md:text-[15px] font-black text-blue-900 ml-1 uppercase tracking-tight flex items-center gap-2">
          <MessageSquare size={16} className="text-blue-600 md:w-[18px]" /> CÁC TRIỆU CHỨNG ĐANG GẶP PHẢI (NẾU CÓ)
        </label>
        <textarea
          {...register('symptoms')}
          rows={3}
          className="w-full px-4 py-3 md:px-6 md:py-5 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all font-black text-[16px] md:text-[18px] text-blue-900 shadow-sm"
          placeholder="VD: Tiểu đêm, tiểu khó, đau tức vùng hạ vị..."
        />
      </div>

      <div className="flex gap-2 md:gap-4 pt-2 md:pt-4">
        <button
          type="button"
          onClick={() => setStep(2)}
          className="px-4 py-3 md:px-10 md:py-5 bg-white border-2 border-gray-200 text-gray-500 rounded-xl font-black text-[15px] md:text-lg hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center whitespace-nowrap"
        >
          Quay lại
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={!isEligible()}
          className={`flex-1 py-3 md:py-5 rounded-xl font-black text-[15px] md:text-xl transition-all flex items-center justify-center gap-2 shadow-xl active:scale-[0.98] ${
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
            Bạn không thuộc nhóm tầm soát ung thư tuyến tiền liệt. (Yêu cầu tiền sử gia đình cho độ tuổi 45-50).
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Step3MedicalHistory;
