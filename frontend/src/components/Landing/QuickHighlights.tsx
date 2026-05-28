import React from 'react';
import { motion } from 'framer-motion';

interface HighlightCardProps {
  tag: string;
  children: React.ReactNode;
}

function HighlightCard({ tag, children }: HighlightCardProps) {
  return (
    <div className="relative bg-white rounded-2xl border-2 border-blue-100 shadow-xl shadow-blue-50/40 p-6 pt-10 flex flex-col items-center justify-center text-center gap-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-prostate-navy/20 min-h-[140px] w-full">
      {/* Orange category tag centered on the top border */}
      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-5 py-1 bg-gradient-to-r from-prostate-orange to-orange-500 text-white rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-wider shadow-md shadow-orange-500/10 whitespace-nowrap">
        {tag}
      </div>
      {children}
    </div>
  );
}

export default function QuickHighlights() {
  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10 mb-16">
      
      {/* Card 1: Số lượng giới hạn */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex"
      >
        <HighlightCard tag="Số lượng giới hạn">
          <p className="leading-none mt-1">
            <span className="text-4xl md:text-5xl font-black text-prostate-navy font-display tracking-tight">300</span>
            <span className="text-xl md:text-2xl font-black text-slate-600 font-display ml-2">người</span>
          </p>
        </HighlightCard>
      </motion.div>

      {/* Card 2: Thời gian đăng ký */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex"
      >
        <HighlightCard tag="Thời gian đăng ký">
          <p className="text-2xl sm:text-3xl font-black text-prostate-navy font-display tracking-tight leading-none mt-1">
            15 - 29/05/2026
          </p>
        </HighlightCard>
      </motion.div>

      {/* Card 3: Thời gian khám */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="flex"
      >
        <HighlightCard tag="Thời gian khám">
          <div className="space-y-1 mt-1">
            <p className="text-[12px] sm:text-[13px] font-black text-prostate-orange uppercase tracking-wide leading-none">
              Thứ Bảy và Chủ Nhật
            </p>
            <p className="text-2xl sm:text-3xl font-black text-prostate-navy font-display tracking-tight leading-none mt-1">
              30 - 31/05/2026
            </p>
          </div>
        </HighlightCard>
      </motion.div>

      {/* Card 4: Địa điểm khám */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="flex"
      >
        <HighlightCard tag="Địa điểm khám">
          <div className="space-y-1 mt-1">
            <p className="text-[14px] sm:text-[15px] font-black text-prostate-navy font-display leading-tight uppercase tracking-tight">
              Bệnh viện Quốc tế
            </p>
            <p className="text-[14px] sm:text-[15px] font-black text-prostate-navy font-display leading-tight uppercase tracking-tight">
              Trung ương Huế
            </p>
            <p className="text-[11px] sm:text-[12px] text-slate-500 font-extrabold leading-normal mt-1.5">
              Tầng 1, số 03 Ngô Quyền, Huế
            </p>
          </div>
        </HighlightCard>
      </motion.div>

    </div>
  );
}
