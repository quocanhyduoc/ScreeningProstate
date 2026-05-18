import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, ChevronRight, Home, MapPin, 
  CheckCircle2, QrCode, ClipboardList, 
  Stethoscope, MessageSquare, PhoneCall, Activity, ClipboardCheck
} from 'lucide-react';
import Link from 'next/link';
import Head from 'next/head';

const STEPS = [
  {
    id: 1,
    title: "Quét QR đăng ký thông tin & sàng lọc",
    desc: "Người dân quét mã QR trên các tài liệu truyền thông hoặc truy cập trực tiếp website để đăng ký thông tin hành chính (CCCD, Họ tên, Số điện thoại) và trả lời bảng câu hỏi sàng lọc ban đầu. Nếu chưa tiện, bạn hoàn toàn có thể hoàn thành phần khảo sát sức khỏe sau đó.",
    icon: <QrCode className="w-8 h-8 md:w-10 md:h-10" />,
    image: "https://images.unsplash.com/photo-1595079676339-1534801ad6cf?auto=format&fit=crop&q=80&w=800",
    color: "bg-blue-600 shadow-blue-200",
    hex: "#2563eb"
  },
  {
    id: 2,
    title: "Xác nhận & Nhắc lịch hẹn khám",
    desc: "Sau khi nhận được thông tin đăng ký, nhân viên y tế và bộ phận CSKH của Bệnh viện Trung ương Huế sẽ liên hệ trực tiếp qua điện thoại để xác nhận thông tin đăng ký thành công, sắp xếp lịch hẹn khám thuận tiện nhất cho bạn và nhắc nhở các lưu ý y tế trước khi đến khám.",
    icon: <PhoneCall className="w-8 h-8 md:w-10 md:h-10" />,
    image: "https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&q=80&w=800",
    color: "bg-indigo-500 shadow-indigo-200",
    hex: "#6366f1"
  },
  {
    id: 3,
    title: "Đến bàn tiếp nhận Check-in",
    desc: "Đến ngày hẹn, người dân di chuyển tới khu vực tiếp đón của chương trình tại Bệnh viện Trung ương Huế. Ban tổ chức sẽ thực hiện check-in nhanh chóng bằng cách quét mã QR trên điện thoại/bản in thẻ badge hoặc sử dụng thẻ Căn cước công dân (CCCD).",
    icon: <CheckCircle2 className="w-8 h-8 md:w-10 md:h-10" />,
    image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800",
    color: "bg-purple-500 shadow-purple-200",
    hex: "#a855f7"
  },
  {
    id: 4,
    title: "Xét nghiệm máu & Siêu âm",
    desc: "Người dân được thực hiện các chỉ định cận lâm sàng chuyên sâu hoàn toàn miễn phí: lấy mẫu máu xét nghiệm chỉ số PSA (kháng nguyên đặc hiệu tuyến tiền liệt) để phát hiện sớm các nguy cơ ung thư, đồng thời tiến hành siêu âm tổng quát vùng bụng và tuyến tiền liệt.",
    icon: <Activity className="w-8 h-8 md:w-10 md:h-10" />,
    image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=800",
    color: "bg-pink-500 shadow-pink-200",
    hex: "#ec4899"
  },
  {
    id: 5,
    title: "Trả kết quả & Bác sĩ tư vấn",
    desc: "Sau khi có kết quả xét nghiệm PSA và siêu âm, người dân được hướng dẫn đến bàn trả kết quả. Bác sĩ chuyên khoa tiết niệu sẽ trực tiếp đọc kết quả, giải thích chi tiết ý nghĩa các chỉ số và đưa ra tư vấn chăm sóc sức khỏe, phòng ngừa hoặc phác đồ theo dõi cụ thể.",
    icon: <MessageSquare className="w-8 h-8 md:w-10 md:h-10" />,
    image: "https://images.unsplash.com/photo-1576091160550-2173dad99901?auto=format&fit=crop&q=80&w=800",
    color: "bg-green-500 shadow-green-200",
    hex: "#22c55e"
  },
  {
    id: 6,
    title: "Kết thúc & Ký giấy đồng thuận",
    desc: "Người dân hoàn tất quy trình khám sàng lọc, nhận lại toàn bộ hồ sơ bệnh án cá nhân cùng các tài liệu hướng dẫn theo dõi sức khỏe tại nhà. Đồng thời, thực hiện ký giấy xác nhận đồng thuận tham gia chương trình để hỗ trợ công tác quản lý sức khỏe cộng đồng.",
    icon: <ClipboardCheck className="w-8 h-8 md:w-10 md:h-10" />,
    image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=800",
    color: "bg-teal-500 shadow-teal-200",
    hex: "#14b8a6"
  }
];

