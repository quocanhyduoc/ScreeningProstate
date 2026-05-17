import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { toPng } from 'html-to-image';

// Step Components
import Step1PersonalInfo from '../components/RegistrationSteps/Step1PersonalInfo';
import Step2AppointmentTime from '../components/RegistrationSteps/Step2AppointmentTime';
import Step3MedicalHistory from '../components/RegistrationSteps/Step3MedicalHistory';
import Step4Confirmation from '../components/RegistrationSteps/Step4Confirmation';
import Step5SuccessBadge from '../components/RegistrationSteps/Step5SuccessBadge';
import Step6ClinicalSurvey from '../components/RegistrationSteps/Step6ClinicalSurvey';
import Step7ThankYou from '../components/RegistrationSteps/Step7ThankYou';

// Landing Components
import Header from '../components/Landing/Header';
import HeroBanner from '../components/Landing/HeroBanner';
import QuickHighlights from '../components/Landing/QuickHighlights';
import EventSidebar from '../components/Landing/EventSidebar';
import Footer from '../components/Landing/Footer';

const API_URL = 'https://sangloctuyentienliet.com/api';

const TIME_SLOTS = [
  { id: '1', date: 'Thứ 7, 30/05', label: '07:00 - 12:30', value: '2026-05-30 07:00-12:30', limit: 100 },
  { id: '2', date: 'Thứ 7, 30/05', label: '13:00 - 16:00', value: '2026-05-30 13:00-16:00', limit: 100 },
  { id: '3', date: 'Chủ nhật, 31/05', label: '07:00 - 12:30', value: '2026-05-31 07:00-12:30', limit: 100 },
  { id: '4', date: 'Chủ nhật, 31/05', label: '13:00 - 16:00', value: '2026-05-31 13:00-16:00', limit: 100 },
];

const STEPS = [
  { id: 1, title: 'Chọn thời gian', desc: 'Chọn khung giờ khám' },
  { id: 2, title: 'Thông tin cá nhân', desc: 'Họ tên, SĐT và Địa chỉ' },
  { id: 3, title: 'Tiền sử bệnh lý', desc: 'Thông tin sức khỏe' },
  { id: 4, title: 'Hoàn tất & Tải thẻ', desc: 'Xác nhận đăng ký' }
];

