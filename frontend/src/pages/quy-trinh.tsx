import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, ChevronRight, Home, MapPin, 
  Calendar, CheckCircle2, QrCode, ClipboardList, 
  Stethoscope, Timer, MessageSquare, Flag
} from 'lucide-react';
import Link from 'next/link';

const STEPS = [
  {
    id: 1,
    title: "Đón tiếp & Check-in",
    desc: "Người dân đến theo lịch hẹn đã đăng ký. Vui lòng chuẩn bị sẵn mã QR (trên điện thoại hoặc bản in) và CCCD.",
    icon: <Calendar className="w-8 h-8" />,
    image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800",
    color: "bg-blue-500",
    hex: "#3b82f6"
  },
  {
    id: 2,
    title: "Gọi số thứ tự",
    desc: "Tại khu vực chờ, Ban tổ chức trang bị màn hình hiển thị số thứ tự. Khi đến số của mình, bạn sẽ di chuyển đến bàn tiếp nhận.",
    icon: <Timer className="w-8 h-8" />,
    image: "https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&q=80&w=800",
    color: "bg-indigo-500",
    hex: "#6366f1"
  },
  {
    id: 3,
    title: "Quét mã QR",
    desc: "Ban tổ chức quét mã QR để lấy thông tin cơ bản dựa trên CCCD. Đây là mã định danh xuyên suốt quá trình quản lý dữ liệu.",
    icon: <QrCode className="w-8 h-8" />,
    image: "https://images.unsplash.com/photo-1595079676339-1534801ad6cf?auto=format&fit=crop&q=80&w=800",
    color: "bg-purple-500",
    hex: "#a855f7"
  },
  {
    id: 4,
    title: "Khảo sát & Hồ sơ",
    desc: "Bắt đầu tiến hành điền Form khảo sát sức khỏe và hoàn thiện các thủ tục giấy tờ cần thiết trước khi khám.",
    icon: <ClipboardList className="w-8 h-8" />,
    image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=800",
    color: "bg-pink-500",
    hex: "#ec4899"
  },
  {
    id: 5,
    title: "Thực hiện Tầm soát",
    desc: "Tiến hành làm các xét nghiệm tầm soát chuyên sâu sau khi đã đảm bảo đầy đủ các thủ tục hồ sơ.",
    icon: <Stethoscope className="w-8 h-8" />,
    image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=800",
    color: "bg-red-500",
    hex: "#ef4444"
  },
  {
    id: 6,
    title: "Chờ kết quả",
    desc: "Bạn di chuyển vào khu vực chờ. Hệ thống sẽ tự động cập nhật trạng thái và thông báo khi có kết quả xét nghiệm.",
    icon: <Timer className="w-8 h-8" />,
    image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=800",
    color: "bg-orange-500",
    hex: "#f97316"
  },
  {
    id: 7,
    title: "Tư vấn chuyên sâu",
    desc: "Khi có kết quả, bạn sẽ được gọi đến bàn trả kết quả và gặp bác sĩ để nhận tư vấn chuyên sâu về tình trạng sức khỏe.",
    icon: <MessageSquare className="w-8 h-8" />,
    image: "https://images.unsplash.com/photo-1576091160550-2173dad99901?auto=format&fit=crop&q=80&w=800",
    color: "bg-green-500",
    hex: "#22c55e"
  },
  {
    id: 8,
    title: "Kết thúc quy trình",
    desc: "Hoàn tất chương trình tầm soát. Bạn nhận hồ sơ cá nhân và các hướng dẫn theo dõi sức khỏe định kỳ.",
    icon: <Flag className="w-8 h-8" />,
    image: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=800",
    color: "bg-teal-500",
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
      x: direction > 0 ? 50 : -50,
      opacity: 0,
      scale: 0.98,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 50 : -50,
      opacity: 0,
      scale: 0.98,
    })
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans selection:bg-blue-100 overflow-hidden">
      {/* Dynamic Background */}
      <motion.div 
        className="fixed top-0 left-0 w-full h-full pointer-events-none"
        animate={{
          background: `radial-gradient(circle at 50% 50%, ${STEPS[currentStep].hex}22 0%, transparent 100%)`,
        }}
        transition={{ duration: 0.8 }}
        style={{ opacity: 1 }}
      />
      
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none opacity-20">
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 5, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400 rounded-full blur-[120px]" 
        />
        <motion.div 
          animate={{ 
            scale: [1.1, 1, 1.1],
            rotate: [0, -5, 0],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-400 rounded-full blur-[120px]" 
        />
      </div>

      <header className="fixed top-0 w-full bg-white/70 backdrop-blur-xl z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-blue-600 font-bold hover:gap-3 transition-all group">
            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span>Quay lại trang chủ</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
              <ClipboardList className="text-white" size={20} />
            </div>
            <h1 className="text-lg font-black text-blue-900 hidden sm:block">QUY TRÌNH SÀNG LỌC</h1>
          </div>
        </div>
      </header>

      <main className="pt-32 pb-20 px-6 h-screen flex flex-col items-center justify-center max-w-7xl mx-auto relative">
        {/* Progress Bar */}
        <div className="w-full mb-12 hidden md:block">
          <div className="flex justify-between items-center relative max-w-4xl mx-auto">
            <div className="absolute left-0 right-0 h-1 bg-gray-200 top-1/2 -translate-y-1/2 z-0 rounded-full" />
            <motion.div 
              className="absolute left-0 h-1 bg-blue-600 top-1/2 -translate-y-1/2 z-0 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.4)]"
              initial={{ width: 0 }}
              animate={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
            />
            {STEPS.map((step, idx) => (
              <div 
                key={step.id} 
                onClick={() => {
                  setDirection(idx > currentStep ? 1 : -1);
                  setCurrentStep(idx);
                }}
                className="relative z-10"
              >
                <motion.div 
                  animate={{
                    scale: idx === currentStep ? 1.2 : 1,
                  }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-colors duration-300 ${
                    idx <= currentStep ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white text-gray-400 border-2 border-gray-100 hover:border-blue-200'
                  }`}
                >
                  <span className="text-sm font-black">{step.id}</span>
                </motion.div>
                {idx === currentStep && (
                  <motion.div 
                    layoutId="active-dot"
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full"
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 w-full flex flex-col md:flex-row gap-8 items-center justify-center relative overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div 
              key={currentStep}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.3 },
                scale: { duration: 0.4 }
              }}
              className="w-full grid md:grid-cols-2 gap-12 items-center"
            >
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="relative group"
              >
                <div className={`absolute inset-0 ${STEPS[currentStep].color} rounded-[40px] blur-3xl opacity-20 group-hover:opacity-30 transition-opacity duration-500`} />
                <div className="relative rounded-[40px] overflow-hidden shadow-2xl border-[6px] border-white aspect-[4/3] bg-white">
                  <motion.img 
                    key={STEPS[currentStep].image}
                    initial={{ scale: 1.1, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.6 }}
                    src={STEPS[currentStep].image} 
                    alt={STEPS[currentStep].title} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-8">
                    <p className="text-white font-medium text-sm italic">Hình ảnh minh họa khu vực thực tế tại bệnh viện</p>
                  </div>
                </div>
              </motion.div>

              <div className="space-y-8">
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center gap-6"
                >
                  <motion.div 
                    whileHover={{ rotate: 10, scale: 1.1 }}
                    className={`w-20 h-20 ${STEPS[currentStep].color} rounded-[30px] flex items-center justify-center text-white shadow-xl rotate-3`}
                  >
                    {STEPS[currentStep].icon}
                  </motion.div>
                  <div>
                    <p className="text-blue-500 font-black tracking-widest text-sm uppercase">Bước 0{STEPS[currentStep].id}</p>
                    <h2 className="text-4xl font-black text-blue-900 leading-tight tracking-tight">{STEPS[currentStep].title}</h2>
                  </div>
                </motion.div>
                
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-xl text-gray-500 leading-relaxed font-medium"
                >
                  {STEPS[currentStep].desc}
                </motion.p>

                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-center gap-4 pt-8"
                >
                  <button 
                    onClick={prev} 
                    disabled={currentStep === 0}
                    className={`p-4 px-6 rounded-2xl border-2 transition-all flex items-center gap-2 font-bold ${
                      currentStep === 0 ? 'border-gray-100 text-gray-300 opacity-50' : 'border-gray-200 text-gray-600 hover:bg-gray-50 active:scale-95 hover:border-blue-200 hover:text-blue-600'
                    }`}
                  >
                    <ChevronLeft size={20} />
                    Quay lại
                  </button>
                  <button 
                    onClick={next} 
                    disabled={currentStep === STEPS.length - 1}
                    className={`flex-1 p-4 rounded-2xl transition-all flex items-center justify-center gap-2 font-black shadow-lg ${
                      currentStep === STEPS.length - 1 ? 'bg-gray-100 text-gray-300' : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.98] shadow-blue-200 hover:shadow-blue-300'
                    }`}
                  >
                    {currentStep === STEPS.length - 1 ? "Hoàn tất tìm hiểu" : "Bước tiếp theo"}
                    <ChevronRight size={20} />
                  </button>
                </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <p className="text-center text-gray-400 font-medium text-sm mt-12">
          * Quy trình này được thiết kế để tối ưu hóa thời gian và đảm bảo độ chính xác cao nhất cho mỗi người dân.
        </p>
      </main>
    </div>
  );
}
