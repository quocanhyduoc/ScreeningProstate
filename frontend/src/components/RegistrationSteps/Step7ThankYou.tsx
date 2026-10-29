import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Clock } from 'lucide-react';

interface Step7Props {
  registrationResult: any;
}

const Step7ThankYou: React.FC<Step7Props> = ({ registrationResult }) => {
  return (
    <motion.div
      key="final"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="text-center py-16 space-y-10"
    >
      <div className="w-28 h-28 bg-green-100 rounded-3xl flex items-center justify-center text-green-600 mx-auto shadow-2xl border-[6px] border-white">
        <CheckCircle size={64} strokeWidth={3} />
      </div>

      <div className="space-y-6">
        <h2 className="text-4xl font-black text-blue-900 leading-tight uppercase tracking-tight">
          CÁM ƠN ÔNG ĐÃ HOÀN THÀNH <br />
          <span className="text-blue-600">ĐĂNG KÝ VÀ SÀNG LỌC</span>
        </h2>

        <div className="p-8 bg-blue-50 rounded-3xl border-4 border-white shadow-xl inline-block max-w-lg mx-auto">
          <p className="text-[13px] sm:text-[15px] font-black text-blue-900 uppercase tracking-widest mb-3">LỊCH HẸN KHÁM CỦA ÔNG:</p>
          <div className="flex items-center justify-center gap-3 text-2xl sm:text-3xl font-black text-blue-700">
            <Clock size={32} /> {registrationResult?.appointment_slot || 'Sẽ cập nhật sau'}
          </div>
          <p className="text-xs sm:text-[13px] text-blue-500 font-bold mt-3 leading-relaxed">
            Ban tổ chức sẽ liên hệ trực tiếp qua Số điện thoại của Ông để thông báo thời gian và số thứ tự khám cụ thể.
          </p>
          <p className="text-[12px] text-blue-400 font-black mt-3 uppercase tracking-widest border-t border-blue-100 pt-2">BỆNH VIỆN QUỐC TẾ TRUNG ƯƠNG HUẾ</p>
        </div>
      </div>

      <div className="max-w-xl mx-auto space-y-8">
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
          <p className="text-slate-600 text-base sm:text-lg font-bold leading-relaxed">
            Vui lòng lưu lại Thẻ đăng ký (Mã số hoặc ảnh thẻ QR) và chú ý điện thoại để nhận thông báo từ Bệnh viện Trung ương Huế.
          </p>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="w-full py-6 bg-blue-600 text-white rounded-2xl font-black text-2xl hover:bg-blue-700 transition-all shadow-2xl shadow-blue-200 active:scale-[0.98] uppercase"
        >
          QUAY LẠI TRANG CHỦ
        </button>
      </div>
    </motion.div>
  );
};

export default Step7ThankYou;
