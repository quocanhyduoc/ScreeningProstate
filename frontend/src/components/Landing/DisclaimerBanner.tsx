import React from 'react';
import { Phone, ShieldCheck, Award, Heart } from 'lucide-react';

const TEXTS = {
  companionAndAdvisor: 'Đồng hành & Cố vấn',
  organizersAndCouncil: 'Ban tổ chức & Hội đồng chuyên môn',
  executingUnit: 'Đơn vị thực hiện',
  hueCentralHospital: 'Bệnh viện Trung ương Huế',
  hueCentralHospitalEn: 'Hue Central Hospital',
  advisingUnit: 'Đơn vị cố vấn',
  vunaAssociation: 'Hội Tiết niệu - Thận học Việt Nam',
  vunaAssociationEn: 'VUNA Association',
  sponsorUnit: 'Đơn vị tài trợ',
  astraZenecaVietnam: 'Công ty TNHH AstraZeneca Việt Nam',
  astraZenecaVietnamEn: 'AstraZeneca Vietnam Company Limited.',
  contactDetails: 'Thông tin chi tiết xin liên hệ',
  titlePGS_TS: 'PGS.TS.',
  doctorHung: 'PHẠM NGỌC HÙNG',
  roleHung: 'Trưởng khoa Ngoại Tiết niệu A',
  titleTHS_BS: 'THS.BS.',
  doctorTuan: 'TRƯƠNG MINH TUẤN',
  roleTuan: 'Khoa Ngoại Tiết niệu A',
  programCommitment: 'Cam kết từ chương trình',
  commitmentPart1: 'Chương trình được thực hiện bởi ',
  commitmentPart2: 'Bệnh viện Trung ương Huế',
  commitmentPart3: ', dưới sự cố vấn thực hiện bởi ',
  commitmentPart4: 'Hội Tiết niệu - Thận học Việt Nam',
  commitmentPart5: ' và được tài trợ bởi ',
  commitmentPart6: 'công ty AstraZeneca',
  commitmentPart7: '. Tất cả các xét nghiệm PSA và khám sàng lọc đều hoàn toàn miễn phí cho người dân thuộc đối tượng chỉ định.'
};

