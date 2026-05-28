import React from 'react';
import { MapPin, Phone, Mail, Globe, Facebook } from 'lucide-react';

export default function Footer() {
   return (
      <footer className="w-full bg-white border-t border-slate-100">
         {/* Upper Footer branding */}
         <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3 sm:gap-4">
               <img
                  src="/logo-benh-vien-trung-uong-hue-compressed.webp"
                  alt="Logo Bệnh viện Trung ương Huế"
                  className="h-12 w-auto object-contain"
               />
               <div>
                  <h4 className="text-[14px] font-black text-prostate-navy uppercase leading-snug">Bệnh viện Trung ương Huế</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Hue Central Hospital</p>
               </div>
            </div>

            <div className="text-center md:text-right">
               <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                  © 2026 PROSTATE CANCER SCREENING. ALL RIGHTS RESERVED.
               </p>
               <p className="text-[11px] font-black text-prostate-navy uppercase tracking-wider mt-0.5">
                  Phát triển bởi Khoa Ngoại Tiết niệu A - Bệnh viện Trung ương Huế
               </p>
            </div>
         </div>

         {/* Bottom Contact Strip (Matches the dark red/orange bar from the poster) */}
         <div className="bg-prostate-navy text-white py-4 w-full">
            <div className="max-w-[1440px] mx-auto px-4 sm:px-6 flex flex-wrap justify-center lg:justify-between items-center gap-y-3 gap-x-6 text-[12px] sm:text-[13px] font-bold">

               {/* Address */}
               <div className="flex items-center gap-2">
                  <MapPin size={15} className="shrink-0 text-white/90" />
                  <span>16 Lê Lợi, phường Thuận Hoà, TP. Huế</span>
               </div>

               {/* Phone */}
               <div className="flex items-center gap-2">
                  <Phone size={15} className="shrink-0 text-white/90" />
                  <span>+ 84 - 234 - 3822 325</span>
               </div>

               {/* Email */}
               <div className="flex items-center gap-2">
                  <Mail size={15} className="shrink-0 text-white/90" />
                  <a href="mailto:bvtwhue1894@gmail.com" className="hover:underline">bvtwhue1894@gmail.com</a>
               </div>

               {/* Website */}
               <div className="flex items-center gap-2">
                  <Globe size={15} className="shrink-0 text-white/90" />
                  <a href="http://bvtwhue.com.vn" target="_blank" rel="noopener noreferrer" className="hover:underline">bvtwhue.com.vn</a>
               </div>

               {/* Facebook */}
               <div className="flex items-center gap-2">
                  <Facebook size={15} className="shrink-0 text-white/90" />
                  <a href="https://facebook.com/bvtwhue" target="_blank" rel="noopener noreferrer" className="hover:underline">facebook.com/bvtwhue</a>
               </div>

            </div>
         </div>
      </footer>
   );
}
