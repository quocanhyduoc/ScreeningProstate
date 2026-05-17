import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Activity, ArrowDown, ChevronRight, ClipboardList, Clock } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { formatDate } from '../../utils/date';
import { HOSPITAL_LOGO_BASE64 } from '../../utils/logo';

interface Step5Props {
  registrationResult: any;
  badgeRef: React.RefObject<HTMLDivElement>;
  handleDownloadBadge: () => Promise<void>;
  setStep: (step: number) => void;
}

const Step5SuccessBadge: React.FC<Step5Props> = ({
  registrationResult,
  badgeRef,
  handleDownloadBadge,
  setStep
}) => {
  const [showSurveyPrompt, setShowSurveyPrompt] = useState(true);

  return (
    <motion.div
      key="success"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="text-center py-4 space-y-6"
    >
      <div className="relative inline-block">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mx-auto border-4 border-white shadow-lg">
          <CheckCircle size={32} strokeWidth={3} />
        </div>
      </div>

      <div>
        <h2 className="text-3xl font-black text-blue-900 mb-2 tracking-tight">Đăng ký thành công!</h2>
        <p className="text-gray-400 font-medium text-[14px]">Hệ thống đã ghi nhận thông tin đăng ký của Ông.</p>
      </div>

      {/* Smart ID Card Badge */}
      <div className="relative group w-full max-w-[380px] mx-auto my-6 sm:my-8">
        <div className="absolute -inset-4 bg-blue-100/50 rounded-[20px] blur-xl opacity-50 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
        <div ref={badgeRef} className="relative bg-white rounded-[12px] shadow-2xl border border-slate-200 text-left overflow-hidden w-full aspect-[1.586/1] flex flex-col mx-auto transition-transform duration-500 hover:scale-[1.02]">
          {/* Header Banner */}
          <div className="bg-[#005ba1] p-2 sm:p-3 text-white flex justify-between items-center h-[18%] sm:h-[65px]">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-7 h-7 sm:w-9 sm:h-9 bg-white rounded-lg flex items-center justify-center p-1 shadow-sm">
                <img src={HOSPITAL_LOGO_BASE64} alt="Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <p className="text-[8px] sm:text-[10px] font-black leading-tight uppercase tracking-tight">Bệnh viện Trung ương Huế</p>
                <p className="text-[6px] sm:text-[8px] font-bold text-blue-100 uppercase tracking-widest">Chương trình Sàng lọc miễn phí</p>
              </div>
            </div>
            <div className="text-right flex items-center gap-2 sm:gap-3">
              <div className="hidden sm:block">
                <p className="text-[7px] font-black uppercase tracking-[0.2em] opacity-60">PROSTATE</p>
                <p className="text-[9px] font-black tracking-tighter">2026</p>
              </div>
              <Activity className="text-blue-300 opacity-80 w-4 h-4 sm:w-6 sm:h-6" />
            </div>
          </div>

          <div className="flex-1 pt-2 pb-4 px-4 sm:pt-3 sm:pb-10 sm:px-6 flex">
            {/* Left Info Section */}
            <div className="flex-1 space-y-2 sm:space-y-2.5 pt-1 pr-2 sm:pr-4 border-r border-slate-100">
              <div>
                <h3 className="text-[7px] sm:text-[9px] font-black text-[#005ba1] uppercase tracking-[0.1em] mb-1 sm:mb-1.5 opacity-80">Thẻ Tầm Soát Ung Thư TTL</h3>
                <div className="space-y-0">
                  <p className="text-[7px] sm:text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Họ và tên</p>
                  <p className="text-[14px] sm:text-[17px] font-black text-[#003d6b] uppercase leading-tight whitespace-nowrap truncate">{registrationResult?.full_name}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                <div className="space-y-0">
                  <p className="text-[7px] sm:text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Ngày sinh</p>
                  <p className="text-[11px] sm:text-[13px] font-black text-slate-800">{formatDate(registrationResult?.dob)}</p>
                </div>
                <div className="space-y-0">
                  <p className="text-[7px] sm:text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Số CCCD</p>
                  <p className="text-[11px] sm:text-[13px] font-black text-slate-800">{registrationResult?.cccd}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                <div className="space-y-0">
                  <p className="text-[7px] sm:text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Mã đăng ký</p>
                  <p className="text-[14px] sm:text-[16px] font-black text-[#005ba1]">{registrationResult?.registration_number}</p>
                </div>
                <div className="space-y-0">
                  <p className="text-[7px] sm:text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Ngày đăng ký</p>
                  <p className="text-[10px] sm:text-[12px] font-black text-slate-600">{formatDate(registrationResult?.created_at)}</p>
                </div>
              </div>
            </div>

            {/* Right QR Section */}
            <div className="w-[85px] sm:w-[115px] flex flex-col items-center justify-center pt-1 pl-3 sm:pl-4">
              <div className="p-1 w-full bg-white border-[1.5px] border-[#005ba1] rounded-lg shadow-sm">
                <QRCodeSVG
                  value={String(registrationResult?.cccd)}
                  className="w-full h-auto"
                  level="H"
                  includeMargin={false}
                />
              </div>
              <div className="mt-2 sm:mt-2.5 space-y-1 w-full text-center">
                <p className="text-[6px] sm:text-[8px] font-black text-[#005ba1] uppercase tracking-widest">Quét Check-in</p>
                <div className="px-1 py-1 sm:px-2 bg-blue-50 text-[#005ba1] rounded-md text-[6px] sm:text-[7px] font-black border border-blue-100 uppercase text-center flex flex-col items-center leading-tight">
                  <span>{registrationResult?.appointment_slot?.split(" ")[0]}</span>
                  <span className="mt-0.5 pt-0.5 border-t border-blue-200/50 w-full">
                    {registrationResult?.appointment_slot?.split(" ")[1]}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Decoration */}
          <div className="h-1 sm:h-1.5 bg-[#005ba1] w-full flex">
            <div className="flex-1 bg-blue-400 opacity-40" />
            <div className="flex-1 bg-blue-500 opacity-60" />
            <div className="flex-1 bg-[#005ba1]" />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 max-w-sm mx-auto pt-4">
        <button
          onClick={handleDownloadBadge}
          className="w-full py-4 bg-emerald-600 text-white rounded-xl font-black flex items-center justify-center gap-2 shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-95"
        >
          <ArrowDown size={20} /> TẢI THẺ ĐĂNG KÝ (BADGE)
        </button>

        <div className="mt-8 p-6 bg-blue-50 rounded-2xl border-2 border-blue-100 space-y-4">
          <h4 className="text-lg font-black text-blue-900 leading-tight">Ông có muốn thực hiện Khảo sát sàng lọc lâm sàng ngay bây giờ không?</h4>
          <p className="text-[13px] text-blue-600 font-bold leading-relaxed">
            Việc trả lời trước các câu hỏi lâm sàng sẽ giúp Ông tiết kiệm thời gian khi đến bệnh viện.
          </p>

          <div className="grid grid-cols-1 gap-3 pt-2">
            <button
              onClick={() => setStep(6)}
              className="w-full py-4 bg-blue-600 text-white rounded-xl font-black flex items-center justify-center gap-2 shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"
            >
              <ClipboardList size={20} /> LÀM KHẢO SÁT NGAY
            </button>
            <button
              onClick={() => setStep(7)}
              className="w-full py-4 bg-white text-slate-500 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-all border border-slate-200"
            >
              <Clock size={20} /> ĐỂ SAU (HOÀN TẤT)
            </button>
          </div>

          <p className="text-[11px] text-slate-400 font-medium italic mt-4">
            * Nếu chọn "Để sau", Ông có thể hoàn thành khảo sát vào ngày đi khám với sự hướng dẫn của nhân viên y tế.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default Step5SuccessBadge;