export default function DisclaimerBanner() {
  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 mb-12 space-y-10">

      {/* 1. Partners & Sponsors Logos Panel (Moved from Hero Banner) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-50/60 via-white to-sky-50/20 border border-blue-100 shadow-xl p-8 sm:p-10">
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-100/20 rounded-full blur-3xl pointer-events-none -z-10" />

        {/* Section title */}
        <div className="flex flex-col items-center text-center mb-8">
          <span className="px-4 py-1.5 bg-blue-50 text-prostate-navy text-xs font-black uppercase tracking-widest rounded-full mb-3 border border-blue-100/50">
            {TEXTS.companionAndAdvisor}
          </span>
          <h3 className="text-xl md:text-2xl font-black font-display text-prostate-navy uppercase tracking-tight max-w-3xl leading-tight">
            {TEXTS.organizersAndCouncil}
          </h3>
          <div className="w-16 h-1 bg-gradient-to-r from-prostate-orange to-orange-500 rounded-full mt-3" />
        </div>

        {/* Logos Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-stretch">
          {/* Partner 1: Bệnh viện Trung ương Huế */}
          <div className="flex flex-col items-center justify-between p-6 bg-white/70 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-blue-100 group">
            <span className="text-[11px] font-black uppercase tracking-wider text-prostate-navy bg-blue-50 px-3 py-1 rounded-md mb-4 flex items-center gap-1.5 leading-none">
              <Heart size={12} className="text-prostate-navy fill-prostate-navy" /> {TEXTS.executingUnit}
            </span>
            <div className="h-20 flex items-center justify-center mb-4 px-4 w-full">
              <img
                src="/logo-benh-vien-trung-uong-hue-compressed.webp"
                alt="Logo Bệnh viện Trung ương Huế"
                className="max-h-full max-w-[80%] object-contain filter drop-shadow-sm group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="text-center mt-auto">
              <h4 className="text-[14px] font-black text-slate-800 leading-snug group-hover:text-prostate-navy transition-colors uppercase">
                {TEXTS.hueCentralHospital}
              </h4>
              <p className="text-[10px] text-slate-400 font-bold tracking-wider mt-1 uppercase">
                {TEXTS.hueCentralHospitalEn}
              </p>
            </div>
          </div>

          {/* Partner 2: Hội Tiết niệu - Thận học Việt Nam */}
          <div className="flex flex-col items-center justify-between p-6 bg-white/70 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-indigo-100 group">
            <span className="text-[11px] font-black uppercase tracking-wider text-indigo-700 bg-indigo-50 px-3 py-1 rounded-md mb-4 flex items-center gap-1.5 leading-none">
              <Award size={12} className="text-indigo-600" /> {TEXTS.advisingUnit}
            </span>
            <div className="h-20 flex items-center justify-center mb-4 px-4 w-full">
              <img
                src="/logo-vuna.jpg"
                alt="Logo Hội Tiết niệu - Thận học Việt Nam"
                className="max-h-full max-w-[80%] object-contain filter drop-shadow-sm rounded-lg group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="text-center mt-auto">
              <h4 className="text-[14px] font-black text-slate-800 leading-snug group-hover:text-indigo-700 transition-colors uppercase">
                {TEXTS.vunaAssociation}
              </h4>
              <p className="text-[10px] text-slate-400 font-bold tracking-wider mt-1 uppercase">
                {TEXTS.vunaAssociationEn}
              </p>
            </div>
          </div>

          {/* Partner 3: AstraZeneca */}
          <div className="flex flex-col items-center justify-between p-6 bg-white/70 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-emerald-100 group">
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-md mb-4 flex items-center gap-1.5 leading-none">
              <ShieldCheck size={12} className="text-emerald-600" /> {TEXTS.sponsorUnit}
            </span>
            <div className="h-20 flex items-center justify-center mb-4 px-4 w-full">
              <img
                src="/astrazeneca-PNG-logo.webp"
                alt="Logo AstraZeneca"
                className="max-h-full max-w-[90%] object-contain filter drop-shadow-sm group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="text-center mt-auto">
              <h4 className="text-[14px] font-black text-slate-800 leading-snug group-hover:text-emerald-700 transition-colors uppercase">
                {TEXTS.astraZenecaVietnam}
              </h4>
              <p className="text-[10px] text-slate-400 font-bold tracking-wider mt-1 uppercase">
                {TEXTS.astraZenecaVietnamEn}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Contacts and Disclaimer section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">

        {/* Contacts (7 cols) */}
        <div className="lg:col-span-7 relative border-2 border-blue-100/80 rounded-3xl p-6 pt-8 bg-white shadow-xl flex flex-col justify-center">
          {/* Section Header Tag on Top Border */}
          <div className="absolute -top-3.5 left-6 px-4 py-1 bg-gradient-to-r from-prostate-orange to-orange-500 text-white rounded-full text-[11px] font-black uppercase tracking-wider shadow-md">
            {TEXTS.contactDetails}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {/* Contact 1 */}
            <div className="space-y-4">
              <a
                href="tel:0903591678"
                className="inline-flex items-center gap-3 bg-prostate-navy hover:bg-prostate-navy/95 text-white px-5 py-2.5 rounded-full font-display font-black text-base shadow-md transition-all hover:scale-[1.02] active:scale-95 shrink-0"
              >
                <Phone size={16} fill="currentColor" className="text-white shrink-0" />
                <span>090 359 1678</span>
              </a>
              <div className="space-y-1 pl-1">
                <h4 className="text-[15px] leading-tight font-black font-display">
                  <span className="text-prostate-orange mr-1.5">{TEXTS.titlePGS_TS}</span>
                  <span className="text-prostate-navy">{TEXTS.doctorHung}</span>
                </h4>
                <p className="text-xs sm:text-sm text-slate-500 font-extrabold">
                  {TEXTS.roleHung}
                </p>
              </div>
            </div>

            {/* Contact 2 */}
            <div className="space-y-4">
              <a
                href="tel:0708111632"
                className="inline-flex items-center gap-3 bg-prostate-navy hover:bg-prostate-navy/95 text-white px-5 py-2.5 rounded-full font-display font-black text-base shadow-md transition-all hover:scale-[1.02] active:scale-95 shrink-0"
              >
                <Phone size={16} fill="currentColor" className="text-white shrink-0" />
                <span>0708 111 632</span>
              </a>
              <div className="space-y-1 pl-1">
                <h4 className="text-[15px] leading-tight font-black font-display">
                  <span className="text-prostate-orange mr-1.5">{TEXTS.titleTHS_BS}</span>
                  <span className="text-prostate-navy">{TEXTS.doctorTuan}</span>
                </h4>
                <p className="text-xs sm:text-sm text-slate-500 font-extrabold">
                  {TEXTS.roleTuan}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer Text Block (5 cols) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-blue-50/50 via-white to-sky-50/30 border-2 border-prostate-navy/20 rounded-3xl p-6 shadow-xl flex flex-col justify-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-prostate-navy/10 flex items-center justify-center text-prostate-navy shrink-0">
              <ShieldCheck size={22} />
            </div>
            <h4 className="font-display font-black text-prostate-navy text-sm uppercase tracking-wider">
              {TEXTS.programCommitment}
            </h4>
          </div>
          <p className="text-[12.5px] sm:text-[13.5px] text-slate-600 font-bold leading-relaxed text-justify">
            {TEXTS.commitmentPart1}<strong className="text-prostate-navy font-black">{TEXTS.commitmentPart2}</strong>{TEXTS.commitmentPart3}<strong className="text-prostate-navy font-black">{TEXTS.commitmentPart4}</strong>{TEXTS.commitmentPart5}<strong className="text-prostate-navy font-black">{TEXTS.commitmentPart6}</strong>{TEXTS.commitmentPart7}
          </p>
        </div>

      </div>

    </div>
  );
}
