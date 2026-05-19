import React from 'react';
import { motion } from 'framer-motion';
import { User, Calendar, Fingerprint, Phone, Mail, MapPin, ArrowRight, AlertCircle } from 'lucide-react';
import SearchableSelect from '../SearchableSelect';

interface Step1Props {
  register: any;
  watch: any;
  setValue: any;
  errors: any;
  addressData: any;
  selectedProvinceCode: string;
  setSelectedProvinceCode: (code: string) => void;
  selectedDistrictCode: string;
  setSelectedDistrictCode: (code: string) => void;
  isEligible: () => boolean;
  handleNext: () => void;
  setStep: (step: number) => void;
}

const Step1PersonalInfo: React.FC<Step1Props> = ({
  register,
  watch,
  setValue,
  errors,
  addressData,
  selectedProvinceCode,
  setSelectedProvinceCode,
  selectedDistrictCode,
  setSelectedDistrictCode,
  isEligible,
  handleNext,
  setStep
}) => {
  return (
    <motion.div
      key="s1"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-5 md:space-y-8"
    >
      <div>
        <h2 className="text-2xl md:text-3xl font-black text-blue-900 mb-2 md:mb-3 tracking-tight">Thông tin cá nhân</h2>
        <p className="text-[14px] md:text-base text-gray-400 font-medium italic">Vui lòng cung cấp thông tin chính xác để chúng tôi liên hệ.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4 md:gap-6">
        <div className="space-y-1.5 md:space-y-2.5">
          <label className="text-[13px] md:text-[15px] font-black text-blue-900 ml-1 uppercase tracking-tight flex items-center gap-2">
            <User size={16} className="text-blue-600" /> Họ và tên <span className="text-red-500">*</span>
          </label>
          <input
            {...register('full_name', { required: 'Không được để trống' })}
            className="w-full px-4 py-3 md:px-5 md:py-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-all font-black text-[16px] md:text-[18px] text-blue-900 shadow-sm"
            placeholder="NGUYỄN VĂN A"
          />
          {errors.full_name && <p className="text-red-500 text-sm font-black mt-1 ml-1">{errors.full_name.message}</p>}
        </div>
        <div className="space-y-1.5 md:space-y-2.5">
          <label className="text-[13px] md:text-[15px] font-black text-blue-900 ml-1 uppercase tracking-tight flex items-center gap-2">
            <Calendar size={16} className="text-blue-600" /> Ngày sinh <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            {...register('dob', { required: 'Không được để trống' })}
            className="w-full px-4 py-3 md:px-5 md:py-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-all font-black text-[16px] md:text-[18px] text-blue-900 shadow-sm"
          />
          {errors.dob && <p className="text-red-500 text-sm font-black mt-1 ml-1">{errors.dob.message}</p>}
        </div>
        <div className="space-y-1.5 md:space-y-2.5">
          <label className="text-[13px] md:text-[15px] font-black text-blue-900 ml-1 uppercase tracking-tight flex items-center gap-2">
            <Fingerprint size={16} className="text-blue-600" /> Số CCCD <span className="text-red-500">*</span>
          </label>
          <input
            {...register('cccd', { 
              required: 'Không được để trống',
              pattern: {
                value: /^[0-9]{12}$/,
                message: 'Số CCCD phải bao gồm đúng 12 chữ số'
              }
            })}
            className="w-full px-4 py-3 md:px-5 md:py-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-all font-black text-[16px] md:text-[18px] text-blue-900 shadow-sm"
            placeholder="012345678901"
          />
          {errors.cccd && <p className="text-red-500 text-sm font-black mt-1 ml-1">{errors.cccd.message}</p>}
        </div>
        <div className="space-y-1.5 md:space-y-2.5">
          <label className="text-[13px] md:text-[15px] font-black text-blue-900 ml-1 uppercase tracking-tight flex items-center gap-2">
            <Phone size={16} className="text-blue-600" /> Số điện thoại <span className="text-red-500">*</span>
          </label>
          <input
            {...register('phone', { required: 'Không được để trống' })}
            className="w-full px-4 py-3 md:px-5 md:py-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-all font-black text-[16px] md:text-[18px] text-blue-900 shadow-sm"
            placeholder="0905 123 456"
          />
          {errors.phone && <p className="text-red-500 text-sm font-black mt-1 ml-1">{errors.phone.message}</p>}
        </div>
        <div className="md:col-span-2 space-y-1.5 md:space-y-2.5">
          <label className="text-[13px] md:text-[15px] font-black text-blue-900 ml-1 uppercase tracking-tight flex items-center gap-2">
            <Mail size={16} className="text-blue-600" /> Email (Không bắt buộc)
          </label>
          <input
            {...register('email')}
            className="w-full px-4 py-3 md:px-5 md:py-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-all font-black text-[16px] md:text-[18px] text-blue-900 shadow-sm"
            placeholder="nguyenvana@gmail.com"
          />
        </div>
      </div>

      <div className="pt-6 md:pt-8 border-t-2 border-gray-100">
        <h3 className="text-[16px] md:text-[18px] font-black text-blue-900 mb-4 md:mb-6 flex items-center gap-2 md:gap-3">
          <MapPin size={20} className="text-blue-600" /> ĐỊA CHỈ LIÊN LẠC
        </h3>
        <div className="grid md:grid-cols-2 gap-4 md:gap-6">
          <SearchableSelect
            label="Tỉnh / Thành phố"
            placeholder="Chọn Tỉnh/TP"
            options={addressData?.provinces || []}
            value={watch('province')}
            onChange={(code, name) => {
              setSelectedProvinceCode(code);
              setValue('province', name, { shouldValidate: true });
              setValue('district', '', { shouldValidate: true });
              setValue('ward', '', { shouldValidate: true });
              setSelectedDistrictCode('');
            }}
            error={errors.province ? 'Yêu cầu' : ''}
          />

          <SearchableSelect
            label="Quận / Huyện"
            placeholder="Chọn Quận/Huyện"
            disabled={!watch('province')}
            options={selectedProvinceCode ? (addressData?.districts?.[selectedProvinceCode] || []) : []}
            value={watch('district')}
            onChange={(code, name) => {
              setSelectedDistrictCode(code);
              setValue('district', name, { shouldValidate: true });
              setValue('ward', '', { shouldValidate: true });
            }}
            error={errors.district ? 'Yêu cầu' : ''}
          />

          <SearchableSelect
            label="Phường / Xã"
            placeholder="Chọn Phường/Xã"
            disabled={!watch('district')}
            options={selectedDistrictCode ? (addressData?.wards?.[selectedDistrictCode] || []) : []}
            value={watch('ward')}
            onChange={(code, name) => {
              setValue('ward', name, { shouldValidate: true });
            }}
            error={errors.ward ? 'Yêu cầu' : ''}
          />

          <div className="space-y-1.5 md:space-y-2.5">
            <label className="text-[13px] md:text-[15px] font-black text-blue-900 ml-1 uppercase tracking-tight">Số nhà, tên đường <span className="text-red-500">*</span></label>
            <input
              {...register('address_detail', { required: 'Yêu cầu' })}
              className="w-full px-4 py-3 md:px-5 md:py-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-all font-black text-[16px] md:text-[18px] text-blue-900 shadow-sm"
              placeholder="VD: 01 Lê Lợi"
            />
            {errors.address_detail && <p className="text-red-500 text-sm font-black mt-1 ml-1">{errors.address_detail.message}</p>}
          </div>
        </div>
      </div>

      {!isEligible() && watch('dob') && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mt-4 md:mt-6 p-4 md:p-8 bg-red-50 rounded-2xl border-2 border-red-100 flex flex-col md:flex-row items-center gap-3 md:gap-6 shadow-lg shadow-red-50">
          <AlertCircle className="text-red-500 shrink-0" size={32} />
          <p className="text-red-900 font-black text-[14px] md:text-[16px] leading-tight text-center md:text-left">
            Ông không thuộc nhóm tầm soát ung thư tuyến tiền liệt của chương trình này (Yêu cầu ≥ 45 tuổi).
          </p>
        </motion.div>
      )}

      <div className="flex gap-2 md:gap-4 pt-2 md:pt-4">
        <button
          type="button"
          onClick={() => setStep(1)}
          className="px-4 py-3 md:px-10 md:py-5 bg-white border-2 border-gray-200 text-gray-500 rounded-xl font-black text-[15px] md:text-lg hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center whitespace-nowrap"
        >
          Quay lại
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="flex-1 py-3 md:py-5 bg-blue-600 text-white rounded-xl font-black text-[15px] md:text-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-blue-200 active:scale-[0.98]"
        >
          Tiếp tục <ArrowRight size={20} />
        </button>
      </div>
    </motion.div>
  );
};

export default Step1PersonalInfo;
