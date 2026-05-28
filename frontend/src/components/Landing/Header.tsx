import React, { useState } from 'react';
import { PlayCircle, FileText, ChevronRight, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function Header({ scrollToForm }: { scrollToForm: () => void }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 w-full bg-white/95 backdrop-blur-md z-50 border-b border-slate-100 shadow-sm">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
         {/* Logo and Brand */}
         <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-lg flex items-center justify-center p-1 border border-slate-100 shrink-0">
               <img src="/logo-benh-vien-trung-uong-hue-compressed.webp" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <Link href="/" className="hover:opacity-90 transition-opacity">
               <h1 className="text-[14px] sm:text-[15px] font-black font-display text-prostate-navy leading-none uppercase tracking-tight">CHƯƠNG TRÌNH TẦM SOÁT UNG THƯ TUYẾN TIỀN LIỆT 2026</h1>
               <p className="text-[10px] sm:text-[11px] font-bold text-prostate-orange uppercase tracking-widest mt-1">Bệnh viện Trung ương Huế</p>
            </Link>
         </div>

         {/* Navigation Actions */}
         <div className="flex items-center gap-2 sm:gap-6">
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-6">
               <Link href="/quy-trinh" className="text-[13px] font-bold text-slate-600 hover:text-prostate-navy transition-colors flex items-center gap-2">
                 <PlayCircle size={18} className="text-prostate-navy" /> Xem quy trình sàng lọc
               </Link>
               <Link href="/truyen-thong" className="text-[13px] font-bold text-slate-600 hover:text-prostate-navy transition-colors flex items-center gap-2">
                 <FileText size={18} className="text-prostate-navy" /> Thông tin truyền thông
               </Link>
            </nav>

            {/* CTA Register Button */}
            <button 
              onClick={() => {
                setIsOpen(false);
                scrollToForm();
              }}
              className="px-3 sm:px-6 py-2 sm:py-2.5 bg-prostate-orange text-white rounded-xl font-black text-[12px] sm:text-[13px] hover:bg-prostate-orange/95 transition-all shadow-lg shadow-prostate-orange/15 flex items-center gap-1 sm:gap-2 active:scale-[0.98]"
            >
               Đăng ký ngay <ChevronRight size={15} />
            </button>

            {/* Mobile Hamburger toggle */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 text-slate-500 hover:text-prostate-navy hover:bg-slate-50 rounded-lg transition-colors flex items-center justify-center"
              aria-label="Toggle navigation menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
         </div>
      </div>

      {/* Mobile Drawer menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden w-full bg-white border-b border-slate-100 shadow-lg overflow-hidden absolute top-20 left-0"
          >
            <div className="px-6 py-5 space-y-4">
              <Link 
                href="/quy-trinh" 
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 py-3.5 px-4 rounded-xl text-[14px] font-black text-slate-700 hover:text-prostate-navy hover:bg-prostate-navy/5 transition-all"
              >
                <PlayCircle size={20} className="text-prostate-navy" />
                <span>Xem quy trình sàng lọc</span>
              </Link>
              <Link 
                href="/truyen-thong" 
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 py-3.5 px-4 rounded-xl text-[14px] font-black text-slate-700 hover:text-prostate-navy hover:bg-prostate-navy/5 transition-all"
              >
                <FileText size={20} className="text-prostate-navy" />
                <span>Thông tin truyền thông</span>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
