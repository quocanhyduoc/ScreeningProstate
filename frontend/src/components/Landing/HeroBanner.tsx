import React, { useState } from 'react';
 
export default function HeroBanner() {
  const [hasError, setHasError] = useState(false);

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-8">
       {/* Container với tỉ lệ chuẩn, bo góc và đổ bóng chuyên nghiệp */}
       <div className={`relative w-full max-w-[1024px] mx-auto aspect-[1024/300] md:h-[300px] bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-100 group ${
         hasError ? 'bg-gradient-to-r from-blue-600 to-blue-800 flex items-center justify-center' : ''
       }`}>
          {hasError ? (
            <div className="text-center text-white p-6">
              <h2 className="text-2xl md:text-4xl font-black mb-2 uppercase tracking-tighter">Bệnh viện Trung ương Huế</h2>
              <p className="text-sm md:text-xl font-bold opacity-80">Giỏi y thuật - Sáng y đức - Gương mẫu mực - Vì sức khỏe nhân dân</p>
            </div>
          ) : (
            <>
              <img 
                src="/banner BVQT.jpg" 
                alt="Bệnh viện Quốc tế Trung ương Huế" 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
                onError={() => setHasError(true)}
              />
              {/* Overlay mờ nhẹ để bảo vệ thị giác và tạo chiều sâu */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
            </>
          )}
       </div>
    </div>
  );
}
