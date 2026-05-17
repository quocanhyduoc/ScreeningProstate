import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Check } from 'lucide-react';

interface Step4Props {
  register: any;
  handleSubmit: any;
  onSubmit: (data: any) => Promise<void>;
  setStep: (step: number) => void;
  watch: any;
  errors: any;
  isSubmitting: boolean;
  error: string;
}

const Step4Confirmation: React.FC<Step4Props> = ({
  register,
  handleSubmit,
  onSubmit,
  setStep,
  watch,
  errors,
  isSubmitting,
  error
}) => {
  const formData = watch();

  return (
    <motion.div
      key="s4"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <div className="text-center">
        <div className="inline-flex w-16 h-16 bg-blue-50 text-blue-600 rounded-lg items-center justify-center mb-6">
          <CheckCircle size={32} />
        </div>
        <h2 className="text-3xl font-black text-blue-900 mb-2 tracking-tight">Xác nhận thông tin</h2>
        <p className="text-gray-400 font-medium">Vui lòng kiểm tra kỹ lần cuối trước khi gửi.</p>
      </div>

      <div className="bg-gray-50 rounded-2xl p-8 border-2 border-gray-100 space-y-6 shadow-sm">
        <div className="grid grid-cols-2 gap-y-6 text-[18px]">
          <div className="text-gray-400 font-black uppercase tracking-tight text-[13px] self-center">Họ và tên</div>
          <div className="text-right font-black text-blue-900 uppercase">{formData.full_name}</div>
          
          <div className="text-gray-400 font-black uppercase tracking-tight text-[13px] self-center">Số điện thoại</div>
          <div className="text-right font-black text-gray-700">{formData.phone}</div>

          <div className="text-gray-400 font-black uppercase tracking-tight text-[13px] self-center">Địa chỉ</div>
          <div className="text-right font-black text-gray-600 text-[15px] leading-tight italic">
            {formData.address_detail}, {formData.ward}, <br /> {formData.district}, {formData.province}
          </div>

          <div className="text-gray-400 font-black uppercase tracking-tight text-[13px] self-center">Thời gian khám</div>
          <div className="text-right">
            <span className="font-black text-blue-600 bg-blue-100 px-4 py-2 rounded-xl inline-block">
              {formData.appointment_slot}
            </span>
          </div>

          <div className="text-gray-400 font-black uppercase tracking-tight text-[13px] self-center">Tiền sử gia đình</div>
          <div className="text-right font-black">
            {formData.history_father && <span className="block text-red-600 underline underline-offset-4 decoration-2">Bố ruột bị K Tuyến tiền liệt</span>}
            {formData.history_brother && <span className="block text-red-600 underline underline-offset-4 decoration-2">Anh/Em ruột bị K Tuyến tiền liệt</span>}
            {!formData.history_father && !formData.history_brother && <span className="text-gray-500 italic">Không có tiền sử</span>}
          </div>
        </div>
      </div>

      <div className="flex items-start gap-6 p-6 bg-blue-50/50 rounded-2xl border-2 border-blue-200/50 shadow-sm group cursor-pointer active:bg-blue-100 transition-all">
        <div className="flex items-center h-8">
          <input
            id="consent"
            type="checkbox"
            {...register('consent', { required: true })}
            className="w-8 h-8 text-blue-600 border-2 border-blue-200 rounded-lg focus:ring-blue-500 cursor-pointer"
          />
        </div>
        <label htmlFor="consent" className="text-[15px] text-blue-950 font-black leading-relaxed cursor-pointer select-none">
          Tôi xin cam đoan các thông tin đã cung cấp là chính xác và đồng ý tham gia chương trình tầm soát tại Bệnh viện Trung ương Huế.
        </label>
      </div>

      {errors.consent && (
        <motion.p initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-red-600 text-[14px] font-black text-center bg-red-50 p-3 rounded-lg border border-red-100">
          (!) Ông cần đánh dấu vào ô đồng ý ở trên để tiếp tục.
        </motion.p>
      )}
      
      {error && <p className="text-red-600 text-lg font-black text-center bg-red-50 p-4 rounded-xl border-2 border-red-100">{error}</p>}

      <div className="flex gap-4 pt-4">
        <button
          type="button"
          onClick={() => setStep(3)}
          className="px-10 py-5 bg-white border-2 border-gray-200 text-gray-500 rounded-xl font-black text-lg hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-2"
        >
          Quay lại
        </button>
        <button
          type="button"
          onClick={handleSubmit(onSubmit)}
          disabled={isSubmitting}
          className="flex-1 py-6 bg-green-600 text-white rounded-2xl font-black text-2xl hover:bg-green-700 transition-all flex items-center justify-center gap-4 shadow-2xl shadow-green-100 disabled:bg-gray-400 active:scale-[0.98]"
        >
          {isSubmitting ? 'ĐANG GỬI...' : 'XÁC NHẬN & GỬI NGAY'} <Check size={28} />
        </button>
      </div>
    </motion.div>
  );
};

export default Step4Confirmation;
