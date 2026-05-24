import React from 'react';
import { MapPin, Phone, Mail, Facebook } from 'lucide-react';

export default function Footer() {
   return (
      <footer className="py-12 border-t border-slate-100 bg-white">
         <div className="max-w-[1440px] mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start mb-8">
               {/* Left Column: Brand & Logo */}
               <div className="space-y-4">
                  <div className="flex items-center gap-4">
                     <img
                        src="/logo-benh-vien-trung-uong-hue-compressed.webp"
                        alt="Logo Bệnh viện Trung ương Huế"
                        className="h-16 w-auto object-contain"
                     />
                     <div>
                        <h4 className="text-[16px] font-black text-blue-900 uppercase leading-snug">Bệnh viện Trung ương Huế</h4>
                        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Hue Central Hospital</p>
                     </div>
                  </div>
                  <p className="text-[12px] text-slate-500 font-semibold max-w-md text-justify leading-relaxed w-full">
                     Chương trình Tầm soát Ung thư Tuyến tiền liệt Cộng đồng 2026.
                  </p>
               </div>

               {/* Right Column: Contact Details */}
               <div className="space-y-3 text-slate-600">
                  <h5 className="text-[13px] font-black text-blue-900 uppercase tracking-wider mb-2">Thông tin liên hệ</h5>

                  <div className="flex items-start gap-3 text-[13px]">
                     <MapPin size={16} className="text-blue-600 shrink-0 mt-0.5" />
                     <span><strong className="font-bold text-slate-700">Địa chỉ:</strong> 16 Lê Lợi - Phường Thuận Hóa - Thành phố Huế</span>
                  </div>

                  <div className="flex items-center gap-3 text-[13px]">
                     <Phone size={16} className="text-blue-600 shrink-0" />
                     <span><strong className="font-bold text-slate-700">Số điện thoại:</strong> +84 - 234 - 3822325</span>
                  </div>

                  <div className="flex items-center gap-3 text-[13px]">
                     <Mail size={16} className="text-blue-600 shrink-0" />
                     <span>
                        <strong className="font-bold text-slate-700">Email:</strong>{' '}
                        <a href="mailto:bvtwhue1894@gmail.com" className="hover:text-blue-600 transition-colors font-medium">
                           bvtwhue1894@gmail.com
                        </a>
                     </span>
                  </div>

                  <div className="flex items-center gap-3 text-[13px]">
                     <Facebook size={16} className="text-blue-600 shrink-0" />
                     <span>
                        <strong className="font-bold text-slate-700">Facebook:</strong>{' '}
                        <a
                           href="https://facebook.com/bvtwhue"
                           target="_blank"
                           rel="noopener noreferrer"
                           className="hover:text-blue-600 transition-colors font-medium"
                        >
                           facebook.com/bvtwhue
                        </a>
                     </span>
                  </div>
               </div>
            </div>

            {/* Bottom Row */}
            <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
               <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                  © 2026 PROSTATE SCREENING PROGRAM. ALL RIGHTS RESERVED.
               </p>
               <div className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
                  Powered by Department of Urology A - Hue Central Hospital
               </div>
            </div>
         </div>
      </footer>
   );
}