export default function QuyTrinhPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(0);

  const next = () => {
    if (currentStep < STEPS.length - 1) {
      setDirection(1);
      setCurrentStep(currentStep + 1);
    }
  };
  
  const prev = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep(currentStep - 1);
    }
  };

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStep]);

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
      scale: 0.95,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 100 : -100,
      opacity: 0,
      scale: 0.95,
    })
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans selection:bg-blue-100 overflow-x-hidden relative flex flex-col justify-between">
      <Head>
        <title>Quy Trình Tầm Soát Ung Thư Tuyến Tiền Liệt 2026</title>
        <meta name="description" content="Quy trình 6 bước rõ ràng, khép kín từ đăng ký trực tuyến đến khám lâm sàng miễn phí tại Bệnh viện Trung ương Huế" />
      </Head>

      {/* Dynamic Ambient Background Glow */}
      <motion.div 
        className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10"
        animate={{
          background: `radial-gradient(circle at 50% 40%, ${STEPS[currentStep].hex}15 0%, transparent 70%)`,
        }}
        transition={{ duration: 0.8 }}
      />
      
      {/* Background Soft Blobs */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-20 opacity-20">
        <motion.div 
          animate={{ 
            scale: [1, 1.08, 1],
            rotate: [0, 8, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-5%] left-[-5%] w-[45%] h-[45%] bg-blue-400 rounded-full blur-[130px]" 
        />
        <motion.div 
          animate={{ 
            scale: [1.08, 1, 1.08],
            rotate: [0, -8, 0],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-5%] right-[-5%] w-[45%] h-[45%] bg-teal-300 rounded-full blur-[130px]" 
        />
      </div>

      {/* Header */}
      <header className="sticky top-0 w-full bg-white/80 backdrop-blur-xl z-50 border-b border-slate-100 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-600 font-bold hover:text-blue-600 transition-colors group">
            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[13px] sm:text-sm">Trang chủ</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-100">
              <ClipboardList className="text-white" size={20} />
            </div>
            <h1 className="text-[14px] sm:text-lg font-black text-slate-800 tracking-tight uppercase">QUY TRÌNH SÀNG LỌC</h1>
          </div>
          <Link href="/#dang-ky" className="px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg text-xs sm:text-[13px] font-black transition-all">
            Đăng ký ngay
          </Link>
        </div>
      </header>

      {/* Main Flow Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col justify-center">
        
        {/* Modern Step Timeline Indicator */}
        <div className="w-full max-w-4xl mx-auto mb-10 sm:mb-16">
          <div className="flex justify-between items-center relative">
            {/* Background Line */}
            <div className="absolute left-[8%] right-[8%] h-1 bg-slate-200/70 top-1/2 -translate-y-1/2 z-0 rounded-full" />
            
            {/* Active Highlight Line */}
            <motion.div 
              className="absolute left-[8%] h-1 bg-blue-600 top-1/2 -translate-y-1/2 z-0 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.3)]"
              initial={{ width: 0 }}
              animate={{ width: `${(currentStep / (STEPS.length - 1)) * 84}%` }}
              transition={{ type: "spring", stiffness: 90, damping: 18 }}
            />

            {STEPS.map((step, idx) => (
              <div 
                key={step.id} 
                onClick={() => {
                  setDirection(idx > currentStep ? 1 : -1);
                  setCurrentStep(idx);
                }}
                className="relative z-10 flex flex-col items-center cursor-pointer group"
              >
                <motion.div 
                  animate={{
                    scale: idx === currentStep ? 1.15 : 1,
                  }}
                  className={`w-9 h-9 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                    idx === currentStep ? `${step.color} text-white shadow-lg` :
                    idx < currentStep ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-400 border-2 border-slate-100 hover:border-blue-100 hover:text-blue-500 shadow-sm'
                  }`}
                >
                  <span className="text-xs sm:text-[15px] font-black">{step.id}</span>
                </motion.div>
                
                {/* Micro step label under on tablets & desktop */}
                <span className={`absolute top-12 sm:top-14 text-[10px] sm:text-xs font-bold tracking-tight whitespace-nowrap hidden md:block transition-all duration-300 ${
                  idx === currentStep ? 'text-slate-800 scale-105 font-black' : 'text-slate-400 group-hover:text-slate-600'
                }`}>
                  Bước {step.id}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Content Box Grid */}
        <div className="w-full flex-1 flex items-center justify-center min-h-[400px] mt-6">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div 
              key={currentStep}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 260, damping: 26 },
                opacity: { duration: 0.25 },
                scale: { duration: 0.3 }
              }}
              className="w-full grid lg:grid-cols-12 gap-8 lg:gap-16 items-center"
            >
              {/* Image Column */}
              <div className="lg:col-span-6 relative group">
                <div className={`absolute inset-0 ${STEPS[currentStep].color} rounded-2xl blur-3xl opacity-15 group-hover:opacity-25 transition-opacity duration-700`} />
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border-[8px] border-white aspect-[4/3] bg-white transform hover:scale-[1.01] transition-transform duration-500">
                  <motion.img 
                    key={STEPS[currentStep].image}
                    initial={{ scale: 1.12, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.55 }}
                    src={STEPS[currentStep].image} 
                    alt={STEPS[currentStep].title} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-6 pt-16">
                    <p className="text-white/80 font-bold text-[11px] sm:text-xs tracking-wider uppercase">Chương trình Tầm soát 2026</p>
                    <p className="text-white text-xs sm:text-sm font-medium mt-1 italic">Hình ảnh mô phỏng quá trình thăm khám tại Bệnh viện Trung ương Huế</p>
                  </div>
                </div>
              </div>

              {/* Text / Action Column */}
              <div className="lg:col-span-6 space-y-6 md:space-y-8">
                <div className="flex items-start gap-5">
                  <motion.div 
                    whileHover={{ rotate: 5, scale: 1.05 }}
                    className={`w-14 h-14 sm:w-16 sm:h-16 ${STEPS[currentStep].color} rounded-2xl flex items-center justify-center text-white shadow-xl flex-shrink-0`}
                  >
                    {STEPS[currentStep].icon}
                  </motion.div>
                  <div className="space-y-1">
                    <p className="text-blue-600 font-extrabold tracking-widest text-[11px] sm:text-xs uppercase">BƯỚC 0{STEPS[currentStep].id} / 06</p>
                    <h2 className="text-xl sm:text-3xl font-black text-slate-800 leading-tight tracking-tight">{STEPS[currentStep].title}</h2>
                  </div>
                </div>
                
                <p className="text-sm sm:text-lg text-slate-500 leading-relaxed font-semibold">
                  {STEPS[currentStep].desc}
                </p>

                {/* Mobile indicators */}
                <div className="flex items-center gap-1.5 md:hidden">
                  {STEPS.map((_, i) => (
                    <div 
                      key={i} 
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        i === currentStep ? 'w-6 bg-blue-600' : 'w-1.5 bg-slate-200'
                      }`}
                    />
                  ))}
                </div>

                {/* Control buttons */}
                <div className="flex items-center gap-4 pt-4 sm:pt-6">
                  <button 
                    onClick={prev} 
                    disabled={currentStep === 0}
                    className={`p-3 px-5 sm:p-4 sm:px-6 rounded-xl border-2 transition-all flex items-center gap-2 text-xs sm:text-sm font-bold ${
                      currentStep === 0 ? 'border-slate-100 text-slate-300 opacity-50 cursor-not-allowed' : 'border-slate-200 text-slate-600 hover:bg-slate-50 active:scale-95 hover:border-blue-200 hover:text-blue-600'
                    }`}
                  >
                    <ChevronLeft size={18} />
                    Quay lại
                  </button>
                  <button 
                    onClick={next} 
                    disabled={currentStep === STEPS.length - 1}
                    className={`flex-grow p-3 sm:p-4 rounded-xl transition-all flex items-center justify-center gap-2 text-xs sm:text-[15px] font-black shadow-lg ${
                      currentStep === STEPS.length - 1 ? 'bg-slate-100 text-slate-300 cursor-not-allowed shadow-none' : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.98] shadow-blue-100 hover:shadow-blue-200'
                    }`}
                  >
                    {currentStep === STEPS.length - 1 ? "Hoàn tất tìm hiểu" : "Bước tiếp theo"}
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

      </main>

      {/* Footer Info */}
      <footer className="w-full border-t border-slate-100 py-6 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-2">
          <p className="text-slate-400 font-bold text-xs sm:text-sm">
            * Quy trình này được thiết kế để tối ưu hóa thời gian và đảm bảo độ chính xác cao nhất cho mỗi người dân.
          </p>
          <p className="text-slate-400 text-[10px] sm:text-xs">
            © 2026 Chương trình Tầm soát Ung thư Tuyến tiền liệt. Bệnh viện Trung ương Huế.
          </p>
        </div>
      </footer>
    </div>
  );
}
