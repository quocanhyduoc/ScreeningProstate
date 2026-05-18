import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, Search, HelpCircle, AlertCircle, 
  Activity, BookOpen, ShieldAlert, Heart, ArrowRight,
  Sparkles, ShieldCheck, HelpCircle as HelpIcon
} from 'lucide-react';
import Link from 'next/link';
import Head from 'next/head';

const CATEGORIES = [
  { id: 'tat-ca', label: 'Tất cả câu hỏi' },
  { id: 'tam-quan-trong', label: 'Tầm quan trọng' },
  { id: 'xet-nghiem', label: 'Ý nghĩa xét nghiệm' },
  { id: 'theo-doi', label: 'Theo dõi & Phòng ngừa' }
];

const FAQS = [
  {
    id: 1,
    category: 'tam-quan-trong',
    question: "Tại sao nam giới cần tầm soát ung thư tuyến tiền liệt từ sớm?",
    answer: "Ung thư tuyến tiền liệt thường phát triển rất âm thầm và hầu như không có triệu chứng rõ ràng ở giai đoạn khởi phát. Khi xuất hiện các triệu chứng như tiểu khó, tiểu ra máu hay đau xương thì bệnh thường đã tiến triển sang giai đoạn muộn. Tầm soát định kỳ giúp phát hiện bệnh từ rất sớm, khi khối u còn khu trú, giúp cơ hội điều trị khỏi hoàn toàn đạt trên 90% và bảo tồn tối đa chất lượng cuộc sống."
  },
  {
    id: 2,
    category: 'tam-quan-trong',
    question: "Ai là đối tượng khuyến cáo cần tham gia chương trình tầm soát này?",
    answer: "Chương trình khuyến cáo đặc biệt dành cho nam giới từ 50 tuổi trở lên - nhóm tuổi có nguy cơ mắc bệnh tăng cao. Đối với nam giới có tiền sử gia đình trực hệ (cha, anh trai hoặc em trai ruột) từng mắc ung thư tuyến tiền liệt, độ tuổi khuyến cáo bắt đầu tầm soát sớm hơn, từ khoảng 40-45 tuổi."
  },
  {
    id: 3,
    category: 'tam-quan-trong',
    question: "Chương trình tầm soát này có gây đau hay nguy hiểm gì không?",
    answer: "Quy trình tầm soát của chương trình hoàn toàn không xâm lấn sâu, cực kỳ an toàn và không gây đau đớn. Người dân chỉ thực hiện lấy một lượng máu tĩnh mạch nhỏ (tương tự xét nghiệm máu thông thường) và thực hiện siêu âm vùng bụng ngoài da. Toàn bộ quy trình diễn ra nhanh chóng dưới sự thực hiện của đội ngũ bác sĩ chuyên khoa giàu kinh nghiệm."
  },
  {
    id: 4,
    category: 'xet-nghiem',
    question: "Xét nghiệm chỉ số PSA trong máu là gì?",
    answer: "PSA (Prostate-Specific Antigen - Kháng nguyên đặc hiệu tuyến tiền liệt) là một loại protein do các tế bào của tuyến tiền liệt sản xuất ra. Một lượng nhỏ PSA bình thường vẫn lưu thông trong máu. Khi tuyến tiền liệt bị tổn thương do ung thư, phì đại (u xơ) lành tính hoặc viêm nhiễm, lượng PSA giải phóng vào máu sẽ tăng cao vượt mức bình thường. Do đó, xét nghiệm PSA là 'tiêu chuẩn vàng' để định hướng sàng lọc sớm bệnh lý này."
  },
  {
    id: 5,
    category: 'xet-nghiem',
    question: "Chỉ số PSA bao nhiêu là bình thường và khi nào cần lo ngại?",
    answer: "Thông thường, nồng độ PSA trong máu được đánh giá như sau:\n• Dưới 4.0 ng/ml: Mức bình thường (nguy cơ thấp).\n• Từ 4.0 đến 10.0 ng/ml: Vùng nghi ngờ (nguy cơ ung thư khoảng 25%). Bác sĩ có thể chỉ định làm thêm PSA tự do (Free PSA) để đánh giá thêm.\n• Trên 10.0 ng/ml: Nguy cơ cao (nguy cơ ung thư trên 50%), cần tư vấn bác sĩ chuyên khoa sâu để cân nhắc chỉ định chụp cộng hưởng từ (MRI) hoặc sinh thiết tuyến tiền liệt."
  },
  {
    id: 6,
    category: 'xet-nghiem',
    question: "Siêu âm tổng quát hệ tiết niệu có vai trò gì trong tầm soát?",
    answer: "Siêu âm giúp bác sĩ quan sát trực quan hình ảnh cấu trúc tuyến tiền liệt để xác định thể tích (đánh giá mức độ u xơ/phì đại), phát hiện các nhân xơ bất thường, các vùng vôi hóa hoặc biến đổi nhu mô. Ngoài ra, siêu âm còn giúp kiểm tra gián tiếp chức năng bàng quang, thận xem có bị ảnh hưởng bởi sự chèn ép của tuyến tiền liệt hay không."
  },
  {
    id: 7,
    category: 'theo-doi',
    question: "Nếu kết quả tầm soát lần này bình thường, bao lâu tôi cần làm lại?",
    answer: "Nếu chỉ số PSA dưới 4.0 ng/ml và kết quả siêu âm không phát hiện bất thường, bạn có thể hoàn toàn yên tâm. Tuy nhiên, do bệnh có thể phát triển theo thời gian, bạn nên duy trì lịch trình tầm soát lặp lại định kỳ từ 1 đến 2 năm một lần để luôn chủ động bảo vệ sức khỏe."
  },
  {
    id: 8,
    category: 'theo-doi',
    question: "Lối sống và dinh dưỡng lành mạnh giúp phòng ngừa bệnh như thế nào?",
    answer: "Bạn nên bổ sung nhiều thực phẩm giàu Lycopene (như cà chua chín, dưa hấu, bưởi hồng) và các loại rau họ cải (súp lơ xanh, bắp cải). Hạn chế ăn quá nhiều mỡ động vật, thịt đỏ và giảm tối đa rượu bia, thuốc lá. Duy trì tập thể dục thể thao đều đặn 30 phút mỗi ngày giúp kiểm soát cân nặng và cải thiện đáng kể sức khỏe hệ nội tiết."
  },
  {
    id: 9,
    category: 'theo-doi',
    question: "Tôi nên làm gì nếu nhận được kết quả chỉ số PSA tăng cao?",
    answer: "Hãy thật bình tĩnh. Chỉ số PSA tăng cao có thể do nhiều nguyên nhân lành tính khác như viêm tuyến tiền liệt, phì đại tuyến tiền liệt, hoặc thậm chí là sau khi đi xe đạp chặng dài, sau quan hệ tình dục. Bạn nên mang kết quả đến gặp bác sĩ chuyên khoa Nam học - Tiết niệu tại Bệnh viện Trung ương Huế để được thăm khám lâm sàng, làm lại xét nghiệm sau vài tuần hoặc thực hiện thêm các bước chẩn đoán chuyên sâu phù hợp."
  }
];

