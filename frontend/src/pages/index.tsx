import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import axios from "axios";
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { toJpeg } from 'html-to-image';
import { useRef } from 'react';
import {
  ChevronRight, Activity, CheckCircle,
  User, Calendar, Phone, Fingerprint,
  Shield, Zap, Heart, Info, ArrowDown, MapPin,
  Check, ArrowRight, Lock, Mail, Clock, AlertCircle,
  Smartphone, MessageSquare, ShieldCheck, Users, ClipboardList, Dna
} from 'lucide-react';

import SearchableSelect from '../components/SearchableSelect';
import Link from 'next/link';

const MedicalScene = dynamic(() => import('../components/MedicalScene'), { ssr: false });



const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const STEPS = [
  { id: 1, title: 'Thông tin cá nhân', desc: 'Họ tên, SĐT và Email' },
  { id: 2, title: 'Thời gian khám', desc: 'Chọn khung giờ đến khám' },
  { id: 3, title: 'Tiền sử bệnh', desc: 'Thông tin sức khỏe' },
  { id: 4, title: 'Xác nhận', desc: 'Kiểm tra & Gửi đăng ký' },
  { id: 5, title: 'Thẻ Digital Badge', desc: 'Lưu thông tin QR' },
  { id: 6, title: 'Khảo sát lâm sàng', desc: 'Điền thông tin sàng lọc' }
];

const TIME_SLOTS = [
  { id: 's1', label: '7:00 - 12:00', date: '30/05 (Thứ 7)', value: '7:00-11:30 ngày 30/5 (Thứ 7)', limit: 100 },
  { id: 's2', label: '13:30 - 16:00', date: '30/05 (Thứ 7)', value: '13:30-17:00 ngày 30/5 (Thứ 7)', limit: 50 },
  { id: 's3', label: '7:00 - 12:00', date: '31/05 (Chủ Nhật)', value: '7:00-11:30 ngày 31/5 (Chủ nhật)', limit: 100 },
  { id: 's4', label: '13:30 - 16:00', date: '31/05 (Chủ Nhật)', value: '13:30-17:00 ngày 31/5 (Chủ nhật)', limit: 50 },
];

