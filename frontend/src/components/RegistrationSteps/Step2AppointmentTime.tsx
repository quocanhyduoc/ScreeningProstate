import React from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';

interface Step2Props {
  setValue: any;
  watch: any;
  setStep: (step: number) => void;
  TIME_SLOTS: any[];
  slotStats: any;
  error: string;
  handleNext: () => void;
}

const Step2AppointmentTime: React.FC<Step2Props> = ({
  setValue,
  watch,
  setStep,
  TIME_SLOTS,
  slotStats,
  error,
  handleNext
}) => {
  const formData = watch();

  return (
    <motion.div
      key="s2"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-5 md:space-y-8"
    >
      <div>
        <h2 className="text-2xl md:text-3xl font-black text-blue-900 mb-2 md:mb-3 tracking-tight">Khung giờ khám</h2>
        <p className="text-[14px] md:text-base text-gray-400 font-medium italic">Chọn thời gian thuận tiện nhất để chúng tôi chuẩn bị đón tiếp.</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 md:gap-6">
        {TIME_SLOTS.map((slot) => (
          <button
            key={slot.id}
            type="button"
            onClick={() => setValue('appointment_slot', slot.value)}
            className={`p-5 md:p-8 rounded-2xl border-2 text-left transition-all relative overflow-hidden group ${
              formData.appointment_slot === slot.value
                ? 'border-blue-600 bg-blue-50 ring-4 md:ring-8 ring-blue-50/50'
                : 'border-gray-100 bg-white hover:border-blue-200 hover:bg-gray-50 shadow-sm'
            }`}
          >
            <div className="flex justify-between items-start mb-3 md:mb-4">
              <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center ${formData.appointment_slot === slot.value ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                <Clock size={20} className="md:w-6 md:h-6" />
              </div>
              {formData.appointment_slot === slot.value && <CheckCircle className="text-blue-600" size={24} />}
            </div>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[13px] md:text-[15px] font-black text-blue-400 uppercase tracking-widest mb-1.5">{slot.date}</p>
                <p className={`text-lg md:text-2xl font-black ${formData.appointment_slot === slot.value ? 'text-blue-900' : 'text-gray-700'}`}>{slot.label}</p>
              </div>
            </div>
            {(slotStats[slot.value] || 0) >= slot.limit && (
              <div className="mt-3 md:mt-4 flex items-center gap-2 text-[10px] md:text-[12px] font-black text-red-500 uppercase tracking-tight bg-red-50 p-2 rounded-lg">
                <AlertCircle size={14} /> Đã đủ số lượng (ExtraSlot)
              </div>
            )}
          </button>
        ))}
      </div>

      {formData.appointment_slot && (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-4 md:p-8 rounded-2xl border-2 flex flex-col sm:flex-row gap-4 md:gap-6 items-center sm:items-start shadow-xl ${
                (slotStats[formData.appointment_slot] || 0) >= 90 
                ? 'bg-orange-50 border-orange-200 text-orange-900' 
                : 'bg-blue-50 border-blue-200 text-blue-900'
            }`}
        >
            <div className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center shrink-0 ${
                (slotStats[formData.appointment_slot] || 0) >= 90 ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
            }`}>
                <AlertCircle size={28} className="md:w-9 md:h-9" />
            </div>
            <div className="text-center sm:text-left">
                <p className="font-black text-[16px] md:text-[20px] leading-tight mb-2">
                    Hiện tại có {slotStats[formData.appointment_slot] || 0} bệnh nhân đã đăng ký.
                </p>
                {(slotStats[formData.appointment_slot] || 0) >= 90 && (
                    <p className="text-[14px] md:text-[16px] font-bold opacity-90 leading-relaxed">
                        Khung giờ này khá đông, vui lòng xem xét chọn buổi khác để giảm chờ đợi. Nếu vẫn muốn khám vào buổi này, Ông có thể nhấn "Tiếp tục".
                    </p>
                )}
                {(slotStats[formData.appointment_slot] || 0) < 90 && (
                    <p className="text-[14px] md:text-[16px] font-bold opacity-90 leading-relaxed">
                        Số lượng đăng ký ổn định, Ông có thể yên tâm lựa chọn khung giờ này.
                    </p>
                )}
            </div>
        </motion.div>
      )}

      {error && (
        <div className="p-3 md:p-4 bg-red-50 border-2 border-red-100 rounded-xl flex items-center justify-center gap-2 md:gap-3">
            <AlertCircle className="text-red-500" size={18} />
            <p className="text-red-500 text-[15px] md:text-lg font-black italic">{error}</p>
        </div>
      )}

      <div className="flex gap-4 pt-2 md:pt-4">
        <button
          type="button"
          onClick={handleNext}
          className="flex-1 py-3 md:py-6 bg-blue-600 text-white rounded-xl md:rounded-2xl font-black text-[15px] md:text-2xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 md:gap-4 shadow-xl md:shadow-2xl shadow-blue-200 active:scale-[0.98]"
        >
          Tiếp tục <ArrowRight size={20} className="md:w-7 md:h-7" />
        </button>
      </div>
    </motion.div>
  );
};

export default Step2AppointmentTime;