export default function TruyenThongPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('tat-ca');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // Filter FAQs based on search and category
  const filteredFaqs = FAQS.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'tat-ca' || faq.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleFaq = (id: number) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  const handlePanelScroll = (categoryId: string) => {
    setActiveCategory(categoryId);
    const element = document.getElementById('faq-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#fafcfe] font-sans selection:bg-blue-100 selection:text-blue-600 overflow-x-hidden">
      <Head>
        <title>Thông Tin Truyền Thông & Giáo Dục Sức Khỏe - Tuyến Tiền Liệt 2026</title>
        <meta name="description" content="Kiến thức y khoa chuẩn xác về tầm soát ung thư tuyến tiền liệt, giải thích xét nghiệm PSA và cẩm nang theo dõi sức khỏe cộng đồng." />
      </Head>

      {/* Decorative Ambient Background */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 opacity-30">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#bae6fd] rounded-full blur-[140px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#a7f3d0] rounded-full blur-[140px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 w-full bg-white/80 backdrop-blur-xl z-50 border-b border-slate-100 shadow-sm">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-600 font-bold hover:text-blue-600 transition-colors group">
            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[13px] sm:text-sm">Trang chủ</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-100">
              <BookOpen className="text-white" size={20} />
            </div>
            <h1 className="text-[14px] sm:text-lg font-black text-slate-800 tracking-tight uppercase">THÔNG TIN TRUYỀN THÔNG</h1>
          </div>
          <Link href="/quy-trinh" className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg text-xs sm:text-[13px] font-black transition-all">
            Xem quy trình khám
          </Link>
        </div>
      </header>

      {/* Hero Banner Section */}
      <section className="bg-gradient-to-b from-white to-[#f0f9ff]/40 pt-12 pb-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto text-center space-y-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold"
          >
            <Sparkles size={14} />
            <span>Cẩm nang kiến thức y học cộng đồng</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl font-black text-slate-850 tracking-tight max-w-3xl mx-auto leading-tight"
          >
            Hiểu đúng về tầm soát <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">Ung thư Tuyến tiền liệt</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-sm sm:text-lg text-slate-500 max-w-2xl mx-auto font-medium"
          >
            Chủ động cập nhật kiến thức khoa học chuẩn xác để bảo vệ bản thân và những người thân yêu khỏi căn bệnh âm thầm này.
          </motion.p>
        </div>
      </section>

      {/* Premium 3-Column Educational Panels (PCF.org Style Mockup) */}
      <section className="px-4 sm:px-6 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 rounded-2xl overflow-hidden shadow-xl">
            
            {/* Card 1: Teal/Mint Background */}
            <motion.div 
              whileHover={{ y: -4 }}
              onClick={() => handlePanelScroll('tam-quan-trong')}
              className="bg-[#a7f3d0]/90 hover:bg-[#a7f3d0] transition-colors p-8 min-h-[340px] flex flex-col justify-between relative overflow-hidden group cursor-pointer"
            >
              {/* Soft overlay pattern */}
              <div className="absolute inset-0 opacity-10 group-hover:scale-105 transition-transform duration-500" style={{
                backgroundImage: 'radial-gradient(circle at 100% 100%, white 0%, transparent 70%)',
              }} />
              
              <div className="space-y-4 relative z-10">
                <div className="w-12 h-12 rounded-xl bg-emerald-700/10 flex items-center justify-center text-emerald-950">
                  <Heart className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-black text-emerald-950 leading-tight">
                  Tầm soát Ung thư Tuyến tiền liệt là gì?
                </h3>
                <p className="text-emerald-900/80 text-sm font-semibold leading-relaxed">
                  Tìm hiểu khái niệm cơ bản, vai trò ngăn ngừa biến chứng nguy hiểm và thời điểm vàng giúp bảo vệ sức khỏe hệ nam học.
                </p>
              </div>

              <div className="flex items-center gap-2 text-emerald-950 font-black text-[13px] tracking-wider uppercase mt-8 relative z-10">
                <span>Xem giải đáp chi tiết</span>
                <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform" />
              </div>

              {/* Muted background illustration placeholder */}
              <div className="absolute right-[-20px] bottom-[-20px] w-40 h-40 bg-emerald-900/5 rounded-full blur-xl pointer-events-none" />
            </motion.div>

            {/* Card 2: Sky Blue Background */}
            <motion.div 
              whileHover={{ y: -4 }}
              onClick={() => handlePanelScroll('xet-nghiem')}
              className="bg-[#bae6fd]/90 hover:bg-[#bae6fd] transition-colors p-8 min-h-[340px] flex flex-col justify-between relative overflow-hidden group cursor-pointer"
            >
              <div className="absolute inset-0 opacity-10 group-hover:scale-105 transition-transform duration-500" style={{
                backgroundImage: 'radial-gradient(circle at 100% 100%, white 0%, transparent 70%)',
              }} />

              <div className="space-y-4 relative z-10">
                <div className="w-12 h-12 rounded-xl bg-sky-700/10 flex items-center justify-center text-sky-950">
                  <Activity className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-black text-sky-950 leading-tight">
                  Ý nghĩa Xét nghiệm & Chẩn đoán thế nào?
                </h3>
                <p className="text-sky-900/80 text-sm font-semibold leading-relaxed">
                  Giải mã chi tiết về chỉ số kháng nguyên đặc hiệu PSA trong máu, phương pháp siêu âm và các ngưỡng cảnh báo lâm sàng.
                </p>
              </div>

              <div className="flex items-center gap-2 text-sky-950 font-black text-[13px] tracking-wider uppercase mt-8 relative z-10">
                <span>Xem giải đáp chi tiết</span>
                <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform" />
              </div>

              <div className="absolute right-[-20px] bottom-[-20px] w-40 h-40 bg-sky-900/5 rounded-full blur-xl pointer-events-none" />
            </motion.div>

            {/* Card 3: Lime Green Background */}
            <motion.div 
              whileHover={{ y: -4 }}
              onClick={() => handlePanelScroll('theo-doi')}
              className="bg-[#ecfccb]/90 hover:bg-[#ecfccb] transition-colors p-8 min-h-[340px] flex flex-col justify-between relative overflow-hidden group cursor-pointer"
            >
              <div className="absolute inset-0 opacity-10 group-hover:scale-105 transition-transform duration-500" style={{
                backgroundImage: 'radial-gradient(circle at 100% 100%, white 0%, transparent 70%)',
              }} />

              <div className="space-y-4 relative z-10">
                <div className="w-12 h-12 rounded-xl bg-lime-750/10 flex items-center justify-center text-lime-950">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-black text-lime-950 leading-tight">
                  Theo dõi sức khỏe & Dự phòng ra sao?
                </h3>
                <p className="text-lime-900/80 text-sm font-semibold leading-relaxed">
                  Cẩm nang xây dựng chế độ dinh dưỡng khoa học, điều chỉnh lối sống lành mạnh giúp ngăn chặn nguy cơ u xơ, viêm tuyến tiền liệt.
                </p>
              </div>

              <div className="flex items-center gap-2 text-lime-950 font-black text-[13px] tracking-wider uppercase mt-8 relative z-10">
                <span>Xem giải đáp chi tiết</span>
                <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform" />
              </div>

              <div className="absolute right-[-20px] bottom-[-20px] w-40 h-40 bg-lime-900/5 rounded-full blur-xl pointer-events-none" />
            </motion.div>

          </div>
        </div>
      </section>

      {/* Main FAQ & Accordion Section */}
      <section id="faq-section" className="max-w-4xl mx-auto px-4 sm:px-6 pb-24 space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-2xl sm:text-4xl font-black text-slate-800 tracking-tight">Hỏi đáp y khoa thường gặp</h2>
          <p className="text-slate-400 text-sm sm:text-base font-semibold">Tìm kiếm nhanh các câu hỏi để nhận lời giải đáp tức thì</p>
        </div>

        {/* Search & Category Filter Controls */}
        <div className="space-y-6">
          <div className="relative rounded-2xl bg-white border border-slate-100 shadow-md p-2 flex items-center">
            <div className="pl-4 text-slate-400">
              <Search size={22} />
            </div>
            <input 
              type="text" 
              placeholder="Nhập từ khóa tìm kiếm (Ví dụ: PSA, độ tuổi, đau đớn...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-3 pr-4 py-3 bg-transparent text-slate-800 font-medium placeholder-slate-400 focus:outline-none text-sm sm:text-base"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="px-3 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors"
              >
                Xóa
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all ${
                  activeCategory === cat.id ? 
                  'bg-blue-600 text-white shadow-lg shadow-blue-100' : 
                  'bg-white text-slate-500 border border-slate-100 hover:border-slate-200 hover:text-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* FAQs Accordion Container */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq) => (
                <motion.div 
                  key={faq.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                    expandedFaq === faq.id ? 
                    'border-blue-100 bg-[#f8fafc] shadow-md shadow-blue-50/50' : 
                    'border-slate-100/80 bg-white hover:border-slate-200 hover:shadow-sm'
                  }`}
                >
                  <button 
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left gap-4"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors duration-300 ${
                        expandedFaq === faq.id ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-400'
                      }`}>
                        <HelpIcon size={16} />
                      </div>
                      <span className="font-black text-sm sm:text-[16px] text-slate-800 leading-tight">
                        {faq.question}
                      </span>
                    </div>
                    <motion.div
                      animate={{ rotate: expandedFaq === faq.id ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-slate-400 flex-shrink-0"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </motion.div>
                  </button>

                  <motion.div 
                    initial={false}
                    animate={{ height: expandedFaq === faq.id ? 'auto' : 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 pt-1 border-t border-slate-100/50 text-slate-500 font-semibold text-xs sm:text-[15px] leading-relaxed whitespace-pre-line">
                      {faq.answer}
                    </div>
                  </motion.div>
                </motion.div>
              ))
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12 rounded-2xl border border-dashed border-slate-200 bg-white space-y-3"
              >
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-400">
                  <AlertCircle size={22} />
                </div>
                <p className="text-slate-500 font-black text-sm">Không tìm thấy câu hỏi phù hợp</p>
                <p className="text-slate-400 text-xs">Vui lòng thử tìm kiếm bằng một từ khóa khác.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Quick Diagnostics PSA Indicator card (extra educational asset) */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl bg-gradient-to-r from-blue-900 to-indigo-950 p-8 text-white relative overflow-hidden shadow-xl"
        >
          <div className="relative z-10 space-y-6">
            <div className="inline-flex px-3 py-1 rounded-full bg-blue-800/60 text-blue-200 text-xs font-bold uppercase tracking-wider">
              Cột mốc chỉ số PSA tham khảo
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              <div className="space-y-1 bg-white/5 p-4 rounded-xl border border-white/10">
                <p className="text-emerald-300 font-black text-lg">Dưới 4.0 ng/ml</p>
                <p className="font-extrabold text-[13px] text-white">Vùng An Toàn</p>
                <p className="text-white/60 text-[11px] font-semibold">Tỷ lệ rủi ro thấp. Nên duy trì khám lại sau 1-2 năm.</p>
              </div>
              <div className="space-y-1 bg-white/5 p-4 rounded-xl border border-white/10">
                <p className="text-amber-300 font-black text-lg">4.0 - 10.0 ng/ml</p>
                <p className="font-extrabold text-[13px] text-white">Vùng Nghi Ngờ</p>
                <p className="text-white/60 text-[11px] font-semibold">Nguy cơ u xơ, viêm hoặc ung thư tuyến tiền liệt.</p>
              </div>
              <div className="space-y-1 bg-white/5 p-4 rounded-xl border border-white/10">
                <p className="text-rose-400 font-black text-lg">Trên 10.0 ng/ml</p>
                <p className="font-extrabold text-[13px] text-white">Vùng Nguy Cơ Cao</p>
                <p className="text-white/60 text-[11px] font-semibold">Cần chẩn đoán chuyên sâu từ bác sĩ chuyên khoa.</p>
              </div>
            </div>

            <div className="pt-2 text-white/50 text-[11px] font-bold italic">
              * Ghi chú: Chỉ số PSA có thể dao động do nhiều nguyên nhân lành tính. Chẩn đoán cuối cùng phải do bác sĩ chỉ định.
            </div>
          </div>

          {/* Decorative backdrop */}
          <div className="absolute right-[-5%] top-[-5%] w-60 h-60 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        </motion.div>
      </section>

      {/* Footer Info */}
      <footer className="w-full border-t border-slate-100 py-8 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-3">
          <p className="text-slate-400 text-xs sm:text-sm font-bold">
            Chương trình tầm soát ung thư tuyến tiền liệt miễn phí cộng đồng - Bệnh viện Trung ương Huế
          </p>
          <p className="text-slate-400 text-[10px] sm:text-xs">
            © 2026 Bản quyền thuộc về Bệnh viện Trung ương Huế. Thiết kế và phát triển phục vụ sức khỏe cộng đồng.
          </p>
        </div>
      </footer>
    </div>
  );
}
