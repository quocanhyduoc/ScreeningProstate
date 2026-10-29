import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, CalendarCheck, UserCheck, ArrowRight, AlertCircle, FileText } from 'lucide-react';

interface Step1ConsentProps {
  watch: any;
  setValue: any;
  handleNext: () => void;
  error?: string;
}

const Step1Consent: React.FC<Step1ConsentProps> = ({
  watch,
  setValue,
  handleNext,
  error
}) => {
  const eligibilityGroup = watch('eligibility_group');
  const consentAgree = watch('consent_agree');

  return (
    <motion.div
      key="step-consent"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6 md:space-y-8"
    >
      {/* Header Banner */}
      <div className="border-b border-slate-100 pb-5">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/60 text-prostate-navy text-xs font-black uppercase tracking-wider mb-3">
          <FileText size={14} className="text-prostate-orange" />
          Bước 1 / 4: Xác nhận đối tượng & Đồng thuận
        </div>
        <h2 className="text-2xl sm:text-3xl font-black font-display text-prostate-navy tracking-tight leading-tight uppercase">
          PHIẾU THÔNG TIN & ĐỒNG THUẬN THAM GIA
        </h2>
        <p className="text-sm sm:text-base text-slate-500 font-semibold mt-1.5">
          Chương trình Tầm soát Ung thư Tuyến tiền liệt Miễn phí 2026 – Bệnh viện Trung ương Huế.
        </p>
      </div>

      {/* MỤC 1: CHỌN ĐỐI TƯỢNG THAM GIA */}
      <div className="space-y-3">
        <label className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
          <UserCheck size={18} className="text-blue-600" />
          1. Xác nhận nhóm đối tượng tham gia <span className="text-red-500">*</span>
        </label>
        <p className="text-xs sm:text-sm text-slate-500 italic">
          Chương trình chỉ áp dụng cho nam giới dưới 70 tuổi. Vui lòng chọn đúng nhóm tiêu chí của Ông:
        </p>

        <div className="grid gap-3 sm:gap-4 pt-1">
          {/* Lựa chọn 1: 50-70 tuổi */}
          <div
            onClick={() => setValue('eligibility_group', '50_TO_69', { shouldValidate: true })}
            className={`p-4 sm:p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3.5 ${
              eligibilityGroup === '50_TO_69'
                ? 'border-prostate-navy bg-blue-50/70 ring-4 ring-blue-100/60 shadow-md'
                : 'border-slate-200 bg-white hover:border-blue-200 hover:bg-slate-50/60'
            }`}
          >
            <input
              type="radio"
              id="group_50_70"
              name="eligibility_group"
              checked={eligibilityGroup === '50_TO_69'}
              onChange={() => setValue('eligibility_group', '50_TO_69', { shouldValidate: true })}
              className="w-5 h-5 mt-0.5 text-prostate-navy focus:ring-prostate-navy cursor-pointer shrink-0"
            />
            <label htmlFor="group_50_70" className="cursor-pointer select-none">
              <span className="block text-base sm:text-lg font-black text-slate-900 leading-snug">
                Tôi là nam giới nằm trong độ tuổi từ 50 đến dưới 70 tuổi.
              </span>
              <span className="block text-xs sm:text-sm text-slate-500 font-medium mt-1">
                Nhóm đối tượng phổ quát được khuyến cáo tầm soát ung thư tuyến tiền liệt định kỳ.
              </span>
            </label>
          </div>

          {/* Lựa chọn 2: 45-70 tuổi có tiền sử */}
          <div
            onClick={() => setValue('eligibility_group', '45_TO_69_FAMILY', { shouldValidate: true })}
            className={`p-4 sm:p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3.5 ${
              eligibilityGroup === '45_TO_69_FAMILY'
                ? 'border-prostate-navy bg-blue-50/70 ring-4 ring-blue-100/60 shadow-md'
                : 'border-slate-200 bg-white hover:border-blue-200 hover:bg-slate-50/60'
            }`}
          >
            <input
              type="radio"
              id="group_45_70"
              name="eligibility_group"
              checked={eligibilityGroup === '45_TO_69_FAMILY'}
              onChange={() => setValue('eligibility_group', '45_TO_69_FAMILY', { shouldValidate: true })}
              className="w-5 h-5 mt-0.5 text-prostate-navy focus:ring-prostate-navy cursor-pointer shrink-0"
            />
            <label htmlFor="group_45_70" className="cursor-pointer select-none">
              <span className="block text-base sm:text-lg font-black text-slate-900 leading-snug">
                Tôi là nam giới nằm trong độ tuổi từ 45 đến dưới 70 tuổi và có bố hoặc anh/em trai ruột trong gia đình mắc ung thư tuyến tiền liệt.
              </span>
              <span className="block text-xs sm:text-sm text-slate-500 font-medium mt-1">
                Nhóm đối tượng có yếu tố nguy cơ di truyền cần bắt đầu tầm soát sớm từ 45 tuổi.
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* MỤC 2: CÁC NỘI DUNG ĐỒNG THUẬN & CAM KẾT */}
      <div className="space-y-3 pt-2">
        <label className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
          <ShieldCheck size={18} className="text-emerald-600" />
          2. Nội dung đồng thuận và cam kết trách nhiệm
        </label>

        <div className="bg-slate-50 rounded-2xl p-4 sm:p-6 border border-slate-200/80 space-y-4 text-slate-700 text-sm sm:text-[15px] leading-relaxed">
          {/* Cam kết 1 */}
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-blue-100/80 text-prostate-navy flex items-center justify-center shrink-0 mt-0.5 font-black text-xs">
              1
            </div>
            <div>
              <p className="font-black text-slate-900">Đồng ý chia sẻ thông tin cho Ban tổ chức:</p>
              <p className="text-slate-600 mt-0.5 font-medium">
                Tôi tự nguyện cung cấp các thông tin hành chính cá nhân (Họ tên, ngày sinh, số CCCD, số điện thoại, địa chỉ) và thông tin tiền sử sức khỏe cho Ban tổ chức (Bệnh viện Trung ương Huế & Hội Tiết niệu - Thận học Việt Nam) nhằm mục đích lập hồ sơ đăng ký và phục vụ công tác khám tầm soát.
              </p>
            </div>
          </div>

          {/* Cam kết 2 */}
          <div className="flex items-start gap-3 pt-2 border-t border-slate-200/60">
            <div className="w-7 h-7 rounded-lg bg-emerald-100/80 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
              <Lock size={14} />
            </div>
            <div>
              <p className="font-black text-slate-900">Cam kết bảo mật thông tin từ Ban tổ chức:</p>
              <p className="text-slate-600 mt-0.5 font-medium">
                Ban tổ chức cam kết toàn bộ thông tin cá nhân và kết quả y khoa của người tham gia được bảo mật tuyệt đối theo các quy chuẩn lưu trữ hồ sơ bệnh án của Bộ Y tế và pháp luật hiện hành. Thông tin chỉ được sử dụng cho mục đích chăm sóc sức khỏe và nghiên cứu khoa học của chương trình, tuyệt đối không chia sẻ cho bên thứ ba vì mục đích thương mại.
              </p>
            </div>
          </div>

          {/* Cam kết 3 */}
          <div className="flex items-start gap-3 pt-2 border-t border-slate-200/60">
            <div className="w-7 h-7 rounded-lg bg-orange-100/80 text-prostate-orange flex items-center justify-center shrink-0 mt-0.5">
              <CalendarCheck size={14} />
            </div>
            <div>
              <p className="font-black text-slate-900">Cam kết tham gia thăm khám đúng thời gian:</p>
              <p className="text-slate-600 mt-0.5 font-medium">
                Do số lượng suất khám miễn phí có giới hạn (chỉ 300 suất), tôi cam kết sẽ theo dõi thông báo và sắp xếp thời gian có mặt tham gia thăm khám đầy đủ, đúng thời gian và địa điểm khi nhận được thông báo lịch khám chính thức từ Ban tổ chức Bệnh viện Trung ương Huế.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CHECKBOX XÁC NHẬN */}
      <div 
        onClick={() => setValue('consent_agree', !consentAgree, { shouldValidate: true })}
        className={`p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3.5 ${
          consentAgree 
            ? 'border-emerald-500 bg-emerald-50/50 shadow-sm' 
            : 'border-slate-200 bg-white hover:border-slate-300'
        }`}
      >
        <input
          type="checkbox"
          id="consent_checkbox"
          checked={!!consentAgree}
          onChange={(e) => setValue('consent_agree', e.target.checked, { shouldValidate: true })}
          className="w-5 h-5 sm:w-6 sm:h-6 mt-0.5 text-emerald-600 border-2 border-slate-300 rounded focus:ring-emerald-500 cursor-pointer shrink-0"
        />
        <label htmlFor="consent_checkbox" className="text-xs sm:text-sm md:text-base font-black text-slate-900 leading-snug cursor-pointer select-none">
          Tôi xác nhận mình là nam giới, đã đọc kỹ, hiểu rõ toàn bộ nội dung trên và hoàn toàn tự nguyện đồng ý tham gia chương trình.
        </label>
      </div>

      {/* Error message */}
      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -5 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-red-700 text-sm font-bold"
        >
          <AlertCircle size={18} className="shrink-0 text-red-500" />
          <span>{error}</span>
        </motion.div>
      )}

      {/* Action Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleNext}
          disabled={!eligibilityGroup || !consentAgree}
          className={`w-full py-4 sm:py-5 rounded-2xl font-black text-base sm:text-xl uppercase tracking-wider flex items-center justify-center gap-3 transition-all ${
            eligibilityGroup && consentAgree
              ? 'bg-prostate-navy text-white hover:bg-prostate-navy/95 shadow-xl shadow-prostate-navy/20 active:scale-[0.99] cursor-pointer'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
          }`}
        >
          ĐỒNG Ý VÀ TIẾP TỤC
          <ArrowRight size={20} />
        </button>
      </div>
    </motion.div>
  );
};

export default Step1Consent;
