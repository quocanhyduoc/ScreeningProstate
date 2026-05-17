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
      className="space-y-8"
    >
      <div>
        <h2 className="text-3xl font-black text-blue-900 mb-3 tracking-tight">Tiền sử & Triệu chứng</h2>
        <p className="text-gray-400 font-medium italic">Những thông tin này giúp bác sĩ đánh giá nguy cơ chính xác hơn.</p>
      </div>

      <div className="space-y-5">
        <div className="p-6 bg-gray-50 rounded-2xl border-2 border-gray-100 hover:border-blue-200 transition-all shadow-sm">
          <label className="flex items-center gap-6 cursor-pointer group">
            <div className="relative w-16 h-8 shrink-0">
              <input type="checkbox" {...register('history_father')} className="sr-only peer" />
              <div className="w-full h-full bg-gray-200 rounded-lg peer-checked:bg-blue-600 transition-all" />
              <div className="absolute top-1 left-1 w-6 h-6 bg-white rounded-md transition-all peer-checked:translate-x-8 shadow-md" />
            </div>
            <div>
              <p className="font-black text-blue-900 text-[18px] leading-tight">Bố ruột có tiền sử Ung thư Tuyến tiền liệt?</p>
              <p className="text-[12px] text-gray-400 font-black uppercase tracking-widest mt-1">Tiền sử trực hệ (F1)</p>
            </div>
          </label>
        </div>

        <div className="p-6 bg-gray-50 rounded-2xl border-2 border-gray-100 hover:border-blue-200 transition-all shadow-sm">
          <label className="flex items-center gap-6 cursor-pointer group">
            <div className="relative w-16 h-8 shrink-0">
              <input type="checkbox" {...register('history_brother')} className="sr-only peer" />
              <div className="w-full h-full bg-gray-200 rounded-lg peer-checked:bg-blue-600 transition-all" />
              <div className="absolute top-1 left-1 w-6 h-6 bg-white rounded-md transition-all peer-checked:translate-x-8 shadow-md" />
            </div>
            <div>
              <p className="font-black text-blue-900 text-[18px] leading-tight">Anh/Em ruột bị Ung thư Tuyến tiền liệt?</p>
              <p className="text-[12px] text-gray-400 font-black uppercase tracking-widest mt-1">Tiền sử trực hệ (F1)</p>
            </div>
          </label>
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-[15px] font-black text-blue-900 ml-1 uppercase tracking-tight flex items-center gap-2">
          <MessageSquare size={18} className="text-blue-600" /> CÁC TRIỆU CHỨNG ĐANG GẶP PHẢI (NẾU CÓ)
        </label>
        <textarea
          {...register('symptoms')}
          rows={4}
          className="w-full px-6 py-5 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all font-black text-[18px] text-blue-900 shadow-sm"
          placeholder="VD: Tiểu đêm, tiểu khó, đau tức vùng hạ vị..."
        />
      </div>

      <div className="flex gap-4 pt-4">
        <button
          type="button"
          onClick={() => setStep(2)}
          className="px-10 py-5 bg-white border-2 border-gray-200 text-gray-500 rounded-xl font-black text-lg hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-2"
        >
          Quay lại
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={!isEligible()}
          className={`flex-1 py-5 rounded-xl font-black text-xl transition-all flex items-center justify-center gap-3 shadow-2xl active:scale-[0.98] ${
            isEligible() ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200' : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
          }`}
        >
          Tiếp tục <ArrowRight size={24} />
        </button>
      </div>

      {!isEligible() && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 p-6 bg-red-50 rounded-lg border border-red-100 flex items-center gap-4">
          <AlertCircle className="text-red-500 shrink-0" size={24} />
          <p className="text-red-800 font-bold text-[14px]">
            Bạn không thuộc nhóm tầm soát ung thư tuyến tiền liệt. (Yêu cầu tiền sử gia đình cho độ tuổi 45-50).
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Step3MedicalHistory;