export default function AppointmentRegistrationPage() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [addressData, setAddressData] = useState<any>(null);
  const [selectedProvinceCode, setSelectedProvinceCode] = useState('');
  const [selectedDistrictCode, setSelectedDistrictCode] = useState('');
  const [slotStats, setSlotStats] = useState<any>({});
  const [showExtraSlotConfirm, setShowExtraSlotConfirm] = useState(false);
  const [pendingSlotId, setPendingSlotId] = useState('');
  const [registrationResult, setRegistrationResult] = useState<any>(null);
  const [isReviewing, setIsReviewing] = useState(false);
  const [finalSuccess, setFinalSuccess] = useState(false);
  const badgeRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${API_URL}/slots/stats`);
        setSlotStats(res.data);
      } catch (e) {
        console.error("Failed to fetch slot stats", e);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    const fetchAddressData = async () => {
      try {
        const response = await axios.get('/data/vietnam_address_2025.json');
        setAddressData(response.data);

        // Find code for default province
        const defaultProvince = response.data.provinces.find((p: any) => p.name === 'Thành phố Huế');
        if (defaultProvince) {
          setSelectedProvinceCode(defaultProvince.code);
        }
      } catch (err) {
        console.error('Failed to load address data', err);
      }
    };
    fetchAddressData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

const { register, handleSubmit, watch, setValue, trigger, formState: { errors } } = useForm({
  defaultValues: {
    full_name: '',
    dob: '',
    cccd: '',
    phone: '',
    email: '',
    province: 'Thành phố Huế',
    district: '',
    ward: '',
    address_detail: '',
    appointment_slot: '',
    history_father: false,
    history_brother: false,
    family_history: false,
    symptoms: '',
    consent: false,
    // Screening Fields
    brca_mutation: false,
    father_age_diag: '',
    brother_age_diag: '',
    exclusion_sex_24h: false,
    exclusion_cystoscopy_48h: false,
    exclusion_dre_1w: false,
    biopsy_3y: false,
    prostatectomy: false,
    cancer_history: [],
    cancer_treatment: false,
    severe_organ_disease: false,
    alzheimer: false,
    other_studies: false,
    meds_5alpha_inhibitor: false,
    meds_estrogen: false,
    meds_progesterone: false,
    meds_androgen: false,
    meds_corticoids: false,
    meds_saw_palmetto: false,
    symptom_difficulty: false,
    symptom_frequency: false,
    symptom_urgency: false,
    symptom_incomplete: false,
    symptom_dribbling: false,
    symptom_bone_pain: false,
    symptom_hematuria: false,
    truth_consent: false
  }
});

useEffect(() => {
  register('province', { required: true });
  register('district', { required: true });
  register('ward', { required: true });
}, [register]);


const calculateAge = (dobString: string) => {
  if (!dobString) return 0;
  const birthDate = new Date(dobString);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

const isEligible = () => {
  const age = calculateAge(watch('dob'));
  const hasHistory = watch('history_father') || watch('history_brother');

  if (age === 0) return true; // Haven't entered DOB yet
  if (age < 45) return false;
  if (age >= 45 && age <= 50) return hasHistory;
  return age > 50;
};

const formData = watch();

const handleNext = async () => {
  let fieldsToValidate: any[] = [];
  if (step === 1) fieldsToValidate = ['full_name', 'dob', 'cccd', 'phone', 'email'];
  if (step === 2) {
    fieldsToValidate = ['appointment_slot'];
    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      const selectedSlotValue = formData.appointment_slot;
      const selectedSlot = TIME_SLOTS.find(s => s.value === selectedSlotValue);
      if (selectedSlot) {
        const taken = slotStats[selectedSlotValue] || 0;
        if (taken >= selectedSlot.limit) {
          setPendingSlotId(selectedSlot.id);
          setShowExtraSlotConfirm(true);
          return;
        }
      }
    }
  }
  if (step === 3) fieldsToValidate = ['symptoms'];

  const isValid = await trigger(fieldsToValidate);
  if (isValid) {
    if (step === 2 && !formData.appointment_slot) {
      setError('Vui lòng chọn một khung giờ khám.');
      return;
    }
    setError('');
    setStep(step + 1);
  }
};

const onSubmit = async (data: any) => {
  setIsSubmitting(true);
  setError('');
  try {
    const response = await axios.post(`${API_URL}/registration`, {
      ...data,
      is_extra_slot: showExtraSlotConfirm
    });
    setRegistrationResult(response.data);
    setSuccess(true);
    setStep(5);
    
    // Auto transition to screening after 10 seconds
    setTimeout(() => {
       if (step === 5) setStep(6);
    }, 10000);
    } catch (err: any) {
      console.error("Registration error:", err);
      const detail = err.response?.data?.detail;
      if (typeof detail === 'string') {
        setError(detail);
      } else if (Array.isArray(detail)) {
        // Handle Pydantic validation errors (422)
        const errorMsg = detail.map((e: any) => `${e.loc?.join('.') || 'Error'}: ${e.msg}`).join(', ');
        setError(errorMsg);
      } else {
        setError('Có lỗi xảy ra khi gửi đăng ký. Vui lòng thử lại sau.');
      }
    } finally {
      setIsSubmitting(false);
    }
};


const onFinalSubmit = async (data: any) => {
  setIsSubmitting(true);
  setError('');
  try {
    await axios.post(`${API_URL}/clinical/survey`, {
      registration_id: registrationResult.id,
      ...data,
      father_age_diag: data.father_age_diag ? parseInt(data.father_age_diag) : null,
      brother_age_diag: data.brother_age_diag ? parseInt(data.brother_age_diag) : null,
    });
    setFinalSuccess(true);
    setStep(7);
  } catch (err: any) {
    setError('Có lỗi xảy ra khi hoàn tất khảo sát.');
  } finally {
    setIsSubmitting(false);
  }
};

const handleDownloadBadge = async () => {
  if (badgeRef.current === null) return;
  try {
    const dataUrl = await toJpeg(badgeRef.current, { quality: 0.95 });
    const link = document.createElement('a');
    link.download = `QR_TamSoat_${registrationResult?.cccd || 'Patient'}.jpg`;
    link.href = dataUrl;
    link.click();
  } catch (err) {
    console.error('Download failed', err);
  }
};

  return (
    <div className="min-h-screen bg-[#f8faff] text-[#1a1f36] font-sans selection:bg-blue-100">

    {/* Header */}
    <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 flex items-center justify-center">
            <img src="/logo-benh-vien-trung-uong-hue-compressed.webp" alt="Logo BVTW Huế" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-blue-900">CHƯƠNG TRÌNH TẦM SOÁT UNG THƯ TUYẾN TIỀN LIỆT 2026</h1>
            <p className="text-[11px] font-bold text-blue-500 tracking-widest uppercase">Bệnh viện Trung ương Huế</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-6 text-[14px] font-medium">
          <button
            onClick={() => document.getElementById('registration-form')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-full font-bold text-[14px] hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center gap-2"
          >
            Đăng ký ngay <ArrowRight size={16} />
          </button>
          <Link href="/quy-trinh" className="flex items-center gap-2 text-gray-500 cursor-pointer hover:text-blue-600 transition-colors">
            <Zap size={16} className="text-yellow-500" /> Hướng dẫn quy trình sàng lọc
          </Link>
        </div>
      </div>
    </header>

    <main className="pt-28 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Banner Hospital */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 rounded-[15px] overflow-hidden shadow-2xl border-4 border-white"
        >
          <img src="/Banner-Hospital.png" alt="Hospital Banner" className="w-full h-auto object-cover" />
        </motion.div>

        {/* Quick Info Bar */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {[
            { icon: <ShieldCheck className="text-green-500" />, title: "Hoàn toàn miễn phí", desc: "Chương trình tài trợ 100%" },
            { icon: <Users className="text-blue-500" />, title: "Chuyên gia tư vấn", desc: "Đội ngũ bác sĩ đầu ngành" },
            { icon: <Lock className="text-purple-500" />, title: "Bảo mật tuyệt đối", desc: "Thông tin mã hóa an toàn" }
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white/60 backdrop-blur-md p-6 rounded-[30px] border border-white flex items-center gap-4 shadow-sm"
            >
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-inner">
                {item.icon}
              </div>
              <div>
                <h4 className="font-bold text-blue-900 text-sm">{item.title}</h4>
                <p className="text-[11px] text-gray-500 font-medium">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-12 gap-12 items-start">


          {/* Sidebar Progress */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold mb-8 flex items-center gap-2">
                <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
                Tiến trình đăng ký
              </h2>
              <div className="space-y-10 relative">
                <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-gray-100" />
                {STEPS.map((s, idx) => (
                  <div key={s.id} className="relative flex gap-6 group">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 transition-all duration-500 border-4 ${step > s.id ? 'bg-green-500 border-green-100' :
                      step === s.id ? 'bg-blue-600 border-blue-100 scale-110 shadow-lg shadow-blue-200' :
                        'bg-white border-gray-50 text-gray-400'
                      }`}>
                      {step > s.id ? <Check size={18} className="text-white" /> :
                        <span className={`text-[15px] font-bold ${step === s.id ? 'text-white' : 'text-gray-400'}`}>{s.id}</span>}
                    </div>
                    <div className="flex-1 pt-1">
                      <h3 className={`font-bold text-[15px] transition-colors ${step === s.id ? 'text-blue-600' : 'text-gray-400'}`}>{s.title}</h3>
                      <p className="text-[13px] text-gray-400 font-medium">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-blue-600 rounded-3xl p-8 text-white shadow-xl shadow-blue-200 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:scale-150 transition-transform duration-700" />
              <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Info size={20} /> Hỗ trợ y tế
              </h4>
              <p className="text-blue-100 text-[13.5px] text-justify leading-relaxed mb-6">
                Chúng tôi cam kết bảo mật tuyệt đối thông tin của bạn. Quy trình sàng lọc tuân thủ tiêu chuẩn quốc tế.
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                  <Smartphone size={20} />
                </div>
                <div>
                  <p className="text-[12px] text-blue-200 font-bold uppercase tracking-wider">Hotline 24/7</p>
                  <p className="text-lg font-bold">+84 234 3822 325</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Form Area */}
          <div className="lg:col-span-8" id="registration-form">
            <div className="bg-white/80 backdrop-blur-xl rounded-[20px] shadow-2xl shadow-blue-900/10 border border-white p-8 md:p-12">
              {/* Detailed Info Banner */}
              <div className="mb-7 space-y-6">
                <div className="p-8 bg-blue-600 rounded-[20px] text-white shadow-xl shadow-blue-200 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
                  <div className="relative z-10 grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <h3 className="text-xl font-black flex items-center gap-2">
                        <MapPin size={24} className="text-blue-200" /> Địa điểm tầm soát
                      </h3>
                      <div className="space-y-1">
                        <p className="font-bold text-lg leading-tight">Bệnh viện Quốc tế Trung ương Huế</p>
                        <p className="text-blue-100 text-sm">(Trung tâm Điều trị theo yêu cầu và Quốc tế)</p>
                        <p className="text-blue-200 text-[13px] mt-2">📍 03 Ngô Quyền, phường Thuận Hóa, TP. Huế</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-xl font-black flex items-center gap-2">
                        <Calendar size={24} className="text-blue-200" /> Thời gian thực hiện
                      </h3>
                      <div className="space-y-2">
                        <p className="font-bold text-lg italic underline decoration-blue-400">Ngày 30 - 31/05/2026</p>
                        <div className="grid grid-cols-2 gap-2 text-[13px]">
                          <div className="bg-white/20 p-2 rounded-xl text-center">
                            <p className="font-black text-white">SÁNG</p>
                            <p className="text-blue-100">7:00 - 12:00</p>
                          </div>
                          <div className="bg-white/20 p-2 rounded-xl text-center">
                            <p className="font-black text-white">CHIỀU</p>
                            <p className="text-blue-100">13:30 - 16:00</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-blue-50/50 rounded-[30px] border border-blue-100/50">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-200">
                      <Info size={20} />
                    </div>
                    <div>
                      <h3 className="text-[17px] font-black text-blue-900 mb-1">Đối tượng tham gia chương trình:</h3>
                      <ul className="text-[14px] text-blue-800 font-medium space-y-1 opacity-80">
                        <li>• Nam giới từ 50 tuổi trở lên.</li>
                        <li>• Nam giới từ 45-50 tuổi có tiền sử gia đình (Bố/Anh/Em trai) bị K TTL.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between mb-12 relative px-2">
                <AnimatePresence mode="wait">
                  {/* Step 1: Personal Info */}
                  {step === 1 && (
                    <motion.div key="s1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
                      <div>
                        <h2 className="text-3xl font-black text-blue-900 mb-3 tracking-tight">Thông tin cá nhân</h2>
                        <p className="text-gray-400 font-medium italic">Vui lòng cung cấp thông tin chính xác để chúng tôi liên hệ.</p>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[13px] font-bold text-gray-500 ml-1 uppercase tracking-wider flex items-center gap-2">
                            <User size={14} className="text-blue-500" /> Họ và tên <span className="text-red-400">*</span>
                          </label>
                          <input {...register('full_name', { required: 'Không được để trống' })} className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all font-medium text-[15px]" placeholder="Nguyễn Văn A" />
                          {errors.full_name && <p className="text-red-400 text-xs font-bold mt-1 ml-1">{errors.full_name.message}</p>}
                        </div>
                        <div className="space-y-2">
                          <label className="text-[13px] font-bold text-gray-500 ml-1 uppercase tracking-wider flex items-center gap-2">
                            <Calendar size={14} className="text-blue-500" /> Ngày sinh <span className="text-red-400">*</span>
                          </label>
                          <input type="date" {...register('dob', { required: 'Không được để trống' })} className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all font-medium text-[15px]" />
                          {errors.dob && <p className="text-red-400 text-xs font-bold mt-1 ml-1">{errors.dob.message}</p>}
                        </div>
                        <div className="space-y-2">
                          <label className="text-[13px] font-bold text-gray-500 ml-1 uppercase tracking-wider flex items-center gap-2">
                            <Fingerprint size={14} className="text-blue-500" /> Số CCCD <span className="text-red-400">*</span>
                          </label>
                          <input {...register('cccd', { required: 'Không được để trống' })} className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all font-medium text-[15px]" placeholder="012345678901" />
                          {errors.cccd && <p className="text-red-400 text-xs font-bold mt-1 ml-1">{errors.cccd.message}</p>}
                        </div>
                        <div className="space-y-2">
                          <label className="text-[13px] font-bold text-gray-500 ml-1 uppercase tracking-wider flex items-center gap-2">
                            <Phone size={14} className="text-blue-500" /> Số điện thoại <span className="text-red-400">*</span>
                          </label>
                          <input {...register('phone', { required: 'Không được để trống' })} className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all font-medium text-[15px]" placeholder="0905 123 456" />
                          {errors.phone && <p className="text-red-400 text-xs font-bold mt-1 ml-1">{errors.phone.message}</p>}
                        </div>
                        <div className="md:col-span-2 space-y-2">
                          <label className="text-[13px] font-bold text-gray-500 ml-1 uppercase tracking-wider flex items-center gap-2">
                            <Mail size={14} className="text-blue-500" /> Địa chỉ Email (Nếu có)
                          </label>
                          <input {...register('email')} className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all font-medium text-[15px]" placeholder="nguyenvana@gmail.com" />
                        </div>
                      </div>

                      <div className="pt-6 border-t border-gray-100">
                        <h3 className="text-[15px] font-black text-blue-900 mb-5 flex items-center gap-2">
                          <MapPin size={18} className="text-blue-500" /> Địa chỉ liên lạc
                        </h3>
                        <div className="grid md:grid-cols-2 gap-6">
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



                          <div className="space-y-2">
                            <label className="text-[11px] font-bold text-gray-400 ml-1 uppercase tracking-wider">Số nhà, tên đường <span className="text-red-400">*</span></label>
                            <input {...register('address_detail', { required: 'Yêu cầu' })} className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all font-bold" placeholder="VD: 01 Lê Lợi" />
                            {errors.address_detail && <p className="text-red-400 text-[10px] font-bold mt-1 ml-1">{errors.address_detail.message}</p>}
                          </div>
                        </div>
                      </div>


                      {!isEligible() && watch('dob') && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 p-6 bg-red-50 rounded-[30px] border border-red-100 flex items-center gap-4">
                          <AlertCircle className="text-red-500 shrink-0" size={24} />
                          <p className="text-red-800 font-bold text-[14px]">
                            Bạn không thuộc nhóm tầm soát ung thư tuyến tiền liệt của chương trình này (Yêu cầu ≥ 45 tuổi).
                          </p>
                        </motion.div>
                      )}

                      <button type="button" onClick={handleNext} className="w-full py-5 bg-blue-600 text-white rounded-[20px] font-black text-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-200">
                        Tiếp tục <ArrowRight size={20} />
                      </button>
                    </motion.div>
                  )}


                  {/* Step 2: Appointment Time */}
                  {step === 2 && (
                    <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                      <div>
                        <h2 className="text-3xl font-black text-blue-900 mb-3 tracking-tight">Khung giờ khám</h2>
                        <p className="text-gray-400 font-medium italic">Chọn thời gian thuận tiện nhất để chúng tôi chuẩn bị đón tiếp.</p>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        {TIME_SLOTS.map((slot) => (
                          <button
                            key={slot.id}
                            type="button"
                            onClick={() => setValue('appointment_slot', slot.value)}
                            className={`p-6 rounded-3xl border-2 text-left transition-all relative overflow-hidden group ${formData.appointment_slot === slot.value
                              ? 'border-blue-600 bg-blue-50 ring-4 ring-blue-50'
                              : 'border-gray-100 bg-white hover:border-blue-200 hover:bg-gray-50'
                              }`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${formData.appointment_slot === slot.value ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                                <Clock size={20} />
                              </div>
                              {formData.appointment_slot === slot.value && <CheckCircle className="text-blue-600" size={24} />}
                            </div>
                            <div className="flex justify-between items-end">
                              <div>
                                <p className="text-[13px] font-bold text-gray-400 uppercase tracking-wider mb-1">{slot.date}</p>
                                <p className={`text-xl font-black ${formData.appointment_slot === slot.value ? 'text-blue-900' : 'text-gray-700'}`}>{slot.label}</p>
                              </div>
                              <div className="text-right">
                                <p className={`text-[11px] font-black uppercase tracking-widest ${(slotStats[slot.value] || 0) >= slot.limit ? 'text-red-500' : 'text-green-500'}`}>
                                  Còn lại: {Math.max(0, slot.limit - (slotStats[slot.value] || 0))}/{slot.limit}
                                </p>
                              </div>
                            </div>
                            {(slotStats[slot.value] || 0) >= slot.limit && (
                              <div className="mt-3 flex items-center gap-2 text-[10px] font-bold text-red-400 uppercase tracking-tighter">
                                <AlertCircle size={12} /> Hết suất chính thức - ExtraSlot
                              </div>
                            )}
                          </button>
                        ))}
                      </div>

                      <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5 flex gap-4 items-start">
                        <div className="p-2 bg-yellow-100 rounded-lg text-yellow-700">
                          <AlertCircle size={20} />
                        </div>
                        <div>
                          <p className="text-yellow-800 font-bold text-[14px] mb-1">Lưu ý quan trọng</p>
                          <p className="text-yellow-700 text-[13px] leading-relaxed font-medium">
                            Vui lòng đến theo khung giờ đã hẹn để tránh tình trạng tắc nghẽn và đảm bảo chất lượng phục vụ tốt nhất.
                          </p>
                        </div>
                      </div>

                      {error && <p className="text-red-500 text-sm font-bold text-center italic">{error}</p>}

                      <div className="flex gap-4">
                        <button type="button" onClick={() => setStep(1)} className="px-8 py-5 bg-gray-50 text-gray-500 rounded-[20px] font-bold hover:bg-gray-100 transition-all">Quay lại</button>
                        <button type="button" onClick={handleNext} className="flex-1 py-5 bg-blue-600 text-white rounded-[20px] font-black text-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-200">
                          Tiếp tục <ArrowRight size={20} />
                        </button>
                      </div>


                    </motion.div>
                  )}

                  {/* Step 3: Medical History */}
                  {step === 3 && (
                    <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                      <div>
                        <h2 className="text-3xl font-black text-blue-900 mb-3 tracking-tight">Tiền sử & Triệu chứng</h2>
                        <p className="text-gray-400 font-medium italic">Những thông tin này giúp bác sĩ đánh giá nguy cơ chính xác hơn.</p>
                      </div>

                      <div className="space-y-4">
                        <div className="p-6 bg-gray-50 rounded-[30px] border border-gray-100">
                          <label className="flex items-center gap-4 cursor-pointer group">
                            <div className="relative w-12 h-6">
                              <input type="checkbox" {...register('history_father')} className="sr-only peer" />
                              <div className="w-full h-full bg-gray-300 rounded-full peer-checked:bg-blue-600 transition-colors" />
                              <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-6 shadow-sm" />
                            </div>
                            <div>
                              <p className="font-bold text-gray-800 text-[15px]">Bố bị Ung thư Tuyến tiền liệt?</p>
                              <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Tiền sử trực hệ (F1)</p>
                            </div>
                          </label>
                        </div>

                        <div className="p-6 bg-gray-50 rounded-[30px] border border-gray-100">
                          <label className="flex items-center gap-4 cursor-pointer group">
                            <div className="relative w-12 h-6">
                              <input type="checkbox" {...register('history_brother')} className="sr-only peer" />
                              <div className="w-full h-full bg-gray-300 rounded-full peer-checked:bg-blue-600 transition-colors" />
                              <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-6 shadow-sm" />
                            </div>
                            <div>
                              <p className="font-bold text-gray-800 text-[15px]">Anh/Em ruột bị Ung thư Tuyến tiền liệt?</p>
                              <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Tiền sử trực hệ (F1)</p>
                            </div>
                          </label>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="text-[13px] font-bold text-gray-500 ml-1 uppercase tracking-wider flex items-center gap-2">
                          <MessageSquare size={14} className="text-blue-500" /> Các triệu chứng gặp phải (Nếu có)
                        </label>
                        <textarea {...register('symptoms')} rows={4} className="w-full px-6 py-5 bg-gray-50 border-2 border-transparent rounded-[30px] focus:bg-white focus:border-blue-500 outline-none transition-all font-medium text-[15px]" placeholder="VD: Tiểu đêm, tiểu khó, đau tức vùng hạ vị..." />
                      </div>

                      <div className="flex gap-4">
                        <button type="button" onClick={() => setStep(2)} className="px-8 py-5 bg-gray-50 text-gray-500 rounded-[20px] font-bold hover:bg-gray-100 transition-all">Quay lại</button>
                        <button
                          type="button"
                          onClick={handleNext}
                          disabled={!isEligible()}
                          className={`flex-1 py-5 rounded-[20px] font-black text-lg transition-all flex items-center justify-center gap-3 shadow-xl ${isEligible() ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200' : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'}`}
                        >
                          Tiếp tục <ArrowRight size={20} />
                        </button>
                      </div>

                      {!isEligible() && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 p-6 bg-red-50 rounded-[30px] border border-red-100 flex items-center gap-4">
                          <AlertCircle className="text-red-500 shrink-0" size={24} />
                          <p className="text-red-800 font-bold text-[14px]">
                            Bạn không thuộc nhóm tầm soát ung thư tuyến tiền liệt. (Yêu cầu tiền sử gia đình cho độ tuổi 45-50).
                          </p>
                        </motion.div>
                      )}
                    </motion.div>
                  )}

                  {/* Step 4: Final Confirmation */}
                  {step === 4 && (
                    <motion.div key="s4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                      <div className="text-center">
                        <div className="inline-flex w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl items-center justify-center mb-6">
                          <CheckCircle size={32} />
                        </div>
                        <h2 className="text-3xl font-black text-blue-900 mb-2 tracking-tight">Xác nhận thông tin</h2>
                        <p className="text-gray-400 font-medium">Vui lòng kiểm tra kỹ lần cuối trước khi gửi.</p>
                      </div>

                      <div className="bg-gray-50 rounded-[40px] p-8 border border-gray-100 space-y-6">
                        <div className="grid grid-cols-2 gap-y-4 text-[14px]">
                          <div className="text-gray-400 font-bold uppercase tracking-wider text-[11px]">Họ và tên</div>
                          <div className="text-right font-bold text-blue-900">{formData.full_name}</div>
                          <div className="text-gray-400 font-bold uppercase tracking-wider text-[11px]">SĐT / Email</div>
                          <div className="text-right font-bold text-gray-700">{formData.phone} <br /> <span className="text-[12px] font-medium text-gray-400">{formData.email || 'N/A'}</span></div>
                          <div className="text-gray-400 font-bold uppercase tracking-wider text-[11px]">Địa chỉ</div>
                          <div className="text-right font-bold text-gray-600 text-[12px] leading-tight">
                            {formData.address_detail}, {formData.ward}, <br /> {formData.district}, {formData.province}
                          </div>
                          <div className="text-gray-400 font-bold uppercase tracking-wider text-[11px]">Ngày hẹn khám</div>
                          <div className="text-right font-bold text-blue-600 bg-blue-100 px-3 py-1 rounded-lg inline-block self-end">{formData.appointment_slot}</div>
                          <div className="text-gray-400 font-bold uppercase tracking-wider text-[11px]">Tiền sử gia đình</div>
                          <div className="text-right font-bold">
                            {formData.history_father && <span className="block text-red-500">Bố bị K TTL</span>}
                            {formData.history_brother && <span className="block text-red-500">Anh/Em bị K TTL</span>}
                            {!formData.history_father && !formData.history_brother && 'Không có'}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-4 p-5 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                        <div className="flex items-center h-6">
                          <input
                            id="consent"
                            type="checkbox"
                            {...register('consent', { required: true })}
                            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                          />
                        </div>
                        <label htmlFor="consent" className="text-[13px] text-blue-900 font-medium leading-relaxed cursor-pointer select-none">
                          Tôi đồng ý chia sẻ các thông tin cá nhân và tiền sử bệnh lý để phục vụ cho chương trình tầm soát ung thư tuyến tiền liệt tại Bệnh viện Trung ương Huế.
                        </label>
                      </div>

                      {errors.consent && <p className="text-red-500 text-[11px] font-bold text-center italic">Bạn cần đồng ý với điều khoản chia sẻ thông tin</p>}
                      {error && <p className="text-red-500 text-sm font-bold text-center italic">{error}</p>}

                      <div className="flex gap-4">
                        <button type="button" onClick={() => setStep(3)} className="px-8 py-5 bg-gray-50 text-gray-500 rounded-[20px] font-bold hover:bg-gray-100 transition-all">Quay lại</button>
                        <button
                          type="button"
                          onClick={handleSubmit(onSubmit)}
                          disabled={isSubmitting}
                          className="flex-1 py-5 bg-green-600 text-white rounded-[20px] font-black text-lg hover:bg-green-700 transition-all flex items-center justify-center gap-3 shadow-xl shadow-green-100 disabled:bg-gray-400"
                        >
                          {isSubmitting ? 'Đang gửi...' : 'Xác nhận & Gửi ngay'} <Check size={20} />
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 5: Success Screen */}
                  {step === 5 && (
                    <motion.div key="success" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-6 space-y-6">
                      <div className="relative inline-block">
                        <div className="w-20 h-20 bg-green-100 rounded-[30px] flex items-center justify-center text-green-600 mx-auto">
                          <CheckCircle size={40} strokeWidth={3} />
                        </div>
                      </div>

                      <div>
                        <h2 className="text-3xl font-black text-blue-900 mb-2 tracking-tight">Đăng ký thành công!</h2>
                        <p className="text-gray-400 font-medium text-sm">Vui lòng lưu lại mã QR bên dưới để làm thủ tục check-in.</p>
                      </div>

                      {/* Digital Badge for Download */}
                      <div className="relative group max-w-xs mx-auto">
                        <div ref={badgeRef} className="bg-white p-8 rounded-[40px] shadow-2xl border-4 border-blue-50 text-left overflow-hidden relative">
                          {/* Decor inside badge */}
                          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 opacity-50" />
                          <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-6">
                              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-100">
                                <Activity className="text-white" size={20} />
                              </div>
                              <div>
                                <p className="text-[10px] font-black text-blue-900 uppercase tracking-tighter leading-none">SCREENING 2026</p>
                                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">BVTW HUẾ</p>
                              </div>
                            </div>

                            <div className="space-y-4 mb-8">
                              <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Họ và tên</p>
                                <p className="text-lg font-black text-blue-900 leading-none">{registrationResult?.full_name}</p>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Số thứ tự</p>
                                  <p className="text-xl font-black text-blue-600 leading-none">#{String(registrationResult?.registration_number).padStart(3, '0')}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Loại</p>
                                  <p className={`text-[11px] font-black uppercase ${registrationResult?.is_extra_slot ? 'text-orange-500' : 'text-green-500'}`}>
                                    {registrationResult?.is_extra_slot ? 'ExtraSlot' : 'Chính thức'}
                                  </p>
                                </div>
                              </div>
                              <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Thời gian hẹn</p>
                                <p className="text-[13px] font-bold text-gray-700 leading-tight">{registrationResult?.appointment_slot}</p>
                              </div>
                            </div>

                            <div className="bg-blue-50 p-4 rounded-3xl flex items-center justify-center border border-blue-100">
                              <QRCodeSVG
                                value={JSON.stringify({
                                  cccd: registrationResult?.cccd,
                                  id: registrationResult?.registration_number,
                                  slot: registrationResult?.appointment_slot,
                                  name: registrationResult?.full_name
                                })}
                                size={140}
                                level="H"
                                includeMargin={false}
                              />
                            </div>
                            <p className="text-center text-[10px] font-bold text-blue-300 mt-4 uppercase tracking-[0.2em]">Scan for check-in</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 max-w-xs mx-auto pt-4">
                        <button onClick={handleDownloadBadge} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black flex items-center justify-center gap-2 shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95">
                          <ArrowDown size={18} /> Tải về QR + Thông tin
                        </button>
                        <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl">
                           <p className="text-[11px] font-bold text-orange-600 uppercase tracking-widest mb-1 animate-pulse">Lưu ý</p>
                           <p className="text-[12px] font-medium text-orange-700">Vui lòng nhấn tải thẻ Badge về máy. Hệ thống sẽ tự động chuyển sang phần Khảo sát sàng lọc sau vài giây.</p>
                        </div>
                        <button onClick={() => setStep(6)} className="w-full py-4 bg-white border-2 border-blue-600 text-blue-600 rounded-2xl font-black hover:bg-blue-50 transition-all">
                          Tiếp tục ngay <ChevronRight size={18} className="inline ml-1" />
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 6: Screening Questionnaire */}
                  {step === 6 && !isReviewing && (
                    <motion.div key="s6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
                       <div className="p-8 bg-blue-600 rounded-[30px] text-white shadow-xl shadow-blue-200">
                          <div className="flex items-center gap-4 mb-4">
                             <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                                <ClipboardList size={24} />
                             </div>
                             <div>
                                <h2 className="text-2xl font-black tracking-tight">KHẢO SÁT SÀNG LỌC</h2>
                                <p className="text-blue-100 text-[12px] font-medium">CCCD: {registrationResult?.cccd} | Họ tên: {registrationResult?.full_name}</p>
                             </div>
                          </div>
                          <p className="text-[13px] text-blue-50 leading-relaxed text-justify opacity-90">
                             Đây là bước quan trọng nhất để các bác sĩ đánh giá tình trạng lâm sàng của Ông. Vui lòng điền đầy đủ và trung thực để kết quả tầm soát đạt độ chính xác cao nhất.
                          </p>
                       </div>

                       <div className="space-y-10">
                          {/* Genetic Section */}
                          <section className="space-y-5">
                             <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600"><Dna size={18} /></div>
                                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">I. Di truyền & Tiền sử gia đình</h3>
                             </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <QuestionToggle label="Đột biến gen BRCA1/BRCA2" active={watch('brca_mutation')} onClick={() => setValue('brca_mutation', !watch('brca_mutation'))} />
                                <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 flex items-center gap-4">
                                   <div className="flex-1 space-y-1">
                                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cha chẩn đoán K lúc</label>
                                      <input type="number" {...register('father_age_diag')} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm font-bold" placeholder="Tuổi" />
                                   </div>
                                   <div className="flex-1 space-y-1">
                                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Anh/Em chẩn đoán K lúc</label>
                                      <input type="number" {...register('brother_age_diag')} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm font-bold" placeholder="Tuổi" />
                                   </div>
                                </div>
                             </div>
                          </section>

                           {/* II. Exclusions */}
                           <section className="space-y-5">
                              <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center text-red-600"><AlertCircle size={18} /></div>
                                 <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">II. Tiêu chuẩn loại trừ (Tạm thời)</h3>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                 <QuestionToggle label="Quan hệ tình dục / Xuất tinh (24h)" active={watch('exclusion_sex_24h')} onClick={() => setValue('exclusion_sex_24h', !watch('exclusion_sex_24h'))} warning />
                                 <QuestionToggle label="Nội soi bàng quang / Thông tiểu (48h)" active={watch('exclusion_cystoscopy_48h')} onClick={() => setValue('exclusion_cystoscopy_48h', !watch('exclusion_cystoscopy_48h'))} warning />
                                 <QuestionToggle label="Thăm trực tràng / Đạp xe (1 tuần)" active={watch('exclusion_dre_1w')} onClick={() => setValue('exclusion_dre_1w', !watch('exclusion_dre_1w'))} warning />
                              </div>
                           </section>

                           {/* III. Medical History & Medications */}
                           <section className="space-y-5">
                              <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600"><ShieldCheck size={18} /></div>
                                 <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">III. Tiền sử bệnh lý & Thuốc đang dùng</h3>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                 <QuestionToggle label="Sinh thiết TTL trong vòng 3 năm" active={watch('biopsy_3y')} onClick={() => setValue('biopsy_3y', !watch('biopsy_3y'))} />
                                 <QuestionToggle label="Đã cắt bỏ tuyến tiền liệt" active={watch('prostatectomy')} onClick={() => setValue('prostatectomy', !watch('prostatectomy'))} />
                                 <QuestionToggle label="Tiền sử K (TTL, Đại trực tràng, Phổi)" active={watch('cancer_history')?.length > 0} onClick={() => {
                                    const current = watch('cancer_history') || [];
                                    setValue('cancer_history', current.length > 0 ? [] : ['PROSTATE_COLON_LUNG']);
                                 }} />
                                 <QuestionToggle label="Đang điều trị ung thư" active={watch('cancer_treatment')} onClick={() => setValue('cancer_treatment', !watch('cancer_treatment'))} />
                                 <QuestionToggle label="Bệnh tim, não, phổi, gan, thận nặng" active={watch('severe_organ_disease')} onClick={() => setValue('severe_organ_disease', !watch('severe_organ_disease'))} />
                                 <QuestionToggle label="Mắc bệnh Alzheimer" active={watch('alzheimer')} onClick={() => setValue('alzheimer', !watch('alzheimer'))} />
                                 <QuestionToggle label="Tham gia nghiên cứu sàng lọc khác" active={watch('other_studies')} onClick={() => setValue('other_studies', !watch('other_studies'))} />
                                 
                                 <div className="md:col-span-2 p-6 bg-slate-50 rounded-[30px] border border-slate-100 space-y-4">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Đang sử dụng các loại thuốc sau:</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                          <section className="space-y-5">
                             <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600"><Activity size={18} /></div>
                                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">IV. Triệu chứng đường tiểu</h3>
                             </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <QuestionToggle label="Tiểu khó / Tia yếu" active={watch('symptom_difficulty')} onClick={() => setValue('symptom_difficulty', !watch('symptom_difficulty'))} />
                                <QuestionToggle label="Tiểu nhiều lần (Ngày/Đêm)" active={watch('symptom_frequency')} onClick={() => setValue('symptom_frequency', !watch('symptom_frequency'))} />
                                <QuestionToggle label="Tiểu gấp / Không nhịn được" active={watch('symptom_urgency')} onClick={() => setValue('symptom_urgency', !watch('symptom_urgency'))} />
                                <QuestionToggle label="Tiểu không hết / Nhỏ giọt" active={watch('symptom_incomplete')} onClick={() => setValue('symptom_incomplete', !watch('symptom_incomplete'))} />
                                <QuestionToggle label="Tiểu máu" active={watch('symptom_hematuria')} onClick={() => setValue('symptom_hematuria', !watch('symptom_hematuria'))} />
                                <QuestionToggle label="Đau xương" active={watch('symptom_bone_pain')} onClick={() => setValue('symptom_bone_pain', !watch('symptom_bone_pain'))} />
                             </div>
                          </section>

                          <div className="pt-10 flex flex-col gap-4">
                             <div className="flex items-start gap-4 p-5 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                               <input type="checkbox" id="truth_consent" {...register('truth_consent', { required: true })} className="w-5 h-5 mt-1" />
                               <label htmlFor="truth_consent" className="text-[13px] font-medium text-blue-900 leading-relaxed">
                                  Tôi cam đoan những thông tin cung cấp trên là hoàn toàn sự thật. Tôi hiểu rằng việc cung cấp sai thông tin có thể ảnh hưởng đến kết quả xét nghiệm PSA.
                               </label>
                             </div>
                             <button 
                                onClick={async () => {
                                   const isValid = await trigger('truth_consent');
                                   if (isValid) setIsReviewing(true);
                                }}
                                className="w-full py-5 bg-blue-600 text-white rounded-[20px] font-black text-lg shadow-xl shadow-blue-200 flex items-center justify-center gap-3"
                             >
                                XEM LẠI & HOÀN TẤT <ChevronRight size={20} />
                             </button>
                          </div>
                       </div>
                    </motion.div>
                  )}

                  {/* Step 6 (Review Mode): Review Screening Data */}
                  {step === 6 && isReviewing && (
                    <motion.div key="review" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
                       <div className="text-center space-y-2">
                          <h2 className="text-2xl font-black text-blue-900 tracking-tight">XÁC NHẬN BẢNG KHẢO SÁT</h2>
                          <p className="text-gray-400 font-medium">Vui lòng kiểm tra lại lần cuối trước khi nộp hồ sơ lâm sàng.</p>
                       </div>

                       <div className="bg-white border border-gray-100 rounded-[30px] p-8 space-y-6 shadow-sm">
                          <ReviewItem label="Đột biến gen BRCA" value={watch('brca_mutation') ? 'Có' : 'Không'} />
                          <ReviewItem label="Tuổi cha chẩn đoán K" value={watch('father_age_diag') || 'N/A'} />
                          <ReviewItem label="Tuổi anh/em chẩn đoán K" value={watch('brother_age_diag') || 'N/A'} />
                          <div className="h-px bg-gray-50" />
                          <ReviewItem label="Tiêu chuẩn loại trừ" value={
                              [
                                 watch('exclusion_sex_24h') && "Xuất tinh (24h)",
                                 watch('exclusion_cystoscopy_48h') && "Nội soi (48h)",
                                 watch('exclusion_dre_1w') && "Thăm trực tràng (1 tuần)"
                              ].filter(Boolean).join(', ') || 'Không có'
                           } warning={watch('exclusion_sex_24h') || watch('exclusion_cystoscopy_48h') || watch('exclusion_dre_1w')} />
                           <div className="h-px bg-gray-50" />
                           
                           <ReviewItem label="Tiền sử bệnh lý" value={
                              [
                                 watch('biopsy_3y') && "Sinh thiết (3 năm)",
                                 watch('prostatectomy') && "Đã cắt TTL",
                                 (watch('cancer_history')?.length > 0) && "Tiền sử K",
                                 watch('cancer_treatment') && "Đang điều trị K",
                                 watch('severe_organ_disease') && "Bệnh nội tạng nặng",
                                 watch('alzheimer') && "Alzheimer",
                                 watch('other_studies') && "Nghiên cứu khác"
                              ].filter(Boolean).join(', ') || 'Không có'
                           } />
                           <ReviewItem label="Thuốc đang dùng" value={
                              [
                                 watch('meds_5alpha_inhibitor') && "5α-reductase",
                                 watch('meds_estrogen') && "Estrogen",
                                 watch('meds_progesterone') && "Progesterone",
                                 watch('meds_androgen') && "Androgen",
                                 watch('meds_corticoids') && "Corticoids",
                                 watch('meds_saw_palmetto') && "Dược liệu PSA"
                              ].filter(Boolean).join(', ') || 'Không có'
                           } />
                          <div className="h-px bg-gray-50" />
                          <ReviewItem label="Triệu chứng đường tiểu" value={
                             [
                                watch('symptom_difficulty') && "Tiểu khó",
                                watch('symptom_frequency') && "Tiểu nhiều",
                                watch('symptom_urgency') && "Tiểu gấp",
                                watch('symptom_incomplete') && "Tiểu không hết",
                                watch('symptom_hematuria') && "Tiểu máu",
                                watch('symptom_bone_pain') && "Đau xương"
                             ].filter(Boolean).join(', ') || 'Không có'
                          } />
                       </div>

                       <div className="flex gap-4">
                          <button onClick={() => setIsReviewing(false)} className="px-8 py-5 bg-gray-50 text-gray-500 rounded-[20px] font-bold">Chỉnh sửa</button>
                          <button 
                             onClick={handleSubmit(onFinalSubmit)}
                             disabled={isSubmitting}
                             className="flex-1 py-5 bg-green-600 text-white rounded-[20px] font-black text-lg shadow-xl shadow-green-100"
                          >
                             {isSubmitting ? 'Đang xử lý...' : 'GỬI HỒ SƠ LÂM SÀNG'}
                          </button>
                       </div>
                    </motion.div>
                  )}

                  {/* Step 7: Final Thank You */}
                  {step === 7 && (
                    <motion.div key="final" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-12 space-y-8">
                       <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-green-600 mx-auto shadow-inner">
                          <CheckCircle size={48} strokeWidth={3} />
                       </div>
                       
                       <div className="space-y-4">
                          <h2 className="text-3xl font-black text-blue-900 leading-tight">
                             Cám ơn Ông đã hoàn thành <br/> đăng ký thông tin và sàng lọc.
                          </h2>
                          <div className="p-6 bg-blue-50 rounded-[30px] inline-block border border-blue-100">
                             <p className="text-[13px] font-bold text-blue-900 uppercase tracking-widest mb-2">Xin nhắc lại về lịch hẹn của Ông:</p>
                             <div className="flex items-center justify-center gap-3 text-2xl font-black text-blue-600">
                                <Clock size={28} /> {registrationResult?.appointment_slot}
                             </div>
                             <p className="text-[11px] text-blue-400 font-bold mt-2 uppercase tracking-tight">Tại: Bệnh viện Quốc tế Trung ương Huế</p>
                          </div>
                       </div>

                       <div className="max-w-md mx-auto space-y-4">
                          <p className="text-gray-500 text-sm leading-relaxed">
                             Hệ thống đã gửi một email xác nhận đến địa chỉ <b>{registrationResult?.email || 'email của Ông'}</b>. 
                             Vui lòng kiểm tra lại thông tin và đến đúng giờ hẹn.
                          </p>
                          <button onClick={() => window.location.reload()} className="w-full py-5 bg-[#0067b8] text-white rounded-[20px] font-black text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-100">
                             QUAY LẠI TRANG CHỦ
                          </button>
                       </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>


    {/* Extra Slot Confirmation Modal */}
    <AnimatePresence>
      {showExtraSlotConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-blue-900/40 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-white rounded-[40px] p-8 max-w-md w-full shadow-2xl border-4 border-blue-100/50"
          >
            <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 mb-6">
              <AlertCircle size={32} />
            </div>
            <h3 className="text-2xl font-black text-blue-900 mb-4 leading-tight">Xác nhận chọn khung giờ này?</h3>
            <p className="text-gray-500 font-medium mb-6 leading-relaxed">
              Khung giờ Ông chọn đã hết suất đăng ký chính thức. Nếu tiếp tục, bạn sẽ được đánh dấu là <span className="text-orange-500 font-bold">ExtraSlot</span>.
              <br /><br />
              Clinical sẽ gọi điện xác nhận lại với Ông trước ngày tầm soát. Ông có chắc chắn muốn chọn khung giờ này không?
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowExtraSlotConfirm(false)}
                className="flex-1 py-4 bg-gray-50 text-gray-500 rounded-2xl font-bold hover:bg-gray-100 transition-all"
              >
                Chọn giờ khác
              </button>
              <button
                onClick={() => {
                  setShowExtraSlotConfirm(false);
                  setStep(step + 1);
                }}
                className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all"
              >
                Tôi đồng ý
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* Background Decor */}
    <div className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-100/30 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-50/50 rounded-full blur-[120px]" />
    </div>
  </div>
);
}

function QuestionToggle({ label, active, onClick, warning }: any) {
  return (
    <div 
      onClick={onClick}
      className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between gap-4 ${
        active 
          ? (warning ? 'bg-red-50 border-red-500 text-red-700 shadow-md' : 'bg-blue-50 border-blue-500 text-blue-700 shadow-md') 
          : 'bg-white border-gray-100 hover:border-gray-200'
      }`}
    >
       <span className="text-[13px] font-bold leading-tight uppercase tracking-tight">{label}</span>
       <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
         active 
           ? (warning ? 'bg-red-500 border-red-500' : 'bg-blue-500 border-blue-500') 
           : 'border-gray-100 bg-gray-50'
       }`}>
          {active && <Check size={14} className="text-white" />}
       </div>
    </div>
  );
}

function ReviewItem({ label, value, warning }: any) {
  return (
    <div className="flex justify-between gap-4 text-[14px]">
       <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px] pt-1">{label}</span>
       <span className={`text-right font-bold ${warning ? 'text-red-500' : 'text-slate-700'}`}>{value}</span>
    </div>
  );
}

function StatCard({ label, value, color }: any) {
  return (
    <div className={`p-6 bg-white rounded-3xl border shadow-sm ${color}`}>
       <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">{label}</p>
       <p className="text-3xl font-black tracking-tight tabular-nums">{value || 0}</p>
    </div>
  );
}