export default function AppointmentRegistrationPage() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [slotStats, setSlotStats] = useState<any>({});
  const [showExtraSlotConfirm, setShowExtraSlotConfirm] = useState(false);
  const [registrationResult, setRegistrationResult] = useState<any>(null);
  const [isReviewing, setIsReviewing] = useState(false);
  
  // Address states
  const [addressData, setAddressData] = useState<any>(null);
  const [selectedProvinceCode, setSelectedProvinceCode] = useState('20');
  const [selectedDistrictCode, setSelectedDistrictCode] = useState('41101');

  const badgeRef = useRef<HTMLDivElement>(null);
  const formSectionRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors }
  } = useForm({
    defaultValues: {
      full_name: '',
      dob: '',
      cccd: '',
      phone: '',
      email: '',
      province: 'Thành phố Huế',
      district: 'Quận Thuận Hóa',
      ward: '',
      address_detail: '',
      appointment_slot: '',
      history_father: false,
      history_brother: false,
      symptoms: '',
      consent: false,
      brca_mutation: false,
      father_age_diag: '',
      brother_age_diag: '',
      exclusion_sex_24h: false,
      exclusion_cystoscopy_48h: false,
      exclusion_dre_1w: false,
      biopsy_3y: false,
      prostatectomy: false,
      cancer_history: [] as string[],
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
      symptom_hematuria: false,
      symptom_bone_pain: false,
      truth_consent: false
    }
  });

  const formData = watch();

  useEffect(() => {
    fetch(`${API_URL}/slots/stats`)
      .then(res => res.json())
      .then(data => setSlotStats(data))
      .catch(err => console.error('Error fetching stats:', err));

    fetch('/data/vietnam_address_2025.json')
      .then(res => res.json())
      .then(data => setAddressData(data))
      .catch(err => console.error('Error loading address data:', err));
  }, []);

  const calculateAge = (dobString: string) => {
    if (!dobString) return 0;
    const today = new Date();
    const birthDate = new Date(dobString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const isEligible = () => {
    const age = calculateAge(formData.dob);
    if (age >= 50) return true;
    if (age >= 45 && (formData.history_father || formData.history_brother)) return true;
    return false;
  };

  const scrollToForm = () => {
    formSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleNext = async () => {
    setError('');
    
    if (step === 1) {
      // Step 1: Appointment Slot
      if (!formData.appointment_slot) {
        setError('Vui lòng chọn khung giờ khám.');
        return;
      }
      const selectedSlot = TIME_SLOTS.find(s => s.value === formData.appointment_slot);
      const currentCount = slotStats[formData.appointment_slot] || 0;
      if (selectedSlot && currentCount >= selectedSlot.limit) {
        setShowExtraSlotConfirm(true);
      } else {
        setStep(2);
      }
    } else if (step === 2) {
      // Step 2: Personal Info
      const fieldsToValidate = ['full_name', 'dob', 'cccd', 'phone', 'province', 'district', 'ward', 'address_detail'];
      const isValid = await trigger(fieldsToValidate as any);
      if (isValid) {
        if (!isEligible()) {
          setError('Bạn không thuộc đối tượng tầm soát của chương trình (Yêu cầu ≥ 45 tuổi).');
          return;
        }
        setStep(3);
      }
    } else if (step === 3) {
      // Step 3: Medical History
      if (!isEligible()) return;
      setStep(4);
    }
  };

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    setError('');
    try {
      const selectedSlot = TIME_SLOTS.find(s => s.value === data.appointment_slot);
      const currentCount = slotStats[data.appointment_slot] || 0;
      const isExtraSlot = selectedSlot ? currentCount >= selectedSlot.limit : false;

      const payload = {
        ...data,
        is_extra_slot: isExtraSlot,
        registration_date: new Date().toISOString().split('T')[0]
      };

      const response = await axios.post(`${API_URL}/registration`, payload);
      setRegistrationResult(response.data);
      setStep(5);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Có lỗi xảy ra khi gửi đăng ký.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onFinalSubmit = async (data: any) => {
    console.log("DEBUG: onFinalSubmit called with data:", data);
    setIsSubmitting(true);
    setError('');
    try {
      const sanitizedData = { ...data };
      if (sanitizedData.father_age_diag === '') sanitizedData.father_age_diag = null;
      if (sanitizedData.brother_age_diag === '') sanitizedData.brother_age_diag = null;

      const payload = {
        registration_id: registrationResult.id,
        ...sanitizedData
      };
      console.log("DEBUG: Sending clinical survey payload:", payload);
      const response = await axios.post(`${API_URL}/clinical/survey`, payload);
      console.log("DEBUG: Clinical survey response:", response.data);
      setStep(7);
    } catch (err: any) {
      console.error("DEBUG: Error submitting clinical survey:", err);
      setError(err.response?.data?.detail || 'Có lỗi xảy ra khi gửi khảo sát.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadBadge = async () => {
    if (badgeRef.current === null) return;
    try {
      // Tăng mật độ điểm ảnh (pixelRatio: 4) và đặt chất lượng nén tối đa (quality: 1.0) để ảnh thẻ sắc nét vượt trội
      const dataUrl = await toPng(badgeRef.current, { 
        cacheBust: true, 
        pixelRatio: 4, 
        quality: 1.0,
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left',
        }
      });
      const link = document.createElement('a');
      link.download = `Badge_Screening_${registrationResult?.cccd}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Download failed', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafcfe] text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-600">
      <Head>
        <title>Đăng ký Tầm soát Ung thư Tuyến tiền liệt 2026</title>
        <meta name="description" content="Chương trình tầm soát ung thư miễn phí tại Bệnh viện Trung ương Huế" />
      </Head>

      <Header scrollToForm={scrollToForm} />

      <main className="pt-20">
        <HeroBanner />
        <QuickHighlights />

        <div className="max-w-[1440px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-20">
           <EventSidebar step={step} STEPS={STEPS} />

           <div className="lg:col-span-8" ref={formSectionRef}>
              {/* Horizontal Steps Navigation */}
              {step <= 4 && (
                <div className="mb-6 md:mb-10 w-full px-2 sm:px-8">
                  <div className="flex justify-between items-start relative mx-auto max-w-2xl">
                    {/* Lines Container */}
                    <div className="absolute top-5 md:top-6 left-[12.5%] right-[12.5%] h-1 -z-10">
                      <div className="w-full h-full bg-slate-200 rounded-full" />
                      <motion.div 
                        className="absolute top-0 left-0 h-full bg-blue-600 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, Math.max(0, ((step - 1) / (STEPS.length - 1)) * 100))}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    
                    {STEPS.map((s) => (
                      <div key={s.id} className="flex flex-col items-center w-1/4 relative z-10">
                        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-black text-sm md:text-lg transition-all duration-300 ${
                          step === s.id ? 'bg-blue-600 text-white shadow-xl shadow-blue-200 ring-4 ring-white scale-110' : 
                          step > s.id ? 'bg-blue-600 text-white ring-4 ring-white' : 'bg-slate-100 text-slate-400 ring-4 ring-white'
                        }`}>
                          {step > s.id ? <CheckCircle size={20} /> : s.id}
                        </div>
                        <p className={`mt-3 text-[10px] sm:text-[11px] md:text-[13px] font-black uppercase tracking-tight text-center px-1 leading-tight ${
                          step === s.id ? 'text-blue-900' : 
                          step > s.id ? 'text-blue-900' : 'text-slate-400'
                        }`}>
                          {s.title}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-white rounded-xl shadow-2xl shadow-blue-100/50 border border-white overflow-hidden">
                <div className="p-4 sm:p-8 md:p-12 lg:p-16">
                  <AnimatePresence mode="wait">
                    {step === 1 && (
                      <Step2AppointmentTime
                        setValue={setValue}
                        watch={watch}
                        setStep={setStep}
                        TIME_SLOTS={TIME_SLOTS}
                        slotStats={slotStats}
                        error={error}
                        handleNext={handleNext}
                      />
                    )}

                    {step === 2 && (
                      <Step1PersonalInfo
                        register={register}
                        watch={watch}
                        setValue={setValue}
                        errors={errors}
                        addressData={addressData}
                        selectedProvinceCode={selectedProvinceCode}
                        setSelectedProvinceCode={setSelectedProvinceCode}
                        selectedDistrictCode={selectedDistrictCode}
                        setSelectedDistrictCode={setSelectedDistrictCode}
                        isEligible={isEligible}
                        handleNext={handleNext}
                        setStep={setStep}
                      />
                    )}

                    {step === 3 && (
                      <Step3MedicalHistory
                        register={register}
                        setStep={setStep}
                        isEligible={isEligible}
                        handleNext={handleNext}
                      />
                    )}

                    {step === 4 && (
                      <Step4Confirmation
                        register={register}
                        handleSubmit={handleSubmit}
                        onSubmit={onSubmit}
                        setStep={setStep}
                        watch={watch}
                        errors={errors}
                        isSubmitting={isSubmitting}
                        error={error}
                      />
                    )}

                    {step === 5 && (
                      <Step5SuccessBadge
                        registrationResult={registrationResult}
                        badgeRef={badgeRef}
                        handleDownloadBadge={handleDownloadBadge}
                        setStep={setStep}
                      />
                    )}

                    {step === 6 && (
                      <Step6ClinicalSurvey
                        register={register}
                        watch={watch}
                        setValue={setValue}
                        trigger={trigger}
                        handleSubmit={handleSubmit}
                        registrationResult={registrationResult}
                        isSubmitting={isSubmitting}
                        isReviewing={isReviewing}
                        setIsReviewing={setIsReviewing}
                        onFinalSubmit={onFinalSubmit}
                        error={error}
                      />
                    )}

                    {step === 7 && (
                      <Step7ThankYou
                        registrationResult={registrationResult}
                      />
                    )}
                  </AnimatePresence>
                </div>
              </div>

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
                      className="bg-white rounded-3xl p-10 max-w-xl w-full shadow-2xl border-[6px] border-blue-50"
                    >
                      <div className="w-20 h-20 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 mb-8 mx-auto">
                        <AlertCircle size={48} />
                      </div>
                      <h3 className="text-3xl font-black text-blue-900 mb-6 leading-tight text-center uppercase">XÁC NHẬN CHỌN KHUNG GIỜ NÀY?</h3>
                      <div className="space-y-6 text-slate-600 font-black text-lg leading-relaxed text-center mb-10">
                        <p>
                          Khung giờ Ông chọn hiện tại đã <span className="text-red-600 underline underline-offset-4 decoration-2">hết suất đăng ký chính thức</span>. 
                        </p>
                        <p>
                          Nếu tiếp tục, Ông sẽ được đưa vào danh sách <span className="text-orange-600">DỰ PHÒNG (ExtraSlot)</span>.
                        </p>
                        <p className="bg-slate-50 p-4 rounded-xl text-slate-500 text-[16px] italic font-bold">
                          BTC sẽ gọi điện xác nhận lại với Ông trước ngày tầm soát để sắp xếp. Ông có chắc chắn muốn chọn không?
                        </p>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-4">
                        <button
                          onClick={() => setShowExtraSlotConfirm(false)}
                          className="flex-1 py-5 bg-white border-2 border-gray-200 text-gray-500 rounded-2xl font-black text-xl hover:bg-gray-50 transition-all order-2 sm:order-1"
                        >
                          Chọn giờ khác
                        </button>
                        <button
                          onClick={() => {
                            setShowExtraSlotConfirm(false);
                            setStep(step + 1);
                          }}
                          className="flex-1 py-5 bg-blue-600 text-white rounded-2xl font-black text-xl shadow-2xl shadow-blue-200 hover:bg-blue-700 transition-all order-1 sm:order-2 active:scale-[0.98]"
                        >
                          TÔI ĐỒNG Ý
                        </button>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
           </div>
        </div>
      </main>

      <Footer />

      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-100/30 rounded-md blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-50/50 rounded-md blur-[120px]" />
      </div>
    </div>
  );
}
